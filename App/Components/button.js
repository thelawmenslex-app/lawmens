import { Pressable, StyleSheet, Text, View } from "react-native";
import { borderradius, deviceheight } from "../Utilities/Dimensions";
import { Fonts } from "../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { colors } from "../Utilities/colors";

export default function Custombutton ({title,onpress,border,top,width}) {
    const style = styles(top,width)
   return(
    <Pressable onPress={() => onpress()} style={border ? style.withborder:style.withbg} >
         <Text style={{color:border ? "#000": colors.text,fontFamily:Fonts.Medium,fontSize:RFValue(14),textAlign:"center"}} >{title}</Text>
    </Pressable>
   )
} 

const styles =(top,width) => StyleSheet.create({
    withbg:{
        width:width ? width : "90%",alignSelf:"center",height:deviceheight*0.065,backgroundColor:colors.primary,justifyContent:"center",borderRadius:borderradius*0.5,marginTop:top? top :0
    },
    withborder:{
        width:width ? width :"90%",alignSelf:"center",height:deviceheight*0.065,justifyContent:"center",borderRadius:borderradius*0.5,borderWidth:0.5,borderColor:"#747474",marginTop:top? top :0
    }
})