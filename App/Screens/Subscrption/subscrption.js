import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Commonheader from "../../Components/Commonheader";
import MyStatusBar from "../../Utilities/statusbar";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { deviceheight, devicewidth } from "../../Utilities/Dimensions";
import { useEffect, useState } from "react";
import Custombutton from "../../Components/button";

import Splash from '../../Assets/Icons/splash.svg'
import { colors } from "../../Utilities/colors";
import { Images, shownegativemessage, showpostivemessage } from "../../Utilities/assets";
import axios from "axios";
import { backendroutes } from "../../Actions/constant";
import { useDispatch, useSelector } from "react-redux";
import { helperSelector } from "../../Slices/helper";
import { Getplan } from "../../Slices/profile";


export default function Subscription(props) {
    const [tabbar, setTabbar] = useState(false)
    const [plans, setPlans] = useState([])
    const [selectedindex, setSelectedindex] = useState(0)

    const [loader, setLoader] = useState(false)
    const [planloader, setPlanloader] = useState(false)
    const dispatch = useDispatch()

    const payfn = async () => {
        Alert.alert('Hold on!', 'Are you sure you want to purchase this plan?', [
            {
                text: 'Cancel',
                onPress: () => null,
                style: 'cancel',
            },
            { text: 'YES', onPress: () => purchasefn() },
        ]);
        return true;

    }

    const purchasefn = async () => {
        if (selectedindex < -1) {
            shownegativemessage("Failure!", "Choose any one plan to payment process", 1000)
        }
        else {
            setLoader(true)
            var selectplan = plans[selectedindex]
            var payload = {
                planId: selectplan?._id
            }
            const response = await axios({
                url: `${backendroutes.plansubscribe}`,
                method: "post",
                data: payload,
                headers: {
                    Authorization: authtoken
                }
            })
            setLoader(false)
            if (response?.data?.status) {
                props?.navigation?.navigate("Paymentdeatils")
                showpostivemessage("Success!", "Plan subscribed successfully", 3000)
                dispatch(Getplan(authtoken))
            }
            console.log(response?.data, "RESPONSEW");
        }
    }
    useEffect(() => {
        initial()
    }, [])
    const { authtoken } = useSelector(helperSelector)
    const initial = async () => {
        try {
            console.log(`${backendroutes.subscription}`, "URL");
            console.log(`${authtoken}`, "authtoken");
            setPlanloader(true)
            const response = await axios({
                method: "get",
                url: `${backendroutes.subscription}`,
                headers: {
                    Authorization: authtoken
                }
            })
            setPlans(response?.data?.data)
            setPlanloader(false)

            console.log(response?.data, "RESPONSEEEEEEEEEEEEEEEEEEEEEEEE");
        } catch (error) {
            console.log(error, "planlisterr");
        }
    }
    return (
        <View style={{ flex: 1, }} >
            <MyStatusBar backgroundColor={"#111111"} barstyle={"light-content"} />
            <Commonheader title={"Subcrption"} onpress={() => props?.navigation?.goBack()} home={false} />
            {!planloader ?
                <View style={{ height: "60%", marginVertical: "5%", alignSelf: "center", paddingHorizontal: 20, width: "100%" }} >
                    <Text style={{ color: colors.text, fontFamily: Fonts.Medium, fontSize: RFValue(13), textAlign: "center" }}>To Get Unlimited content viewing pick the below plans</Text>
                    <ScrollView showsVerticalScrollIndicator ={false}  >
                        {plans?.map((e, i) => (
                            <>
                            <Pressable onPress={() => setSelectedindex(i)} style={selectedindex == i ? style.activecontainer : style.container} >
                                <View style={{ width: "30%" }} >
                                    <Image style={{ alignSelf: "center", width: devicewidth * 0.15, height: devicewidth * 0.15 }} source={Images.splash1} />
                                    {/* <Splash width={devicewidth * 0.15} height={devicewidth * 0.15} style={{ alignSelf: "center" }} /> */}
                                </View>
                                <View style={{ width: "70%" }} >
                                    <Text style={{ color: colors.text, fontFamily: Fonts.Semibold, fontSize: RFValue(14) }}>{e?.name}</Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", width: "100%", marginTop: "2.5%" }} >
                                        <View style={{ width: "35%", }} >
                                            <Text style={{ color: colors.text, fontFamily: Fonts.Regular, fontSize: RFValue(13) }} >Total Days</Text>
                                        </View>
                                        <View style={{ width: "5%", }} >
                                            <Text style={{ color: colors.text, fontFamily: Fonts.Regular, fontSize: RFValue(13) }} >:</Text>
                                        </View>
                                        <View style={{ width: "65%", }} >
                                            <Text style={{ color: colors.text, fontFamily: Fonts.Semibold, fontSize: RFValue(13) }} >life time pack</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: "row", alignItems: "center", width: "100%", marginTop: "2.5%" }} >
                                        <View style={{ width: "35%", }} >
                                            <Text style={{ color: colors.text, fontFamily: Fonts.Regular, fontSize: RFValue(13) }} >Amount</Text>
                                        </View>
                                        <View style={{ width: "5%", }} >
                                            <Text style={{ color: colors.text, fontFamily: Fonts.Regular, fontSize: RFValue(13) }} >:</Text>
                                        </View>
                                        <View style={{ width: "65%", }} >
                                            <Text style={{ color: colors.text, fontFamily: Fonts.Semibold, fontSize: RFValue(13) }} >₹ {e?.price}</Text>
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                            <Text style={{ color: colors.text, fontFamily: Fonts.Semibold, fontSize: RFValue(13),marginTop:"4%" }} >Plan Details</Text>
                            <Text style={{ color: colors.text, fontFamily: Fonts.Regular, fontSize: RFValue(13),marginTop:"2%" }} >{e?.description}</Text>

                            </>
                        ))}
                    </ScrollView>
                </View> :
                <View style={{ height: "55%", marginVertical: "5%", alignSelf: "center", paddingHorizontal: 20, width: "100%", justifyContent: "center" }} >
                    <ActivityIndicator color={"#000"} style={{ alignSelf: "center" }} />
                </View>
            }
            <View style={{ height: "10%", alignSelf: "center", }} >
                <Custombutton
                    title={"Pay"}
                    width={devicewidth * 0.6}
                    onpress={() => payfn()}
                />
            </View>


            <Modal
                visible={loader}
                transparent={true}
            >
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" }} >
                    <View style={{ width: "80%", backgroundColor: "#fff", borderRadius: 10, paddingVertical: 30, alignSelf: "center" }} >
                        <ActivityIndicator size={"small"} color={"#000"} style={{ alignSelf: "center", }} />
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const style = StyleSheet.create({
    activecontainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.secondary,
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: "5%",
        alignSelf: "center",
        borderWidth: 2,
        borderColor: colors.primary,

    },
    container: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        elevation: 1,
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: "5%",
        alignSelf: "center",


    }
})