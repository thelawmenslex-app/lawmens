import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  BackHandler,
  ActivityIndicator
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionService } from '../../Services/subscriptionService';

export default function TrialExpiredScreen({ navigation }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevent back navigation on Android when trial is expired
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const availablePlans = await SubscriptionService.getAvailablePlans();
        setPlans(availablePlans || []);
        if (availablePlans && availablePlans.length > 0) {
          setSelectedPlan(availablePlans[0]);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleGoToPayment = () => {
    const planToPay = selectedPlan || { name: 'Start up', price: 1500, validity: 30 };
    navigation.navigate('Payment', { plan: planToPay });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@authtoken');
    await AsyncStorage.removeItem('@userprofile');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Header */}
      <View style={styles.darkHeader}>
        <View style={styles.lockBadge}>
          <Feather name="lock" size={28} color="#25AAE2" />
        </View>
        <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
        <Text style={styles.headerSubtitle}>Legal Research Platform</Text>
      </View>

      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Expired Notification Card */}
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Feather name="alert-triangle" size={22} color="#EF4444" />
            <Text style={styles.alertTitle}>3-Day Free Trial Expired</Text>
          </View>
          <Text style={styles.alertDesc}>
            Your one-time complimentary 3-day trial period has ended. Access to legal bare acts, side-by-side matrices, schedules, and research modules is currently locked.
          </Text>
        </View>

        {/* Benefits Card */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Unlock Complete Unlimited Access:</Text>
          
          <View style={styles.benefitRow}>
            <Feather name="check-circle" size={18} color="#25AAE2" />
            <Text style={styles.benefitText}>Full Bharatiya Nyaya Sanhita (BNS) 2023</Text>
          </View>
          <View style={styles.benefitRow}>
            <Feather name="check-circle" size={18} color="#25AAE2" />
            <Text style={styles.benefitText}>Side-by-Side BNS vs IPC & BNSS vs CrPC Matrices</Text>
          </View>
          <View style={styles.benefitRow}>
            <Feather name="check-circle" size={18} color="#25AAE2" />
            <Text style={styles.benefitText}>All 125+ Central & State Minor Acts</Text>
          </View>
          <View style={styles.benefitRow}>
            <Feather name="check-circle" size={18} color="#25AAE2" />
            <Text style={styles.benefitText}>Legal Schedules & Offline Bookmarks</Text>
          </View>
        </View>

        {/* Plan Pricing Card */}
        {loading ? (
          <ActivityIndicator size="small" color="#25AAE2" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.planCard}>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>RECOMMENDED PASS</Text>
            </View>
            <Text style={styles.planName}>{selectedPlan?.name || 'Start up'}</Text>
            <Text style={styles.planDesc}>
              {selectedPlan?.description || 'Gain comprehensive access to all bare acts, comparison tables, and full database updates.'}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.currency}>₹</Text>
              <Text style={styles.price}>{selectedPlan?.price || 1500}</Text>
              <Text style={styles.validity}>/ {selectedPlan?.validity || 30} Days</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.payBtn}
          activeOpacity={0.85}
          onPress={handleGoToPayment}
        >
          <Text style={styles.payBtnText}>Unlock Full App • Go to Payment →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.logoutBtnText}>Log Out / Switch Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF7FC',
  },
  darkHeader: {
    backgroundColor: '#181A20',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  lockBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(37, 170, 226, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#25AAE2',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#25AAE2',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  alertCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#B91C1C',
    marginLeft: 8,
  },
  alertDesc: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 19,
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 10,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#25AAE2',
    marginBottom: 20,
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DEF3FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#25AAE2',
  },
  planName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  planDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 18,
    fontWeight: '800',
    color: '#25AAE2',
    marginRight: 4,
  },
  price: {
    fontSize: 30,
    fontWeight: '900',
    color: '#25AAE2',
  },
  validity: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  payBtn: {
    backgroundColor: '#25AAE2',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 14,
  },
  payBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  logoutBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
});
