import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, WEBSITE_CHECKOUT_URL, WEBSITE_URL } from '../../Actions/constant';
import { SubscriptionService } from '../../Services/subscriptionService';

export default function PaymentScreen({ route, navigation }) {
  const { plan = { name: 'Start up', price: 1500, validity: 30 } } = route?.params || {};

  const [checkingStatus, setCheckingStatus] = useState(false);
  const [userProfile, setUserProfile] = useState({ id: '', name: 'Advocate', email: 'advocate@thelawmens.com', phone: '9876543210' });

  useEffect(() => {
    (async () => {
      try {
        // 1. Check local profile storage
        const userStr = await AsyncStorage.getItem('@userprofile');
        if (userStr) {
          const u = JSON.parse(userStr);
          const computedName = ((u.firstName || '') + ' ' + (u.lastName || '')).trim() || u.name || 'Advocate';
          const computedEmail = u.email || 'advocate@thelawmens.com';
          const computedPhone = u.phoneNumber || u.phone || '9876543210';
          const computedId = u._id || u.id || '';

          setUserProfile({
            id: computedId,
            name: computedName,
            email: computedEmail,
            phone: computedPhone
          });
        }

        // 2. Fetch live real-time user profile from backend
        const token = await AsyncStorage.getItem('@authtoken');
        if (token && token !== 'offline_authenticated_token') {
          try {
            const res = await fetch(`${BASE_URL}/user/profile`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
              }
            });
            const pData = await res.json();
            if (pData && pData.data) {
              const u = pData.data;
              const liveProfile = {
                id: u._id || u.id || '',
                name: ((u.firstName || '') + ' ' + (u.lastName || '')).trim() || u.name || 'Advocate',
                email: u.email || 'advocate@thelawmens.com',
                phone: u.phoneNumber || u.phone || '9876543210'
              };
              setUserProfile(liveProfile);
              await AsyncStorage.setItem('@userprofile', JSON.stringify(u));
            }
          } catch (liveErr) {}
        }
      } catch (e) {}
    })();
  }, []);

  const getCheckoutUrl = () => {
    const planName = plan.name || 'Start up';
    const planPrice = plan.price || 1500;
    const planValidity = plan.validity || 30;
    const email = userProfile.email || '';
    const name = userProfile.name || '';
    const phone = userProfile.phone || '';
    const userId = userProfile.id || '';

    return `${WEBSITE_CHECKOUT_URL}?plan=${encodeURIComponent(planName)}&price=${encodeURIComponent(planPrice)}&validity=${encodeURIComponent(planValidity)}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&userId=${encodeURIComponent(userId)}`;
  };

  const handleProceedToWebsite = async () => {
    try {
      const url = getCheckoutUrl();
      const supported = await Linking.canOpenURL(url).catch(() => true);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(WEBSITE_URL);
      }
    } catch (e) {
      Alert.alert('Web Checkout', 'Please visit our official website to complete payment: ' + WEBSITE_CHECKOUT_URL);
    }
  };

  const handleVerifyStatus = async () => {
    setCheckingStatus(true);
    try {
      // 1. Sync from backend status
      const status = await SubscriptionService.getStatus();
      if (status && status.isSubscribed) {
        Alert.alert(
          'Subscription Active! 🎉',
          'Your pass is active! Full access to all bare acts, comparison matrices, and features is unlocked.',
          [
            {
              text: 'Open App',
              onPress: () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
            }
          ]
        );
      } else {
        Alert.alert(
          'Payment Status',
          'We have not detected a completed payment yet. If you have already paid on the website, please wait a few moments for the gateway confirmation and tap Check Status again.',
          [
            { text: 'Complete Payment', onPress: handleProceedToWebsite },
            { text: 'OK' }
          ]
        );
      }
    } catch (e) {
      Alert.alert('Error', 'Could not check status. Please check your internet connection.');
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Header */}
      <View style={styles.darkHeader}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backBtnCircle}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.brandTitle}>Web Checkout</Text>
        </View>
        <Text style={styles.headerSubtitle}>Official Legal Portal • thelawmens.com</Text>
      </View>

      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Plan Details */}
        <View style={styles.planCard}>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>SELECTED PLAN</Text>
          </View>
          <Text style={styles.planTitle}>{plan.name}</Text>
          <Text style={styles.planValidity}>Validity: {plan.validity || 30} Days • Full Legal Database Access</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceCurrency}>₹</Text>
            <Text style={styles.priceAmount}>{plan.price}</Text>
            <Text style={styles.pricePeriod}>/ {plan.validity ? plan.validity + ' days' : 'month'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Base Amount</Text>
            <Text style={styles.summaryValue}>₹ {plan.price}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST (18% included)</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>Included</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalAmount}>₹ {plan.price}</Text>
          </View>
        </View>

        {/* User Details */}
        <View style={styles.userSummaryCard}>
          <Text style={styles.userSummaryTitle}>Subscriber Account</Text>
          <Text style={styles.userSummaryItem}>👤 {userProfile.name}</Text>
          <Text style={styles.userSummaryItem}>📧 {userProfile.email}</Text>
          <Text style={styles.userSummaryItem}>📱 +91 {userProfile.phone}</Text>
        </View>

        {/* Website Checkout Info Card */}
        <View style={styles.infoBannerCard}>
          <View style={styles.infoBannerHeader}>
            <Feather name="globe" size={20} color="#25AAE2" />
            <Text style={styles.infoBannerTitle}>Official Website Payment</Text>
          </View>
          <Text style={styles.infoBannerText}>
            To ensure complete compliance and security, payments are processed on our official portal <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>thelawmens.com</Text>.
          </Text>
          <Text style={styles.infoBannerSubtext}>
            1. Tap the button below to open the official secure web checkout.{'\n'}
            2. Complete payment via UPI, Cards, Net Banking or Wallets.{'\n'}
            3. Return here and tap "Check Status & Activate" to immediately unlock the app!
          </Text>
        </View>

        {/* Proceed to Website Button */}
        <TouchableOpacity
          style={styles.payButton}
          activeOpacity={0.85}
          onPress={handleProceedToWebsite}
        >
          <Feather name="external-link" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.payButtonText}>Pay ₹{plan.price} on Website →</Text>
        </TouchableOpacity>

        {/* Check Status Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          activeOpacity={0.85}
          onPress={handleVerifyStatus}
          disabled={checkingStatus}
        >
          {checkingStatus ? (
            <ActivityIndicator color="#0F172A" size="small" />
          ) : (
            <>
              <Feather name="refresh-cw" size={16} color="#0F172A" style={{ marginRight: 8 }} />
              <Text style={styles.refreshButtonText}>I Have Paid • Check Status & Activate</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.securityNote}>
          🔒 256-bit SSL Encrypted • Official Web Checkout at thelawmens.com
        </Text>
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
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25AAE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#25AAE2',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginLeft: 50,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#25AAE2',
    marginBottom: 16,
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
  planTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  planValidity: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceCurrency: {
    fontSize: 20,
    fontWeight: '800',
    color: '#25AAE2',
    marginRight: 4,
  },
  priceAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
  },
  pricePeriod: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#25AAE2',
  },
  userSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  userSummaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  userSummaryItem: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoBannerCard: {
    backgroundColor: '#DEF3FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(37, 170, 226, 0.4)',
  },
  infoBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 6,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 8,
  },
  infoBannerSubtext: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  payButton: {
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
  payButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  refreshButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  securityNote: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
});
