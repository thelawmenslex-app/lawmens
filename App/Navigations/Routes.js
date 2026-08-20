import React from "react";
import { SafeAreaView, StatusBar } from "react-native"
import StackNavigator from "./Stacknavigator";
import {
    DarkTheme,
    DefaultTheme,
    NavigationContainer
} from "@react-navigation/native";
const Routes = () => {
    return (
        <SafeAreaView
            style={{
                width: "100%",
                height: "100%"
            }}
        >
            <NavigationContainer>
                {/* <StatusBar backgroundColor={"white"} barStyle={"dark-content"} /> */}
                <StackNavigator />
            </NavigationContainer>
         
        </SafeAreaView>
    )
}
export default Routes;