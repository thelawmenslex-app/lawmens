import FlashMessage from "react-native-flash-message";
import { Fonts } from "./fonts";
import { RFValue } from "react-native-responsive-fontsize";



export default function Flashmessagecomp() {
    return(
        <>
        <FlashMessage 
        animated
        titleStyle={{fontFamily:Fonts.Semibold,fontSize:RFValue(13),color:"#fff"}}
        textStyle={{fontFamily:Fonts.Regular,fontSize:RFValue(11),color:"#fff"}}
        position="top"
        style={{top:"50%"}}
         />
        </>
    )
}