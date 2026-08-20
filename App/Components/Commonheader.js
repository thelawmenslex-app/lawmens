import { Pressable, Text, View } from "react-native";
import { Images } from "../Utilities/assets";
import LinearGradient from "react-native-linear-gradient";
import { borderradius, deviceheight, devicewidth } from "../Utilities/Dimensions";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/Ionicons'
import { Fonts } from "../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { colors } from "../Utilities/colors";



export default function Commonheader({ title, onpress, home }) {
    const navigation = useNavigation()
    console.log(home);
    return (
        <View style={{ borderBottomLeftRadius: borderradius * 1, borderBottomRightRadius: borderradius * 1, backgroundColor:colors.primary , height: deviceheight * 0.225 }} >
            <LinearGradient colors={["#111111", "#313131"]}  style={{ borderBottomLeftRadius: borderradius * 1, borderBottomRightRadius: borderradius * 1, paddingHorizontal: deviceheight * 0.025, justifyContent: "center", height: "60%" }} >
                <View style={{ alignItems: "center", marginTop: "2.5%", flexDirection: "row", justifyContent: "center" }} >
                    {/* {Images.lawtextwhite} */}
                    <Text style={{ color: colors.primary, fontFamily: Fonts.Extrabold, fontSize: RFValue(20) }} >THE-LAWMEN'S</Text>
                    <Pressable onPress={() => onpress()} style={{ width: devicewidth * 0.1, height: devicewidth * 0.1, backgroundColor:colors.primary, justifyContent: "center", borderRadius: borderradius * 2, position: "absolute", left: 0, }} >
                        <Icon name={"arrow-back"} size={devicewidth * 0.06} color={colors.text} style={{ alignSelf: "center" }} />
                    </Pressable>
                    {home &&
                        <Pressable onPress={() => navigation.navigate("Homemodule")} style={{ width: devicewidth * 0.1, height: devicewidth * 0.1, backgroundColor:colors.primary, justifyContent: "center", borderRadius: borderradius * 2, position: "absolute", right: 0, }} >
                            {Images.home}
                        </Pressable>}
                </View>
            </LinearGradient>
            <View style={{ justifyContent: "center", height: "40%", alignItems: "center" }} >
                <Text style={{ color:colors.text, fontFamily: Fonts.Medium, fontSize: RFValue(14), textAlign: "center",paddingHorizontal:10 }}  >{title }</Text>
            </View>
        </View>
    )
}