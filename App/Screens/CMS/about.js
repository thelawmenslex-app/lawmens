import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';

export default function AboutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About THE-LAWMEN'S</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
          <Text style={styles.brandSub}>LegalTech Mobile Platform</Text>
          <Text style={styles.bodyText}>
            Welcome to THE-LAWMEN'S, your comprehensive mobile application for Indian legal research and reference. Whether you are an advocate, a judge, a legal scholar, a law student, or a citizen interested in the Indian justice system, our app provides a fast, modern, and offline-capable platform to access and compare old and newly enacted criminal laws.
            \n\n
            Key Highlights:
            • Bharatiya Nyaya Sanhita (BNS, 2023)
            • Bharatiya Nagarik Suraksha Sanhita (BNSS, 2023)
            • Bharatiya Sakshya Adhiniyam (BSA, 2023)
            • Indian Penal Code (IPC, 1860)
            • Code of Criminal Procedure (CrPC, 1973)
            • Indian Evidence Act (IEA, 1872)
            • Central Criminal Minor Acts & Statutory Schedules
            \n
            All legal texts are curated from authentic public legislative records published by the Ministry of Law and Justice and Ministry of Home Affairs, Government of India.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF7FC' },
  header: { backgroundColor: '#181A20', paddingTop: 45, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12, padding: 4 },
  backText: { fontSize: 24, color: '#00A3FF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, color: '#00A3FF', fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 60 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1.5, borderColor: '#D8ECF7' },
  brandTitle: { fontSize: 22, fontWeight: '900', color: '#00A3FF', marginBottom: 2 },
  brandSub: { fontSize: 13, color: '#5A6E7F', fontWeight: '700', marginBottom: 14 },
  bodyText: { fontSize: 14, color: '#334155', lineHeight: 22 },
});
