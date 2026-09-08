import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function FormValidationErrorScreen({ route, navigation }) {
  const {
    title = 'Validation Errors Found',
    subtitle = 'Please review and fix the following fields before proceeding.',
    errors = [
      'Password must be at least 8 characters and include uppercase, number, & special symbol.',
      'Please enter a valid 10-digit mobile number for WhatsApp verification.',
      'Terms and conditions must be accepted.'
    ],
    onFix
  } = route?.params || {};

  const handleFix = () => {
    if (onFix) onFix();
    else if (navigation && navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.canGoBack() && navigation.goBack()}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.iconCircle}>
          <Feather name="alert-circle" size={54} color="#EF4444" />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.errorsCard}>
          <Text style={styles.errorsHeader}>Issues to correct:</Text>
          {errors.map((err, idx) => (
            <View key={idx} style={styles.errorRow}>
              <Feather name="x-circle" size={16} color="#EF4444" style={{ marginTop: 2 }} />
              <Text style={styles.errorItemText}>{err}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleFix} activeOpacity={0.85}>
          <Feather name="edit-3" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryBtnText}>Edit & Correct Details →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF7FC' },
  header: {
    backgroundColor: '#181A20',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25AAE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  brandTitle: { fontSize: 20, fontWeight: '900', color: '#25AAE2', letterSpacing: 1.2 },
  scrollContent: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, maxWidth: 300, marginBottom: 24 },
  errorsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    marginBottom: 24,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  errorsHeader: { fontSize: 14, fontWeight: '800', color: '#991B1B', marginBottom: 12 },
  errorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  errorItemText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 19, fontWeight: '500' },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#25AAE2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
