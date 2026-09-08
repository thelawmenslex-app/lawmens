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

export default function SuccessScreen({ route, navigation }) {
  const {
    title = 'Action Completed Successfully! 🎉',
    subtitle = 'Your request has been verified and processed by the legal portal.',
    referenceId = 'TXN_' + Date.now().toString().slice(-8),
    details = [],
    buttonText = 'Return to Dashboard',
    actionRoute = 'MainTabs'
  } = route?.params || {};

  const handleAction = () => {
    if (actionRoute && navigation) {
      navigation.reset({ index: 0, routes: [{ name: actionRoute }] });
    } else if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
        <MaterialCommunityIcons name="scale-balance" size={26} color="#25AAE2" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Checkmark Circle */}
        <View style={styles.iconCircle}>
          <Feather name="check" size={54} color="#10B981" />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Reference & Summary Card */}
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>VERIFIED RECORD</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Reference Number:</Text>
            <Text style={styles.value}>{referenceId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date & Timestamp:</Text>
            <Text style={styles.value}>{new Date().toLocaleDateString('en-IN')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, { color: '#10B981', fontWeight: '800' }]}>CONFIRMED</Text>
          </View>

          {Array.isArray(details) && details.map((d, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>{d.label}:</Text>
              <Text style={styles.value}>{d.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleAction} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>{buttonText} →</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  brandTitle: { fontSize: 20, fontWeight: '900', color: '#25AAE2', letterSpacing: 1.2 },
  scrollContent: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, maxWidth: 300, marginBottom: 24 },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#10B981' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  value: { fontSize: 13, color: '#0F172A', fontWeight: '700' },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#25AAE2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
