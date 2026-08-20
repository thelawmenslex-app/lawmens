import { Image, ScrollView, Text, View } from "react-native";
import Commonheader from "../../Components/Commonheader";
import MyStatusBar from "../../Utilities/statusbar";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { useSelector } from "react-redux";
import { profileSelector } from "../../Slices/profile";
import { Images } from "../../Utilities/assets";
import { devicewidth } from "../../Utilities/Dimensions";



export default function About(props) {
    const { profiledata } = useSelector(profileSelector)
    const { about } = profiledata

   //const about = "Welcome to THE-LAWMEN’S, your go-to mobile application for all things related to Indian law. Whether you're a legal professional, a student, or simply someone interested in the intricacies of the legal system, our app provides a comprehensive and user-friendly platform to access and compare old and new Indian laws.\n\nFeatures:\n\n1. **Comprehensive Law Database**: Access detailed sections of the Indian Penal Code (IPC), Code of Criminal Procedure (CrPC), Indian Evidence Act, and the new laws like Bharatiya Nyaya Sanhita (BNS), Bharatiya Sakshya Adhiniyam (BSA), and Bharatiya Nagarik Suraksha Sanhita (BNSS). Source: Ministry of Home Affairs.\n\n2. **Effective July 1, 2024**: Stay updated with the new laws that come into effect from July 1, 2024. Easily compare the old and new laws to understand the changes and continuities.\n\n3. **Easy Search Functionality**: Use our powerful search feature to find specific sections across both old and new legal codes. For example, searching for \"IPC sec 34\" will also provide its equivalent in the new BNS law.\n\n4. **Detailed Explanations**: Get clear and concise explanations for each section to better understand the legal provisions.\n\n5. **User-Friendly Interface**: Navigate effortlessly through the app with an intuitive design that makes legal information accessible to everyone.\n\n6. **Regular Updates**: Our team ensures that the database is regularly updated to reflect the latest legal developments.";
 
    console.log(profiledata);
    return (
        <View style={{ flex: 1, }} >
            <MyStatusBar backgroundColor={"#111111"} barstyle={"light-content"} />
            <Commonheader title={"About"} onpress={() => props?.navigation?.goBack()} home={false} />
            <View style={{ height: "65%", marginVertical: "5%", width: "90%", alignSelf: "center" }} >
                <ScrollView showsVerticalScrollIndicator={false} >
                    <>
                        <Image source={Images.contactus} style={{ width: devicewidth * 0.5, height: devicewidth * 0.5, alignSelf: "center", marginTop: "5%" }} />
                        <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(15), color: "#000", marginTop: "10%" }} >{about}</Text>

                        {/* <Text style={{ fontFamily: Fonts.Bold, fontSize: RFValue(15), color: "#000", marginTop: "10%" }} >Contact Email</Text>
                        <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(14), color: "#000", }} >{email}</Text>

                        <Text style={{ fontFamily: Fonts.Bold, fontSize: RFValue(15), color: "#000", marginTop: "7.5%" }} >Phone Number</Text>
                        <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(14), color: "#000", }} >{phoneNumber}</Text> */}
                    </>
                </ScrollView>
            </View>
        </View>
    )
}