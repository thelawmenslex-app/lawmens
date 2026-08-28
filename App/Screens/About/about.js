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

const DEFAULT_ABOUT_TEXT = `About :

Welcome to THE-LAWMEN’S, your go-to mobile application for all things related to Indian law. Whether you're a legal professional, a student, or simply someone interested in the intricacies of the legal system, our app provides a comprehensive and user-friendly platform to access and compare old and new Indian laws.

Features:

1. Comprehensive Law Database: Access detailed sections of the Indian Penal Code (IPC), Code of Criminal Procedure (CrPC), Indian Evidence Act (IEA), and the new laws like Bharatiya Nyaya Sanhita (BNS), Bharatiya Sakshya Adhiniyam (BSA), and Bharatiya Nagarik Suraksha Sanhita (BNSS). Source: Ministry of Home Affairs.

2. Effective July 1, 2024: Stay updated with the new laws that come into effect from July 1, 2024. Easily compare the old and new laws to understand the changes and continuities.

3. Easy Search Functionality: Use our powerful search feature to find specific sections across both old and new legal codes. For example, searching for "IPC sec 34" will also provide its equivalent in the new BNS law.

4. Detailed Explanations: Get clear and concise explanations for each section to better understand the legal provisions.

5. User-Friendly Interface: Navigate effortlessly through the app with an intuitive design that makes legal information accessible to everyone.

6. Regular Updates: Our team ensures that the database is regularly updated to reflect the latest legal developments.`;

export default function About(props) {
    const { profiledata } = useSelector(profileSelector);
    const about = profiledata?.about || DEFAULT_ABOUT_TEXT;

    return (
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <MyStatusBar backgroundColor={"#181A20"} barstyle={"light-content"} />
            <Commonheader title={"About Us"} onpress={() => props?.navigation?.goBack()} home={false} />
            <View style={{ flex: 1, width: "90%", alignSelf: "center" }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <Image source={Images.contactus} style={{ width: devicewidth * 0.45, height: devicewidth * 0.45, alignSelf: "center", marginTop: 15 }} resizeMode="contain" />
                    <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(13.5), color: "#1E293B", marginTop: 20, lineHeight: 22 }}>
                        {about}
                    </Text>

                    <Text style={{ fontFamily: Fonts.Bold, fontSize: RFValue(14), color: "#25AAE2", marginTop: 20 }}>
                        Official Contact
                    </Text>
                    <Text style={{ fontFamily: Fonts.Medium, fontSize: RFValue(13), color: "#475569", marginTop: 4 }}>
                        ceodesk@thelawmens.com
                    </Text>
                </ScrollView>
            </View>
        </View>
    );
}