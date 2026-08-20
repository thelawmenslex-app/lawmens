import { Image, Text, View } from "react-native";
import Commonheader from "../../Components/Commonheader";
import MyStatusBar from "../../Utilities/statusbar";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { deviceheight, devicewidth } from "../../Utilities/Dimensions";
import { useSelector } from "react-redux";
import { profileSelector } from "../../Slices/profile";
import { Images } from "../../Utilities/assets";





export default function Contactus(props) {
    const { profiledata } = useSelector(profileSelector)
    const { phoneNumber, email } = profiledata?.contact
    console.log(JSON.stringify(profiledata, null, 2));
    return (
        <View style={{ flex: 1 }} >
            <MyStatusBar backgroundColor={"#111111"} barstyle={"light-content"} />
            <Commonheader home={false} title={"Contact Us"} onpress={() => props.navigation.goBack()} />
            <View style={{ width: "90%", alignSelf: "center", height: "70%", marginVertical: "5%" }} >
                 <Image source={Images.contactus} style={{width:devicewidth*0.4,height:devicewidth*0.4,alignSelf:"center",marginTop:"10%"}} />
                <Text style={{ fontFamily: Fonts.Bold, fontSize: RFValue(15), color: "#000", marginTop: "10%" }} >Contact Email</Text>
                <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(14), color: "#000",}} >{email}</Text>

                {/* <Text style={{ fontFamily: Fonts.Bold, fontSize: RFValue(15), color: "#000", marginTop: "7.5%" }} >Phone Number</Text>
                <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(14), color: "#000",}} >{phoneNumber}</Text> */}
            </View>
        </View>
    )
}

/*
export default function Contactus(props) {
    const { profiledata } = useSelector(profileSelector);
    const { phoneNumber, email } = profiledata?.contact;

    return (
        <View style={{ flex: 1 }}>
            <MyStatusBar backgroundColor={"#111111"} barstyle={"light-content"} />
            <Commonheader home={false} title={"Contact Us"} onpress={() => props.navigation.goBack()} />
            <View style={{ width: "90%", alignSelf: "center", marginVertical: "5%" }}>
                <Text style={styles.heading}>Contact Us</Text>
                <Text style={styles.subHeading}>Got a technical issue? Want to send feedback about a feature? Need details about our Business plan? Let us know.</Text>
                <TextInput style={styles.input} placeholder="Your Name" />
                <TextInput style={styles.input} placeholder="Your Email" keyboardType="email-address" />
                <TextInput style={styles.input} placeholder="Mobile Number" keyboardType="phone-pad" />
                <TextInput style={styles.textArea} placeholder="Your message" multiline numberOfLines={4} />
                <Button title="Send Message" onPress={() => {  }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    heading: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(20),
        color: "#000",
        textAlign: "center",
        marginVertical: "5%"
    },
    subHeading: {
        fontFamily: Fonts.Regular,
        fontSize: RFValue(14),
        color: "#555",
        textAlign: "center",
        marginBottom: "5%"
    },
    input: {
        fontFamily: Fonts.Regular,
        fontSize: RFValue(14),
        color: "#000",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        width: "100%"
    },
    textArea: {
        fontFamily: Fonts.Regular,
        fontSize: RFValue(14),
        color: "#000",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        width: "100%",
        height: 100,
        textAlignVertical: "top"
    }
});*/