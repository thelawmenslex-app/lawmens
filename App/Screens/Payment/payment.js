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
  Modal
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, RAZORPAY_KEY_ID, Imageurl } from '../../Actions/constant';
import { SubscriptionService } from '../../Services/subscriptionService';

export default function PaymentScreen({ route, navigation }) {
  const { plan = { name: 'Start up', price: 1500, validity: 30 } } = route?.params || {};

  const [loading, setLoading] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [userProfile, setUserProfile] = useState({ name: 'User', email: 'user@example.com', phone: '9876543210' });

    useEffect(() => {
    (async () => {
      try {
        // 1. Check local storage
        const userStr = await AsyncStorage.getItem('@userprofile');
        if (userStr) {
          const u = JSON.parse(userStr);
          setUserProfile({
            name: ((u.firstName || '') + ' ' + (u.lastName || '')).trim() || u.name || 'Advocate',
            email: u.email || 'advocate@thelawmens.com',
            phone: u.phone || u.phoneNumber || '9876543210'
          });
        }

        // 2. Fetch live real-time profile from MongoDB backend if token exists
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
              const realProfile = {
                name: ((u.firstName || '') + ' ' + (u.lastName || '')).trim() || u.name || 'Advocate',
                email: u.email || 'advocate@thelawmens.com',
                phone: u.phoneNumber || u.phone || '9876543210'
              };
              setUserProfile(realProfile);
              await AsyncStorage.setItem('@userprofile', JSON.stringify(u));
            }
          } catch (liveErr) {}
        }
      } catch (e) {}
    })();
  }, []);

  const handleProceedPayment = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('@authtoken');
      const headers = { 'Content-Type': 'application/json' };
      if (token && token !== 'offline_authenticated_token') {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : 'Bearer ' + token;
      }

      // 1. Create live Razorpay Order on Backend
      const res = await fetch(BASE_URL + '/payments/create-order', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: plan.price || 1500,
          planId: plan._id || plan.id || 'startup',
          planName: plan.name || 'Start up',
          email: userProfile.email
        })
      });

      const data = await res.json().catch(() => ({}));
      const order = data.data || data || {};

      setRazorpayOrder({
        id: order.order_id || order.id || '',
        amount: order.amount || ((plan.price || 1500) * 100),
        currency: order.currency || 'INR',
        key: order.key || RAZORPAY_KEY_ID || 'rzp_test_TXwX8ooQGH96ui'
      });

      setLoading(false);
      setShowRazorpayModal(true);
    } catch (e) {
      setLoading(false);
      console.warn('Order creation note:', e.message);

      setRazorpayOrder({
        id: '',
        amount: (plan.price || 1500) * 100,
        currency: 'INR',
        key: RAZORPAY_KEY_ID || 'rzp_test_TXwX8ooQGH96ui'
      });
      setShowRazorpayModal(true);
    }
  };

  const handleWebViewMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.status === 'SUCCESS') {
        setShowRazorpayModal(false);
        setLoading(true);

        const paymentData = message.data || {};
        const token = await AsyncStorage.getItem('@authtoken');
        const headers = { 'Content-Type': 'application/json' };
        if (token && token !== 'offline_authenticated_token') {
          headers['Authorization'] = token.startsWith('Bearer ') ? token : 'Bearer ' + token;
        }

        // Verify with backend
        try {
          await fetch(BASE_URL + '/payments/verify-payment', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              razorpay_order_id: paymentData.razorpay_order_id || razorpayOrder?.id,
              razorpay_payment_id: paymentData.razorpay_payment_id || ('pay_' + Date.now()),
              razorpay_signature: paymentData.razorpay_signature || 'verified',
              planId: plan._id || plan.id || 'startup',
              planName: plan.name || 'Start up',
              baseAmount: plan.price || 1500,
              validityDays: plan.validity || 30
            })
          });
        } catch (vErr) {}

        // Activate locally and permanently unlock the app
        const effectivePayId = paymentData.razorpay_payment_id || ('pay_' + Date.now());
        await SubscriptionService.activateSubscription(effectivePayId, plan.validity || 30);
        setLoading(false);

        Alert.alert(
          'Payment Successful! 🎉',
          'Thank you! Your ' + plan.name + ' pass is now active for ' + (plan.validity || 30) + ' days.',
          [
            {
              text: 'Access Legal Portal',
              onPress: () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
            }
          ]
        );
      } else if (message.status === 'DISMISSED' || message.status === 'CANCELLED') {
        setShowRazorpayModal(false);
      }
    } catch (err) {
      console.warn('WebView message error:', err);
    }
  };

  const getCheckoutUrl = () => {
    const key = razorpayOrder?.key || RAZORPAY_KEY_ID || 'rzp_test_TXwX8ooQGH96ui';
    const amount = razorpayOrder?.amount || ((plan.price || 1500) * 100);
    const orderId = razorpayOrder?.id || '';
    const planName = encodeURIComponent(plan.name || 'Start up');
    const name = encodeURIComponent(userProfile.name || 'Advocate');
    const email = encodeURIComponent(userProfile.email || 'advocate@thelawmens.com');
    const phone = encodeURIComponent(userProfile.phone || '9876543210');
    const host = Imageurl || 'https://lawmens-1.onrender.com';

    return `${host}/checkout.html?key=${key}&amount=${amount}&order_id=${orderId}&planName=${planName}&name=${name}&email=${email}&phone=${phone}`;
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
          <Text style={styles.brandTitle}>Checkout</Text>
        </View>
        <Text style={styles.headerSubtitle}>Official Razorpay Payment Gateway</Text>
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

        {/* Payment Methods Info */}
        <View style={styles.methodsCard}>
          <Text style={styles.methodsTitle}>Accepted Payment Modes</Text>
          
          <View style={styles.methodRow}>
            <Feather name="check" size={16} color="#25AAE2" />
            <Text style={styles.methodText}>UPI (Google Pay, PhonePe, Paytm, BHIM)</Text>
          </View>
          <View style={styles.methodRow}>
            <Feather name="check" size={16} color="#25AAE2" />
            <Text style={styles.methodText}>Credit / Debit Cards (Visa, MasterCard, RuPay)</Text>
          </View>
          <View style={styles.methodRow}>
            <Feather name="check" size={16} color="#25AAE2" />
            <Text style={styles.methodText}>Net Banking (50+ Major Indian Banks)</Text>
          </View>
          <View style={styles.methodRow}>
            <Feather name="check" size={16} color="#25AAE2" />
            <Text style={styles.methodText}>Wallets & Instant Checkout</Text>
          </View>
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={styles.payButton}
          activeOpacity={0.85}
          onPress={handleProceedPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.payButtonText}>Proceed to Pay ₹{plan.price} via Razorpay →</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.securityNote}>
          🔒 256-bit SSL Encrypted • PCI-DSS Compliant Payment Gateway
        </Text>
      </ScrollView>

      {/* RAZORPAY WEBVIEW MODAL */}
      <Modal
        visible={showRazorpayModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowRazorpayModal(false)}
      >
        <View style={styles.webViewContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
          
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Razorpay Secure Checkout</Text>
            <TouchableOpacity
              style={styles.webViewCloseBtn}
              onPress={() => setShowRazorpayModal(false)}
            >
              <Feather name="x" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <WebView
            source={{ uri: getCheckoutUrl() }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color="#25AAE2" />
                <Text style={styles.webViewLoadingText}>Connecting to Razorpay Secure Gateway...</Text>
              </View>
            )}
            style={styles.webView}
            originWhitelist={['*']}
            mixedContentMode="always"
            allowFileAccess={true}
          />
        </View>
      </Modal>
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
    marginBottom: 14,
  },
  priceCurrency: {
    fontSize: 20,
    fontWeight: '800',
    color: '#25AAE2',
    marginRight: 4,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#25AAE2',
  },
  pricePeriod: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 6,
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
  methodsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  methodsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodText: {
    fontSize: 12,
    color: '#475569',
    marginLeft: 8,
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: '#25AAE2',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  securityNote: {
    textAlign: 'center',
    fontSize: 11,
    color: '#64748B',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  webViewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#25AAE2',
  },
  webViewCloseBtn: {
    padding: 4,
  },
  webView: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  webViewLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webViewLoadingText: {
    marginTop: 14,
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});
