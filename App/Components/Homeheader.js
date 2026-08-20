import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { borderradius, deviceheight, devicewidth } from "../Utilities/Dimensions";
import { Fonts } from "../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import LinearGradient from "react-native-linear-gradient";
import { Images } from "../Utilities/assets";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/Ionicons'
import Bookselect from "./bookselect";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { update_helper } from "../Slices/helper";
import { profileSelector, update_profile } from "../Slices/profile";
import { colors } from "../Utilities/colors";

export default function Homeheader({ title, onpress, border, top, width }) {
    const style = styles(top, width)
    const navigation = useNavigation()
    const dispatch = useDispatch()

    const { categories } = useSelector(profileSelector)
    const count = categories?.filter((e) => e.status)
    const searchfn = () => {
        dispatch(update_profile({ key: "Updateselectedcat", value: categories[0] }))
        navigation?.navigate("Filtersearch")
    }
    return (
        <LinearGradient colors={["#111111", "#313131"]} onPress={() => onpress()} style={{ height: "20%", borderBottomLeftRadius: borderradius * 1, borderBottomRightRadius: borderradius * 1, paddingHorizontal: deviceheight * 0.025, justifyContent: "center" }} >
            <View style={{ width: "100%", alignItems: "center", flexDirection: "row", width: "100%",  }} >
                <View style={{width: "15%",}} >
                    <Pressable onPress={() => navigation.openDrawer()} style={{ width: devicewidth * 0.115, height: devicewidth * 0.115, backgroundColor:colors.primary, justifyContent: "center", borderRadius: borderradius * 2 }} >
                        {Images.menu}
                    </Pressable>
                </View>
                <View style={{ width: "70%", alignItems: "center" }} >
                    {/* {Images.lawtextwhite} */}
                    <Text style={{color:colors.primary,fontFamily:Fonts.Extrabold,fontSize:RFValue(20)}} >THE-LAWMEN'S</Text>

                </View>
                <View style={{ width: "15%", }} >
                    <Pressable onPress={() => searchfn()} style={{ width: "100%", justifyContent: "center", marginLeft: "10%" }} >
                        <Icon size={devicewidth * 0.06} color={"#fff"} name={"search"} style={{ alignSelf: "center" }} />
                    </Pressable>
                </View>
            </View>
            {/* <View style={{ width: "100%", flexDirection: "row", alignItems: "center", height: deviceheight * 0.065, borderRadius: borderradius * 0.5, borderWidth: 0.5, borderColor: "gray", backgroundColor: "#2A2A2A" }} >
                <Pressable onPress={() => dispatch(update_helper({key:"setBookselect",value:true}))}  style={{ width: "35%", alignItems: "center", borderColor: 'gray', borderRightWidth: 0.5, height: "100%", justifyContent: "center" }} >
                    <View style={{ paddingHorizontal: devicewidth * 0.03, flexDirection: "row" }} >
                        <View style={{ width: "80%" }} >
                            <Text style={{ color: "#fff", fontFamily: Fonts.Regular, fontSize: RFValue(15), width: "90%", marginLeft: "2.5%", }} numberOfLines={1} >All {count?.length > 0 && `(`+(count?.length)+`)`}</Text>
                        </View>
                        <View style={{ width: "20%", justifyContent: "center",alignItems:"center" }} >
                            <Icon size={devicewidth * 0.05} color={"#fff"} name={"caret-down-outline"} />
                        </View>
                    </View>
                </Pressable>

                <Pressable onPress={() => navigation.navigate("Chapterlist")} style={{ width: "65%", alignItems: "center", height: "100%",flexDirection:"row"}} >
                    <View style={{ width: "80%", justifyContent: "center", height: "100%" }} >
                        <Text style={{ color: "gray", fontFamily: Fonts.Regular, fontSize: RFValue(15), width: "90%", marginLeft: "2.5%",textAlign:"center" }} numberOfLines={1} >Search document</Text>
                    </View>
                    <View style={{ width: "20%", justifyContent: "center", height: "100%" }} >
                        <Icon size={devicewidth * 0.05} color={"#fff"} name={"search"} style={{alignSelf:"center"}} />

                    </View>
                </Pressable>
            </View> */}
        </LinearGradient>
    )
}

const styles = (top, width) => StyleSheet.create({
    withbg: {
        width: width ? width : "90%", alignSelf: "center", height: deviceheight * 0.065, backgroundColor:colors.primary, justifyContent: "center", borderRadius: borderradius * 0.5, marginTop: top ? top : 0
    },
    withborder: {
        width: width ? width : "90%", alignSelf: "center", height: deviceheight * 0.065, justifyContent: "center", borderRadius: borderradius * 0.5, borderWidth: 0.5, borderColor: "#747474", marginTop: top ? top : 0
    }
})