import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AuthDummy({ route }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#00A3FF' }}>Auth Screen</Text>
    </View>
  );
}
