import { Text, View } from "react-native";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";


export default function History () {
    return(
        <View style={{flex:1,backgroundColor:"#fff",justifyContent:"center"}} >
        <Text style={{fontFamily:Fonts.Medium,color:'#000',textAlign:"center",fontSize:RFValue(18)}} >Under Construction...</Text>
      </View>
    )
}