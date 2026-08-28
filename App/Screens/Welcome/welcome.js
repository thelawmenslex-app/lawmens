import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF7FC" />

      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
        <MaterialCommunityIcons name="star-four-points" size={24} color="#382D21" style={styles.sparkleIcon} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Center Circular LM Logo */}
        <View style={styles.logoCircleWrapper}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../Assets/Icons/logo.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.mainTitle}>Explore the app</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Your gateway to understanding the new Criminal laws namely BNS, BNSS, BSA, with easy-to-find sections and updates.
        </Text>

        {/* Disclaimer Card */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerTopRow}>
            <View style={styles.noticeBadge}>
              <Text style={styles.noticeText}>NOTICE</Text>
            </View>
            <Text style={styles.disclaimerHeading}>Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerBody}>
            <Text style={{ fontWeight: 'bold' }}>THE-LAWMEN'S</Text> is an educational and legal reference platform intended to facilitate legal research and awareness. While every effort is made to ensure accuracy, users are advised to verify the applicable law through the official <Text style={{ fontWeight: 'bold' }}>Gazette notifications</Text> and authoritative <Text style={{ fontWeight: 'bold' }}>Government publications</Text> before relying upon any legal provision.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.loginBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.signupBtnText}>Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF7FC' },
  headerRow: {
    paddingTop: 45,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#25AAE2',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sparkleIcon: { position: 'absolute', right: 24, top: 45 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoCircleWrapper: { marginVertical: 16, alignItems: 'center', justifyContent: 'center' },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  logoImg: { width: 90, height: 90 },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#181A20',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#5C6B73',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  disclaimerCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
    elevation: 2,
  },
  disclaimerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  noticeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  noticeText: { fontSize: 11, fontWeight: '900', color: '#D97706', letterSpacing: 0.6 },
  disclaimerHeading: { fontSize: 16, fontWeight: '900', color: '#181A20' },
  disclaimerBody: { fontSize: 13, color: '#334155', lineHeight: 20, textAlign: 'left' },
  bottomButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 10,
    gap: 12,
  },
  loginBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#25AAE2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  loginBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  signupBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupBtnText: { fontSize: 16, fontWeight: '800', color: '#111827' },
});
