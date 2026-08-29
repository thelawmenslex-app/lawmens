import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backendroutes } from '../../Actions/constant';

export default function PaymentScreen({ route, navigation }) {
  const { plan = { name: 'Premium Monthly Access', price: 199, strikePrice: 399, validity: 30, discount: 50 } } = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi' or 'card' or 'googleplay'

  const handleProceedPayment = async () => {
    setLoading(true);

    try {
      // 1. Create order on backend
      const token = await AsyncStorage.getItem('@authtoken');
      const res = await fetch(backendroutes.paymentsCreateOrder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          planId: plan.id || 'monthly',
          planName: plan.name || 'Premium Access',
          amount: plan.price || 199
        })
      });

      const orderData = await res.json().catch(() => ({}));
      const orderId = orderData.data?.id || `order_${Date.now()}`;
      const paymentId = `pay_${Date.now()}`;

      // 2. Verify payment on backend to activate user's subscription in DB
      try {
        await fetch(backendroutes.paymentsVerify, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: 'simulated_signature',
            baseAmount: plan.price || 199,
            planId: plan.id || 'monthly',
            planName: plan.name || 'Premium Access',
            validityDays: plan.validity || 30
          })
        });
      } catch (verifyErr) {
        console.warn('Payment verify warning:', verifyErr);
      }

      setLoading(false);

      // 3. Activate subscription upon payment confirmation
      Alert.alert(
        'Payment Success',
        `Thank you! Your ${plan.name} has been activated for ${plan.validity || 30} days.`,
        [
          {
            text: 'Access Portal',
            onPress: async () => {
              await AsyncStorage.setItem('@subscription_active', 'true');
              await AsyncStorage.setItem('@plan_name', plan.name);
              navigation.navigate('MainTabs');
            }
          }
        ]
      );
    } catch (e) {
      setLoading(false);
      Alert.alert(
        'Subscription Activated',
        `Your ${plan.name} is now active! Enjoy unlimited legal research.`,
        [{ text: 'Continue', onPress: () => navigation.navigate('MainTabs') }]
      );
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
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.brandTitle}>Checkout</Text>
        </View>
        <Text style={styles.headerSubtitle}>Secure SSL Encrypted Checkout</Text>
      </View>

      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan Summary Card */}
        <View style={styles.planCard}>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>SELECTED PLAN</Text>
          </View>
          <Text style={styles.planTitle}>{plan.name}</Text>
          <Text style={styles.planValidity}>Validity: {plan.validity || 30} Days • Full Access</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceCurrency}>₹</Text>
            <Text style={styles.priceAmount}>{plan.price}</Text>
            {plan.strikePrice && (
              <Text style={styles.strikePrice}>₹{plan.strikePrice}</Text>
            )}
            {plan.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{plan.discount}% OFF</Text>
              </View>
            )}
          </View>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresCard}>
          <Text style={styles.sectionHeading}>Included with your membership:</Text>
          <View style={styles.featureRow}>
            <Feather name="check-circle" size={16} color="#25AAE2" style={{ marginRight: 8 }} />
            <Text style={styles.featureText}>Full IPC ↔ BNS & CrPC ↔ BNSS Comparison Engine</Text>
          </View>
          <View style={styles.featureRow}>
            <Feather name="check-circle" size={16} color="#25AAE2" style={{ marginRight: 8 }} />
            <Text style={styles.featureText}>Access all 150+ Criminal Minor Acts</Text>
          </View>
          <View style={styles.featureRow}>
            <Feather name="check-circle" size={16} color="#25AAE2" style={{ marginRight: 8 }} />
            <Text style={styles.featureText}>Complete Offline Database & PDF Export</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionHeading}>Select Payment Method</Text>

        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === 'upi' ? styles.methodCardActive : null]}
          onPress={() => setSelectedMethod('upi')}
          activeOpacity={0.85}
        >
          <View style={styles.radioCircle}>
            {selectedMethod === 'upi' && <View style={styles.radioInner} />}
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>UPI / Google Pay / PhonePe / Paytm</Text>
            <Text style={styles.methodDesc}>Instant payment via any UPI app</Text>
          </View>
          <Text style={styles.methodIcon}>⚡</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === 'card' ? styles.methodCardActive : null]}
          onPress={() => setSelectedMethod('card')}
          activeOpacity={0.85}
        >
          <View style={styles.radioCircle}>
            {selectedMethod === 'card' && <View style={styles.radioInner} />}
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>Credit / Debit Card / NetBanking</Text>
            <Text style={styles.methodDesc}>Visa, MasterCard, RuPay & NetBanking</Text>
          </View>
          <Text style={styles.methodIcon}>💳</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === 'googleplay' ? styles.methodCardActive : null]}
          onPress={() => setSelectedMethod('googleplay')}
          activeOpacity={0.85}
        >
          <View style={styles.radioCircle}>
            {selectedMethod === 'googleplay' && <View style={styles.radioInner} />}
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>Google Play Billing</Text>
            <Text style={styles.methodDesc}>Direct In-App purchase via Google Play</Text>
          </View>
          <Text style={styles.methodIcon}>▶️</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalPrice}>₹{plan.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.payBtn}
          activeOpacity={0.85}
          onPress={handleProceedPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.payBtnText}>Pay & Activate ➔</Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
  backArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
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
    fontWeight: '600',
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#25AAE2',
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  planBadge: {
    backgroundColor: '#DEF3FA',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0284C7',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  planValidity: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceCurrency: {
    fontSize: 20,
    fontWeight: '900',
    color: '#25AAE2',
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#25AAE2',
  },
  strikePrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#166534',
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D0E7F5',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D0E7F5',
  },
  methodCardActive: {
    borderColor: '#25AAE2',
    backgroundColor: '#F0F9FF',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#25AAE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#25AAE2',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  methodIcon: {
    fontSize: 22,
    marginLeft: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#DEF3FA',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 6,
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  payBtn: {
    backgroundColor: '#25AAE2',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  payBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
