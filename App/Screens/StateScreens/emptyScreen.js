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

export default function EmptyScreen({ route, navigation }) {
  const {
    title = 'No Records Found',
    subtitle = 'There are no bare acts, bookmarks, or saved sections matching your search criteria.',
    buttonText = 'Explore All Acts',
    actionRoute = 'MainTabs',
    icon = 'book-open-page-variant-outline'
  } = route?.params || {};

  const handleAction = () => {
    if (actionRoute && navigation) {
      navigation.navigate(actionRoute);
    } else if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    }
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
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name={icon} size={64} color="#25AAE2" />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleAction} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>{buttonText} →</Text>
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
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#25AAE2',
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, maxWidth: 300, marginBottom: 28 },
  primaryBtn: {
    backgroundColor: '#25AAE2',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 28,
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});
