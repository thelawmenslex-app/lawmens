import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ErrorScreen({ route, navigation }) {
  const {
    title = 'Something Went Wrong',
    message = 'An unexpected error occurred while fetching statutory legal data. Please try again.',
    onRetry,
    actionText = 'Try Again',
    supportAction = true
  } = route?.params || {};

  const handleRetry = () => {
    if (onRetry) onRetry();
    else if (navigation && navigation.canGoBack()) navigation.goBack();
  };

  const handleSupport = () => {
    if (navigation) navigation.navigate('Contact');
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
          <Feather name="alert-triangle" size={54} color="#EF4444" />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.85}>
          <Feather name="rotate-cw" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.retryBtnText}>{actionText}</Text>
        </TouchableOpacity>

        {supportAction && (
          <TouchableOpacity style={styles.supportBtn} onPress={handleSupport} activeOpacity={0.8}>
            <Feather name="help-circle" size={18} color="#25AAE2" style={{ marginRight: 8 }} />
            <Text style={styles.supportBtnText}>Contact Legal Support</Text>
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
  message: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, maxWidth: 300, marginBottom: 28 },
  retryBtn: {
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
  retryBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  supportBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  supportBtnText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
});
