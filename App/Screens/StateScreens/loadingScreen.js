import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Image
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LoadingScreen({ route, navigation }) {
  const {
    title = 'Loading Legal Database...',
    subtitle = 'Synchronizing central acts, schedules, and transition matrices.',
    canCancel = true,
    onCancel
  } = route?.params || {};

  const handleCancel = () => {
    if (onCancel) onCancel();
    else if (navigation && navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Brand Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
        <MaterialCommunityIcons name="scale-balance" size={26} color="#25AAE2" />
      </View>

      <View style={styles.content}>
        {/* Animated Scales Icon Circle */}
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="scale-balance" size={54} color="#25AAE2" />
        </View>

        {/* Activity Indicator */}
        <ActivityIndicator size="large" color="#25AAE2" style={styles.spinner} />

        {/* Texts */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Loading Quote Box */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "Ignorantia juris non excusat — Knowledge of statutory provisions empowers the legal mind."
          </Text>
        </View>
      </View>

      {canCancel && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
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
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#25AAE2',
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  spinner: { marginBottom: 18 },
  title: { fontSize: 20, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, maxWidth: 300, marginBottom: 24 },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#25AAE2',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quoteText: { fontSize: 12, color: '#475569', fontStyle: 'italic', textAlign: 'center', lineHeight: 18 },
  footer: { paddingHorizontal: 24, paddingBottom: 30 },
  cancelBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
});
