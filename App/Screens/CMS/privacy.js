import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />
      <View style={styles.darkHeader}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backBtnCircle}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
        </View>
        <Text style={styles.subHeaderTitle}>Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.lockIconCircle}>
          <Feather name="lock" size={36} color="#FFFFFF" />
        </View>

        <Text style={styles.sectionTitle}>Privacy Policy of THE-LAWMEN'S</Text>
        <View style={styles.dividerLine} />

        <View style={styles.policyCard}>
          <Text style={styles.policyBody}>
            The information contained in this mobile application is compiled from publicly available online and offline sources relating to the provisions of the erstwhile and current criminal laws of India. The content is provided solely for general informational and educational purposes.
            \n\n
            While every reasonable effort has been made to ensure the accuracy and reliability of the information, this mobile application does not warrant or guarantee that the content is complete, accurate, current, or free from errors or omissions. Users are strongly advised to verify the information with the <Text style={{ fontWeight: 'bold' }}>Official Gazette Notifications, Bare Acts</Text>, and other authentic government publications.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF7FC' },
  darkHeader: {
    backgroundColor: '#181A20',
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  brandTitle: { fontSize: 22, fontWeight: '900', color: '#00A3FF' },
  subHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00A3FF',
    textAlign: 'center',
    marginTop: 8,
  },
  content: { alignItems: 'center', padding: 24, paddingBottom: 60 },
  lockIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#00A3FF' },
  dividerLine: { width: 40, height: 3, backgroundColor: '#00A3FF', borderRadius: 1.5, marginVertical: 12 },
  policyCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
    marginTop: 10,
  },
  policyBody: { fontSize: 13, color: '#334155', lineHeight: 20 },
});
