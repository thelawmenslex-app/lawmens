import { Image, ScrollView, Text, View } from "react-native";
import Commonheader from "../../Components/Commonheader";
import MyStatusBar from "../../Utilities/statusbar";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { useSelector } from "react-redux";
import { profileSelector } from "../../Slices/profile";
import { Images } from "../../Utilities/assets";
import { devicewidth } from "../../Utilities/Dimensions";



export default function Privacy(props) {
    const { profiledata } = useSelector(profileSelector)
    const {privacy} = profiledata

   //const privacy ="Privacy Policy of M/s.THE-LAWMEN’S\n\nIntroduction:\nAt THE-LAWMEN’S, we place a high value on your privacy and are committed to protecting your personal information. This privacy policy outlines how we collect, use, and disclose information from our users.\n\nInformation Collection and Use:\nWe gather information from publicly available sources, including the Ministry of Home Affairs website (source:[https://www.indiacode.nic.in/bitstream/123456789/15289/1/ipc_act.pdf],[https://www.indiacode.nic.in/bitstream/123456789/15351/1/iea_1872.pdf],[https://www.indiacode.nic.in/bitstream/123456789/15272/1/the_code_of_criminal_procedure%2C_1973.pdf][https://www.mha.gov.in/en/commoncontent/new-criminal-laws]), to improve and enhance our services. Your information is utilized to strengthen our support, enrich legal knowledge, and facilitate the implementation of new criminal laws through THE-LAWMEN’S application. This involves comparisons between historical criminal laws (Indian Penal Code 1860, Indian Evidence Act 1872, Criminal Procedure Code 1973) and recent legislations (The Bharatiya Nyaya Sanhita, 2023 [effective 01.07.2024], The Bharatiya Sakshya Adhiniyam 2023 [effective 01.07.2024], and The Bharatiya Nagarik Suraksha Sanhita 2023 [effective 01.07.2024]).\n\nCommitment to Integrity:\nWe want to assure you that we are fully committed to upholding the interests of justice, trust, and safety. All content provided through our application is sourced from the newly published central government major Acts (The Bharatiya Nyaya Sanhita, The Bharatiya Sakshya Adhiniyam, and The Bharatiya Nagarik Suraksha Sanhita) as published in the official central government gazette publication number [Gazette Number]. We adhere to the official publications and legal standards to ensure the accuracy and reliability of the information.\n\nData Security:\nWe employ stringent security measures to safeguard your information from unauthorized access, disclosure, or misuse.\n\nData Sharing and Disclosure:\nWe may disclose your information to government agencies to comply with legal obligations or to protect our rights.\n\nUser Rights and Choices:\nYou have the right to access, correct, or delete your personal information. You can opt-out of marketing communications or the use of cookies by [method].\n\nData Retention and Deletion:\nWe retain your information for [time period] or as required by law. Your information will be deleted upon request or when it is no longer necessary for our purposes.\n\nChildren’s Privacy:\nOur mission and services are designed to promote legal awareness for all, including children, as an integral part of the education system.\n\nChanges to the Privacy Policy:\nWe reserve the right to update this privacy policy. Changes will take effect immediately upon posting.\n\nContact Information:\nFor any questions or concerns regarding this privacy policy, please contact us at ceodesk@thelawmens.com"

   return (
        <View style={{ flex: 1, }} >
            <MyStatusBar backgroundColor={"#111111"} barstyle={"light-content"} />
            <Commonheader title={"Privacy Policy"} onpress={() => props?.navigation?.goBack()} home={false} />
            <View style={{ height: "65%", marginVertical: "5%", width: "90%", alignSelf: "center" }} >
                <ScrollView showsVerticalScrollIndicator={false} >
                    <>
                        <Image source={Images.privacy} style={{ width: devicewidth * 0.4, height: devicewidth * 0.4, alignSelf: "center", marginTop: "10%" }} />
                        <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(15), color: "#000", marginTop: "10%" }} >{privacy}</Text>

                    </>
                </ScrollView>
            </View>
        </View>
    )
 }