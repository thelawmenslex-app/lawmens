import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { borderradius, deviceheight, devicewidth } from "../Utilities/Dimensions";
import { Fonts } from "../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { Images } from "../Utilities/assets";
import Icon from 'react-native-vector-icons/MaterialIcons'
import Arrow from 'react-native-vector-icons/Ionicons'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { profileSelector, update_profile } from "../Slices/profile";
import { update_helper } from "../Slices/helper";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { colors } from "../Utilities/colors";
import Alerticon from 'react-native-vector-icons/Ionicons'
import Privacyicon from 'react-native-vector-icons/MaterialIcons'
import { EventRegister } from "react-native-event-listeners";

export default function Drawerscreen(props) {

    const dummy = [
        {
            icon: Images.userdetail,
            title: "Contact us"
        },
        // {
        //     icon: Images.whitehistory,
        //     title: "History"
        // },
        // {
        //     icon: <Icon name={"payment"} color={"#fff"} size={devicewidth * 0.06} style={{ alignSelf: "center" }} />,
        //     title: "Plan Details"
        // },
         {
            icon: Images.About,
            title: "About"
        },

        // {
        //     icon: <Image source={Images.subscribe} style={{ width: devicewidth * 0.06, height: devicewidth * 0.06, alignSelf: "center", tintColor: "#fff" }} />,
        //     title: "Subscription"
        // },

        {
            icon: <Alerticon name={"alert-circle-outline"} size={devicewidth * 0.07} color={"#fff"} />,
            title: "Disclaimer"
        },
        {
            icon: <Privacyicon name={"privacy-tip"} size={devicewidth * 0.065} color={"#fff"} />,
            title: "Privacy Policy"
        },
    ]
    const dispatch = useDispatch()

    const logoutfn = () => {
        Alert.alert('Logout', 'Are you sure want to logout?', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'OK', onPress: async () => logout()
            },
        ]);
    }

    const logout = async () => {
        try {
            await GoogleSignin.signOut()
            props?.navigation?.closeDrawer()
            AsyncStorage.removeItem("token")
            dispatch(update_profile({ key: "setAuthtoken", value: "" }))
            dispatch(update_helper({ key: "setProfile", value: "" }))
            var paln = {
                currentplan:[],
                upcommingplan:[]
            }
            dispatch(update_profile({ key: "setProfile", value: paln }))

            props.navigation.navigate("Welcome")
        } catch (error) {
            console.log(error, "err");
        }
    }
    const { profiledata } = useSelector(profileSelector)
    console.log(profiledata);
    const navi = async (index) => {
        if (index == 0) {
            props?.navigation?.navigate("Contactus")
            // props?.navigation?.closeDrawer()
        }
        // if (index == 1) {
        //     props?.navigation?.navigate("Paymentdeatils")
        //     // props?.navigation?.closeDrawer()
       // }
        if (index == 1) {
            props?.navigation?.navigate("About")
            // props?.navigation?.closeDrawer()
        }
        // if (index == 3) {
        //     props?.navigation?.navigate("Subscription")
        //     // props?.navigation?.closeDrawer()
        // }
        if (index == 2) {
            props?.navigation?.navigate("Disclaimer")

        }
        if (index == 3) {
            props?.navigation?.navigate("Privacy")

        }

    }

    const profilenav = () => {
        EventRegister.emit("navigationflag",true)
    }
    return (
        <View style={{ height: "100%", backgroundColor: "#2B2B2B" }} >
            <View style={{ height: deviceheight * 0.25, borderBottomWidth: 0.5, borderBottomColor: "gray", justifyContent: "center", paddingHorizontal: devicewidth * 0.03 }} >
                <View style={{ width: "100%", alignItems: "center", flexDirection: "row", marginTop: "15%" }} >
                    <Pressable onPress={() => profilenav()} style={{ width: "25%" }} >
                        <View style={{ width: devicewidth * 0.175, height: deviceheight * 0.09,justifyContent:"center" }} >
                            {/* {Images.profile} */}
                            <Image source={Images.man} style={{ width: "80%", height: "80%", borderRadius: borderradius * 1, alignSelf: "center" }} />

                        </View>
                    </Pressable>
                    <Pressable onPress={() => profilenav()} style={{ width: "60%" }} >
                        <Text style={{ color: "#fff", fontFamily: Fonts.Regular, fontSize: RFValue(17), width: "90%", marginLeft: "2.5%" }} >{profiledata?.firstName}</Text>
                        <Text style={{ color: "#ABABAB", fontFamily: Fonts.Regular, fontSize: RFValue(13), marginTop: "2.5%", width: "90%", marginLeft: "2.5%" }} >{profiledata?.phoneNumber}</Text>
                    </Pressable>
                    <Pressable onPress={() => props?.navigation.closeDrawer()} style={{ width: devicewidth * 0.105, height: devicewidth * 0.105, backgroundColor: colors.primary, justifyContent: "center", borderRadius: borderradius * 2 }} >
                        <Icon name={"close"} size={devicewidth * 0.065} color={"#000"} style={{ alignSelf: "center" }} />
                    </Pressable>
                </View>
            </View>
            <View style={{ height: deviceheight * 0.75, paddingHorizontal: devicewidth * 0.05, paddingVertical: devicewidth * 0.025 }} >
                {dummy?.map((e, i) => (
                    <Pressable onPress={() => navi(i)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: devicewidth * 0.02, marginTop: "10%" }} >
                        <View style={{ width: "10%", justifyContent: "center" }} >
                            {e?.icon}
                        </View>
                        <View style={{ width: "80%", justifyContent: "center" }} >
                            <Text style={{ color: "#fff", fontFamily: Fonts.Regular, fontSize: RFValue(17), width: "90%", marginLeft: "5%" }} >{e?.title}</Text>
                        </View>
                        <View style={{ width: "10%", justifyContent: "center" }} >
                            <Arrow name={"arrow-forward-sharp"} size={devicewidth * 0.065} color={"#fff"} style={{ alignSelf: "center" }} />
                        </View>
                    </Pressable>))}
            </View>
            {/* <View style={{width: "80%",alignSelf:"center",height:50,backgroundColor:"red"}} >

            </View> */}
            <Pressable onPress={() => logoutfn()} style={{ flexDirection: "row", alignItems: "center", height: deviceheight * 0.075, position: "absolute", bottom: "2.5%", backgroundColor: colors.primary, width: "85%", alignSelf: "center", paddingHorizontal: devicewidth * 0.03, borderRadius: borderradius * 0.5 }} >
                {Images?.logout}
                <Text style={{ color: "#000", fontFamily: Fonts.Regular, fontSize: RFValue(17), width: "90%", marginLeft: "5%" }} >Logout</Text>

            </Pressable>
        </View>
    )
}

const styles = (top, width) => StyleSheet.create({
    withbg: {
        width: width ? width : "90%", alignSelf: "center", height: deviceheight * 0.065, backgroundColor: colors.primary, justifyContent: "center", borderRadius: borderradius * 0.5, marginTop: top ? top : 0
    },
    withborder: {
        width: width ? width : "90%", alignSelf: "center", height: deviceheight * 0.065, justifyContent: "center", borderRadius: borderradius * 0.5, borderWidth: 0.5, borderColor: "#747474", marginTop: top ? top : 0
    }
})