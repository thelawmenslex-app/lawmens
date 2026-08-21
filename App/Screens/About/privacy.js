import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import Commonheader from "../../Components/Commonheader";
import MyStatusBar from "../../Utilities/statusbar";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { useSelector } from "react-redux";
import { profileSelector } from "../../Slices/profile";
import { Images } from "../../Utilities/assets";
import { devicewidth } from "../../Utilities/Dimensions";

const DEFAULT_PRIVACY_TEXT = `Privacy Policy of THE-LAWMEN’S

Introduction:
The information collected and shown on this mobile application is an online/offline open content information of provisions subject to old and new criminal laws. 

Information provided on this mobile application, at best, of a General nature and cannot substitute for the authentic verified information. i.e., obtained from the gazette Publication. Please verify and authenticate with the bare Acts, veracity and authenticity of the information shown on this mobile application. However that is not to say that you will not find valuable and accurate information through this mobile application.

Neither the individual contributor, system operators, nor anyone else connected with this mobile application can take any responsibility for improper results if any, are consequences of any attempt to use or adopt any of the information or dis information presented through this mobile application.

You are being granted a limited licence to view anything from this mobile application; it does not create or imply any contractual or extracontractual liability on the part of.

Information Collection and Use:
We gather information from publicly available sources, including the Ministry of Home Affairs website (source:[https://www.indiacode.nic.in/bitstream/123456789/15289/1/ipc_act.pdf],[https://www.indiacode.nic.in/bitstream/123456789/15351/1/iea_1872.pdf],[https://www.indiacode.nic.in/bitstream/123456789/15272/1/the_code_of_criminal_procedure%2C_1973.pdf][https://www.mha.gov.in/en/commoncontent/new-criminal-laws]), to improve and enhance our services. Your information is utilized to strengthen our support, enrich legal knowledge, and facilitate the implementation of new criminal laws through THE-LAWMEN’S application. This involves comparisons between historical criminal laws (Indian Penal Code 1860, Indian Evidence Act 1872, Criminal Procedure Code 1973) and recent legislations (The Bharatiya Nyaya Sanhita, 2023 [effective 01.07.2024], The Bharatiya Sakshya Adhiniyam 2023 [effective 01.07.2024], and The Bharatiya Nagarik Suraksha Sanhita 2023 [effective 01.07.2024]).

Commitment to Integrity:
We want to assure you that we are fully committed to upholding the interests of justice, trust, and safety. All content provided through our application is sourced from the newly published central government major Acts (The Bharatiya Nyaya Sanhita, The Bharatiya Sakshya Adhiniyam, and The Bharatiya Nagarik Suraksha Sanhita) as published in the official central government gazette publication number [Gazette Number]. We adhere to the official publications and legal standards to ensure the accuracy and reliability of the information.

Data Security:
We employ stringent security measures to safeguard your information from unauthorized access, disclosure, or misuse.

Data Sharing and Disclosure:
We may disclose your information to government agencies to comply with legal obligations or to protect our rights.

User Rights and Choices:
You have the right to access, correct, or delete your personal information. You can opt-out of marketing communications or the use of cookies by [method].

Data Retention and Deletion:
We retain your information for [time period] or as required by law. Your information will be deleted upon request or when it is no longer necessary for our purposes.

Children’s Privacy:
Our mission and services are designed to promote legal awareness for all, including children, as an integral part of the education system.

Changes to the Privacy Policy:
We reserve the right to update this privacy policy without notice.

Contact Information:
For any questions or concerns regarding this privacy policy, please contact us at ceodesk@thelawmens.com`;

export default function Privacy(props) {
    const { profiledata } = useSelector(profileSelector);
    const privacy = profiledata?.privacy || DEFAULT_PRIVACY_TEXT;

    return (
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <MyStatusBar backgroundColor={"#181A20"} barstyle={"light-content"} />
            <Commonheader title={"Privacy Policy"} onpress={() => props?.navigation?.goBack()} home={false} />
            <View style={{ flex: 1, width: "90%", alignSelf: "center" }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <Image source={Images.privacy} style={{ width: devicewidth * 0.35, height: devicewidth * 0.35, alignSelf: "center", marginTop: 20 }} resizeMode="contain" />
                    <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(13.5), color: "#1E293B", marginTop: 20, lineHeight: 22 }}>
                        {privacy}
                    </Text>
                </ScrollView>
            </View>
        </View>
    );
}