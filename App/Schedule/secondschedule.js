// SecondScheduleScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const SecondSchedule = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Second Schedule</Text>
      <Button
        title="Go Back"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default SecondSchedule;
