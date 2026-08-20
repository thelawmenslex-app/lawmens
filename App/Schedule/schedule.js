import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Fonts } from "../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { colors } from "../Utilities/colors";

export default function Schedule(props) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#fff" }}>
      <Pressable 
        style={{ width: "60%", paddingVertical: 15, backgroundColor: colors.primary, alignItems: 'center', borderRadius: 5, marginBottom: 20 }}
        onPress={() => props.navigation.navigate('FirstSchedule')}
      >
        <Text style={{ color: "#fff", fontFamily: Fonts.Bold, fontSize: RFValue(16) }}>First Schedule</Text>
      </Pressable>
      <Pressable 
        style={{ width: "60%", paddingVertical: 15, backgroundColor: colors.primary, alignItems: 'center', borderRadius: 5, marginBottom: 20 }}
        onPress={() => props.navigation.navigate('SecondSchedule')}
      >
        <Text style={{ color: "#fff", fontFamily: Fonts.Bold, fontSize: RFValue(16) }}>Second Schedule</Text>
      </Pressable>
      <Pressable 
        style={{ width: "60%", paddingVertical: 15, backgroundColor: colors.primary, alignItems: 'center', borderRadius: 5 }}
        onPress={() => props.navigation.navigate('MinorActs')}
      >
        <Text style={{ color: "#fff", fontFamily: Fonts.Bold, fontSize: RFValue(16) }}>CRIMINAL MINOR ACT</Text>
      </Pressable>
    </View>
  );
}
