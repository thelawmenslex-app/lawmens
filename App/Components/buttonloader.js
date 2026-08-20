import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { borderradius, deviceheight } from "../Utilities/Dimensions";
import { Fonts } from "../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { colors } from "../Utilities/colors";

export default function Buttonloader ({title,onpress,border,top,width}) {
    const style = styles(top,width)
   return(
    <View onPress={() => onpress()} style={border ? style.withborder:style.withbg} >
                <ActivityIndicator size={"small"} color={colors.text} style={{alignSelf:"center"}} />
    </View>
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