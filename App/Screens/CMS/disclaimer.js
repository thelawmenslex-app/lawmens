import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function DisclaimerScreen({ navigation }) {
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
        <Text style={styles.subHeaderTitle}>Disclaimer</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.warningIconBox}>
          <Feather name="alert-triangle" size={60} color="#F59E0B" />
        </View>

        <Text style={styles.sectionTitle}>Legal Disclaimer</Text>
        <View style={styles.dividerLine} />

        <View style={styles.noticeCard}>
          <View style={styles.noticeHeaderRow}>
            <View style={styles.noticeBadge}>
              <Text style={styles.noticeBadgeText}>NOTICE</Text>
            </View>
            <Text style={styles.noticeHeading}>Important Information</Text>
          </View>
          <Text style={styles.noticeBody}>
            <Text style={{ fontWeight: 'bold' }}>THE-LAWMEN'S</Text> is an educational and legal reference platform intended to facilitate legal research and awareness. While every effort is made to ensure accuracy, users are advised to verify the applicable law through the official <Text style={{ fontWeight: 'bold' }}>Gazette notifications</Text> and authoritative <Text style={{ fontWeight: 'bold' }}>Government publications</Text> before relying upon any legal provision.
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
  warningIconBox: { marginVertical: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  dividerLine: { width: 40, height: 3, backgroundColor: '#00A3FF', borderRadius: 1.5, marginVertical: 12 },
  noticeCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
    marginTop: 10,
  },
  noticeHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  noticeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  noticeBadgeText: { fontSize: 11, fontWeight: '900', color: '#D97706' },
  noticeHeading: { fontSize: 16, fontWeight: '900', color: '#111827' },
  noticeBody: { fontSize: 13, color: '#334155', lineHeight: 20 },
});
