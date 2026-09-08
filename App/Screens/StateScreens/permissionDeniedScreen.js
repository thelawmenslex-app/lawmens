import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PermissionDeniedScreen({ route, navigation }) {
  const {
    permissionName = 'Device Storage & Notifications',
    reason = 'This permission is required to download PDF bare acts, store offline matrices, and receive high-priority gazette legal updates.',
    onRetry
  } = route?.params || {};

  const handleOpenSettings = () => {
    Linking.openSettings().catch(() => {});
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

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Feather name="shield-off" size={50} color="#EF4444" />
        </View>

        <Text style={styles.title}>Permission Required</Text>
        <Text style={styles.permissionBadge}>{permissionName}</Text>
        <Text style={styles.reason}>{reason}</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleOpenSettings} activeOpacity={0.85}>
          <Feather name="settings" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryBtnText}>Open App Settings</Text>
        </TouchableOpacity>

        {onRetry && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={onRetry} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>Check Again</Text>
          </TouchableOpacity>
        )}
      </View>
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
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
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
  permissionBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 14,
  },
  reason: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, maxWidth: 300, marginBottom: 28 },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#25AAE2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  secondaryBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
});
