import React, { useCallback, useContext, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Slidingnavigation } from "../Utilities/Slidingnavigation";
import { useFocusEffect } from "@react-navigation/native";
import Settingshome from "../Screens/Settings/Home";
import Aboutus from "../Screens/Settings/Aboutus";
import Privacypolicy from "../Screens/Settings/Privacypolicy";
import Termsandcondtions from "../Screens/Settings/Termsandcondtion";
import Edit from "../Screens/Settings/Edit";
import Transactionhistory from "../Screens/Transactionhistory";


const StackComponent = createStackNavigator();


const Stakesettings = (props) => {

    useFocusEffect(
        useCallback(() => {
            return () => props.navigation.addListener("focus", async (e) => {
                props.navigation.navigate('Settingshome')
            })
        }, [])
    )

    return (
        <>
            <StackComponent.Navigator
                screenOptions={Slidingnavigation}
                initialRouteName={"Settingshome"}
            >
                <StackComponent.Screen name={"Settingshome"} component={Settingshome} />
                <StackComponent.Screen name={"Aboutus"} component={Aboutus} />
                <StackComponent.Screen name={"Privacypolicy"} component={Privacypolicy} />
                <StackComponent.Screen name={"Termsandcondtions"} component={Termsandcondtions} />
                <StackComponent.Screen name={"Edit"} component={Edit} />
                {/* <StackComponent.Screen name={"Transactionhistory"} component={Transactionhistory} /> */}
            </StackComponent.Navigator>
        </>
    )
}
export default Stakesettings;