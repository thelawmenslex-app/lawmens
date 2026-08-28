import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';

export default function SettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Policies</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.secHeading}>Legal & Policies</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('About')}>
            <Text style={styles.itemText}>About THE-LAWMEN'S</Text>
            <Text style={styles.arrow}>➔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.itemText}>Privacy Policy</Text>
            <Text style={styles.arrow}>➔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Disclaimer')}>
            <Text style={styles.itemText}>Legal Disclaimer</Text>
            <Text style={styles.arrow}>➔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.item, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('Contact')}>
            <Text style={styles.itemText}>Contact & Support</Text>
            <Text style={styles.arrow}>➔</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.secHeading}>Account & Security</Text>
        <View style={styles.card}>
          <View style={styles.item}>
            <Text style={styles.itemText}>Active Session: Single Device</Text>
            <Text style={styles.activeTag}>✓ SECURE</Text>
          </View>
          <TouchableOpacity
            style={[styles.item, { borderBottomWidth: 0 }]}
            onPress={() => Alert.alert('Logout', 'Are you sure you want to log out?', [{ text: 'Cancel' }, { text: 'Logout', style: 'destructive', onPress: () => alert('Logged out') }])}
          >
            <Text style={[styles.itemText, { color: '#EF4444' }]}>Logout</Text>
            <Text style={styles.arrow}>➔</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF7FC' },
  header: { backgroundColor: '#181A20', paddingTop: 45, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12, padding: 4 },
  backText: { fontSize: 24, color: '#25AAE2', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, color: '#25AAE2', fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 60 },
  secHeading: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#D8ECF7', marginBottom: 18 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  itemText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  arrow: { fontSize: 14, color: '#94A3B8', fontWeight: 'bold' },
  activeTag: { fontSize: 12, fontWeight: '800', color: '#10B981' },
});
