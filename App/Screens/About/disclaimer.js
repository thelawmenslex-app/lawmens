import { Image, ScrollView, Text, View } from "react-native";
import Commonheader from "../../Components/Commonheader";
import MyStatusBar from "../../Utilities/statusbar";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { useSelector } from "react-redux";
import { profileSelector } from "../../Slices/profile";
import { Images } from "../../Utilities/assets";
import { devicewidth } from "../../Utilities/Dimensions";



export default function Disclaimer(props) {
    const { profiledata } = useSelector(profileSelector)
    const { content, email } = profiledata?.disclaimer

  // const content ="THE-LAWMEN’S is an independent mobile application and is not affiliated with or endorsed by any government agency. The information available on this app is derived from publicly accessible sources, including the Ministry of Home Affairs. - Indian Penal Code (IPC): https://www.indiacode.nic.in/bitstream/123456789/15289/1/ipc_act.pdf - Indian Evidence Act (IEA): https://www.indiacode.nic.in/bitstream/123456789/15351/1/iea_1872.pdf - Code of Criminal Procedure (CrPC): https://www.indiacode.nic.in/bitstream/123456789/15272/1/the_code_of_criminal_procedure%2C_1973.pdf - New Criminal Laws: https://www.mha.gov.in/en/commoncontent/new-criminal-laws It is designed for educational and informational purposes only and aims to assist users in comparing and understanding Indian legal codes, including historical and recent laws. While we strive to provide accurate and up-to-date information, THE-LAWMEN’S does not guarantee the completeness or correctness of the data. Users should consult official legal sources or seek professional legal advice for authoritative guidance.";


    console.log(profiledata);
    return (
        <View style={{ flex: 1, }} >
            <MyStatusBar backgroundColor={"#111111"} barstyle={"light-content"} />
            <Commonheader title={"Disclaimer"} onpress={() => props?.navigation?.goBack()} home={false} />
            <View style={{ height: "65%", marginVertical: "5%", width: "90%", alignSelf: "center" }} >
                <ScrollView showsVerticalScrollIndicator={false} >
                    <>
                        <Image source={Images.discliamer} style={{ width: devicewidth * 0.4, height: devicewidth * 0.4, alignSelf: "center", marginTop: "10%" }} />
                        <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(15), color: "#000", marginTop: "10%" }} >{content}</Text>

                        <Text style={{ fontFamily: Fonts.Bold, fontSize: RFValue(15), color: "#000", marginTop: "7.5%" }} >Email</Text>
                        <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(14), color: "#000",}} >{email}</Text>
                    </>
                </ScrollView>
            </View>
        </View>
    )
}