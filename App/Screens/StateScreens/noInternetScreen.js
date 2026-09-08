import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function NoInternetScreen({ route, navigation }) {
  const [checking, setChecking] = useState(false);
  const {
    onRetry,
    title = 'No Internet Connection',
    subtitle = 'Your device appears to be offline. You can still access previously saved and cached bare acts.'
  } = route?.params || {};

  const handleRetry = async () => {
    setChecking(true);
    if (onRetry) {
      await onRetry();
    } else {
      setTimeout(() => {
        setChecking(false);
        if (navigation && navigation.canGoBack()) navigation.goBack();
      }, 1200);
    }
  };

  const handleOfflineMode = () => {
    if (navigation) navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
        <MaterialCommunityIcons name="scale-balance" size={26} color="#25AAE2" />
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Feather name="wifi-off" size={50} color="#F59E0B" />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.offlineCard}>
          <Feather name="check-circle" size={18} color="#10B981" />
          <Text style={styles.offlineText}>
            Offline Bare Acts (BNS, BNSS, BSA) and Bookmarks are fully accessible without internet.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleRetry} disabled={checking} activeOpacity={0.85}>
          {checking ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Feather name="refresh-cw" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>Retry Connection</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleOfflineMode} activeOpacity={0.8}>
          <Text style={styles.secondaryBtnText}>Continue in Offline Mode →</Text>
        </TouchableOpacity>
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
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, maxWidth: 300, marginBottom: 20 },
  offlineCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  offlineText: { flex: 1, fontSize: 12, color: '#334155', fontWeight: '500', lineHeight: 17 },
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
