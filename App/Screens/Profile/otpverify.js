

import { ActivityIndicator, Keyboard, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import MyStatusBar from "../../Utilities/statusbar";
import { borderradius, deviceheight, devicewidth } from "../../Utilities/Dimensions";
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from "../../Utilities/fonts";
import { useDispatch, useSelector } from "react-redux";
import Arrow from 'react-native-vector-icons/MaterialIcons'
import { Images, shownegativemessage, showpostivemessage } from "../../Utilities/assets";
import Bookselect from "../../Components/bookselect";
import { useEffect, useState } from "react";
import Commonheader from "../../Components/Commonheader";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';   //https://www.npmjs.com/package/react-native-image-picker
import Toast from 'react-native-simple-toast';
import Custombutton from "../../Components/button";
import Inputbox from "../../Components/inputbox";
import { backendroutes } from "../../Actions/constant";
import axios from "axios";
import Buttonloader from "../../Components/buttonloader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Getprofile, update_profile } from "../../Slices/profile";



export default function Otpverify(props) {
    const dispatch = useDispatch()
    const [active, setActive] = useState(false)



    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const openmedia = async () => {
        try {
            launchImageLibrary(options, (response) => {
                if (response.didCancel) {
                    Toast.show('cancelled', Toast.SHORT);
                    return;
                } else if (response.errorCode === 'camera_unavailable') {
                    Toast.show('Camera not available on device', Toast.SHORT);
                    return;
                } else if (response.errorCode === 'permission') {
                    Toast.show('Permission not satisfiedr', Toast.SHORT);
                    return;
                } else if (response.errorCode === 'others') {
                    Toast.show(response.errorMessage, Toast.SHORT);
                    return;
                } else {
                    // setFormvalue((prevFormData) => ({
                    //     ...prevFormData,
                    //     [key]: response.assets[0]
                    // }));
                    // setFilePath(response.assets[0].uri);
                }
            });

        } catch (error) {

        }
    }

    const [otp, setOtp] = useState(false)

    const [resendloader, setResendloader] = useState(false)
    const { formvalue } = props?.route?.params
    const resendfn = async () => {
        try {
            const token = await AsyncStorage.getItem("token")

            setResendloader(true)
            var send = {
                "type": "send",
                "email": formvalue?.email
            }
            const response = await axios({
                method: "post",
                url: `${backendroutes.profileverification}`,
                data: send,
                headers: {
                    Authorization: token
                }
            })
            setResendloader(false)

            if (response?.data?.status) {
                showpostivemessage("Success!", response?.data?.message, 2000)
            }
            else {
                shownegativemessage("Failure", response?.data?.message, 2000)
            }
        } catch (error) {
            setResendloader(false)
            console.log("resendfn", error);
        }
    }

    const [loader, setLoader] = useState(false)

    const verify = async () => {
        try {
            const token = await AsyncStorage.getItem("token")

            setLoader(true)
            var payload = {
                "type": "verify",
                "email": formvalue?.email,
                "otp": otp
            }
            console.log(payload, "PAYLOAD");
            const response = await axios({
                method: "post",
                url: `${backendroutes.profileverification}`,
                data: payload,
                headers: {
                    Authorization: token
                }
            })
            if (response?.data?.status) {
                showpostivemessage("Verified!", "Your Email is verified", 2000)
                console.log(formvalue);
                const result = await axios({
                    url: `${backendroutes.getprofile}`,
                    method: "put",
                    data: formvalue,
                    headers: {
                        Authorization: token
                    }
                })
                setLoader(false)

                if (result?.data?.status) {
                    showpostivemessage("Success", result?.data?.message, 2000)
                    props?.navigation?.goBack()
                    dispatch(Getprofile(token))
                }
                else {
                    shownegativemessage("Failure", result?.data?.message, 2000)
                    props?.navigation?.goBack()

                }

            }


            else {
                setLoader(false)
                shownegativemessage("Failure!", response?.data?.message, 2000)
                setOtp("")
            }
        } catch (error) {
            setLoader(false)
            shownegativemessage("Server", error?.message, 2000)
            console.log(error, "OTPVERIFU");
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }} >
            <MyStatusBar backgroundColor={"#111111"} barstyle={"light-content"} />

            <Commonheader title={"Otp Verify"} home={false} onpress={() => props.navigation.goBack()} />



            <View style={{ height: deviceheight * 0.55, paddingHorizontal: devicewidth * 0.05, paddingVertical: "10%" }} >
                <Inputbox
                    title={"OTP"}
                    text={otp}
                    placeholder={"Enter Otp"}
                    returntext={(text) => setOtp(text)}
                    numberpad={true}
                />

                <Pressable disabled={resendloader} style={{ width: "20%", height: deviceheight * 0.05, marginTop: "4%", alignSelf: "flex-end" }} onPress={() => resendfn()} >
                    {resendloader ?
                        <ActivityIndicator size={"small"} color={"#000"} style={{ alignSelf: "center" }} /> :
                        <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(11), color: "#000", textAlign: "center", }} >Resend</Text>}
                </Pressable>

                <View style={{ height: deviceheight * 0.1, paddingHorizontal: devicewidth * 0.05, marginTop: "10%" }} >
                    {loader ?
                        <Buttonloader /> :
                        <Custombutton onpress={() => verify()} title={"Verify"} />
                    }
                </View>
            </View>


        </View>
    )
}