import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { borderradius, deviceheight, devicewidth } from "../Utilities/Dimensions";
import { Fonts } from "../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { useState } from "react";
import Eyeicon from 'react-native-vector-icons/Ionicons'
import { colors } from "../Utilities/colors";
export default function Inputbox({ title, onpress, border, top,width,password,returntext,text,placeholder,numberpad }) {
    const style = styles(top)
    const[eye,setEye] = useState(false)
    return (
        <>
            <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(12), color: "#000", marginTop:top ? top :0 }} >{title}</Text>
            <View style={{
                width:width, alignSelf: "center", height: deviceheight * 0.065, justifyContent: "center", borderRadius: borderradius * 0.3, marginTop:"3%", borderWidth: 0.5, borderColor: "#747474", flexDirection: "row"
            }} >
                <View style={{ width:password ? "85%" :"100%", justifyContent: "center",paddingHorizontal:devicewidth*0.03 }} >
                    {numberpad ? 
                     <TextInput
                     placeholder={placeholder}
                     placeholderTextColor={"gray"}
                     style={{  fontFamily: Fonts.Regular, color: "#000", fontSize: RFValue(13) }}
                     onChangeText={(text) => returntext(text)}
                     value={text}
                     secureTextEntry={eye}
                     keyboardType="numeric"
                 />:
                    <TextInput
                        placeholder={placeholder}
                        placeholderTextColor={"gray"}
                        style={{  fontFamily: Fonts.Regular, color: "#000", fontSize: RFValue(13) }}
                        onChangeText={(text) => returntext(text)}
                        value={text}
                        secureTextEntry={eye}
                    />}
                </View>
                {password &&
                <Pressable onPress={() => setEye(!eye)}  style={{ width: "15%", alignItems: "center", justifyContent: "center" }} >
                   <Eyeicon name ={!eye ? "eye-off-outline" :"eye-outline"} size={devicewidth*0.055} color={"#000"} /> 
                </Pressable>}
            </View>
        </>
    )
}

const styles = (top) => StyleSheet.create({
    withbg: {
        width: "90%", alignSelf: "center", height: deviceheight * 0.065, backgroundColor:colors.primary, justifyContent: "center", borderRadius: borderradius * 0.5, marginTop: top ? top : 0
    },
    withborder: {
        width: "90%", alignSelf: "center", height: deviceheight * 0.065, justifyContent: "center", borderRadius: borderradius * 0.5, borderWidth: 0.5, borderColor: "#747474", marginTop: top ? top : 0
    }
})