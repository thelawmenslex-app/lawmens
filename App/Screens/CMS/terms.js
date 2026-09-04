import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function TermsAndConditionsScreen({ navigation }) {
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
        <Text style={styles.subHeaderTitle}>Terms & Conditions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconCircle}>
          <Feather name="file-text" size={36} color="#FFFFFF" />
        </View>

        <Text style={styles.sectionTitle}>Terms & Conditions of Service</Text>
        <View style={styles.dividerLine} />

        <View style={styles.card}>
          <Text style={styles.clauseHeading}>1. Acceptance of Terms</Text>
          <Text style={styles.clauseBody}>
            By creating an account, accessing, or using THE-LAWMEN'S mobile application, you agree to be bound by these Terms and Conditions, our Privacy Policy, and Disclaimer. If you do not agree to these terms, please do not use the application.
          </Text>

          <Text style={styles.clauseHeading}>2. Legal Information Disclaimer</Text>
          <Text style={styles.clauseBody}>
            THE-LAWMEN'S provides digital legal research tools, comparative tables (IPC to BNS, CrPC to BNSS, IEA to BSA), bare acts, and schedules for educational and informational reference purposes only. The contents do not constitute professional legal advice.
          </Text>

          <Text style={styles.clauseHeading}>3. User Accounts & Security</Text>
          <Text style={styles.clauseBody}>
            You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </Text>

          <Text style={styles.clauseHeading}>4. Subscription & Access Policy</Text>
          <Text style={styles.clauseBody}>
            New users may receive a complimentary trial period. Continued access to premium features, central legislation modules, and updates is subject to an active subscription plan purchased through our authorized payment gateways.
          </Text>

          <Text style={styles.clauseHeading}>5. Intellectual Property</Text>
          <Text style={styles.clauseBody}>
            All trademarks, logos, UI designs, and proprietary comparative mapping databases are the intellectual property of THE-LAWMEN'S. Unauthorized reproduction, distribution, scraping, or commercial exploitation is strictly prohibited.
          </Text>

          <Text style={styles.clauseHeading}>6. Modifications to Service</Text>
          <Text style={styles.clauseBody}>
            We reserve the right to modify, update, or discontinue any aspect of the service or these Terms at any time. Continued use of the application following updates constitutes acceptance of the modified Terms.
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
    backgroundColor: '#25AAE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  brandTitle: { fontSize: 22, fontWeight: '900', color: '#25AAE2' },
  subHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#25AAE2',
    textAlign: 'center',
    marginTop: 8,
  },
  content: { alignItems: 'center', paddingTop: 28, paddingHorizontal: 20, paddingBottom: 50 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#25AAE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 12 },
  dividerLine: { width: 60, height: 3, backgroundColor: '#25AAE2', borderRadius: 2, marginBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
    width: '100%',
    elevation: 3,
  },
  clauseHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
    marginBottom: 6,
  },
  clauseBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
});
