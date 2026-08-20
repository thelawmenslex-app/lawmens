import { Image, ImageBackground, View } from "react-native";
import { Images } from "../../Utilities/assets";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyStatusBar from "../../Utilities/statusbar";
import { update_helper } from "../../Slices/helper";
import { useDispatch } from "react-redux";
import { devicewidth } from "../../Utilities/Dimensions";



export default function Splash(props) {
  useEffect(() => {
    setTimeout(() => {
      initialfn()
    }, 2000);
  }, [])
  const dispatch = useDispatch()

  const initialfn = async () => {
    var token = await AsyncStorage.getItem("token")
    console.log(token,"HETSPLASH");
    if (!token) {
      props.navigation.navigate("Welcome")

    } else {
      dispatch(update_helper({key:"setAuthtoken",value:token}))
      props.navigation.navigate("Homemodule")

    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f4fcff", }} >
      <MyStatusBar backgroundColor={"#f4fcff"} barstyle={"light-content"} />
      <View style={{height:"90%",backgroundColor:"#f4fcff",width:"100%"}} >
      {/* <Image style={{width:devicewidth*0.5,height:devicewidth*0.5,alignSelf:"center"}} source={Images.splash1} /> */}
      <ImageBackground style={{width:"100%",height:"100%"}} source={Images.background}  resizeMode="stretch" />

      </View>
    </View>
  )
}