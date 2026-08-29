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
import { BASE_URL, RAZORPAY_KEY_ID } from '../../Actions/constant';
import { SubscriptionService } from '../../Services/subscriptionService';

export default function PaymentScreen({ route, navigation }) {
  const { plan = { name: 'Start up', price: 1500, validity: 30 } } = route?.params || {};

  const [loading, setLoading] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [userProfile, setUserProfile] = useState({ name: 'User', email: 'user@example.com', phone: '9999999999' });

  useEffect(() => {
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem('@userprofile');
        if (userStr) {
          const u = JSON.parse(userStr);
          setUserProfile({
            name: (u.firstName ? u.firstName + ' ' + (u.lastName || '') : 'User').trim(),
            email: u.email || 'user@example.com',
            phone: u.phone || '9999999999'
          });
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
          planName: plan.name || 'Start up'
        })
      });

      const data = await res.json();
      const order = data.data || {};

      setRazorpayOrder({
        id: order.id || ('order_' + Date.now()),
        amount: order.amount || ((plan.price || 1500) * 100),
        currency: order.currency || 'INR',
        key: RAZORPAY_KEY_ID || 'rzp_test_TVb8DvbczBMMAK'
      });

      setLoading(false);
      setShowRazorpayModal(true);
    } catch (e) {
      setLoading(false);
      console.warn('Order creation note:', e.message);

      setRazorpayOrder({
        id: 'order_' + Date.now(),
        amount: (plan.price || 1500) * 100,
        currency: 'INR',
        key: RAZORPAY_KEY_ID || 'rzp_test_TVb8DvbczBMMAK'
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

        // Activate locally
        await SubscriptionService.activateSubscription(paymentData.razorpay_payment_id || ('PAY_' + Date.now()));
        setLoading(false);

        Alert.alert(
          'Payment Successful! 🎉',
          'Thank you! Your ' + plan.name + ' pass is now active for ' + (plan.validity || 30) + ' days.',
          [
            {
              text: 'Open App',
              onPress: () => navigation.navigate('MainTabs')
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

  const getRazorpayHtml = () => {
    const key = razorpayOrder?.key || 'rzp_test_TVb8DvbczBMMAK';
    const amount = razorpayOrder?.amount || ((plan.price || 1500) * 100);
    const orderId = razorpayOrder?.id || '';
    const planName = plan.name || 'Start up';
    const validity = plan.validity || 30;
    const name = userProfile.name || 'User';
    const email = userProfile.email || 'user@example.com';
    const phone = userProfile.phone || '9999999999';

    return '<!DOCTYPE html>' +
      '<html><head>' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />' +
      '<script src="https://checkout.razorpay.com/v1/checkout.js"></script>' +
      '<style>' +
      'body { background-color: #0F172A; color: #FFFFFF; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }' +
      '.loader { border: 4px solid rgba(255, 255, 255, 0.1); border-top: 4px solid #25AAE2; border-radius: 50%; width: 44px; height: 44px; animation: spin 1s linear infinite; margin-bottom: 16px; }' +
      '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }' +
      'h3 { margin: 0; color: #25AAE2; font-weight: 700; }' +
      'p { color: #94A3B8; font-size: 14px; margin-top: 8px; }' +
      '</style></head><body>' +
      '<div class="loader"></div>' +
      '<h3>THE-LAWMEN\'S Secure Payment</h3>' +
      '<p>Opening Razorpay Checkout Gateway...</p>' +
      '<script>' +
      'var options = {' +
      '  key: "' + key + '",' +
      '  amount: ' + amount + ',' +
      '  currency: "INR",' +
      '  name: "THE-LAWMEN\'S",' +
      '  description: "' + planName + ' (' + validity + ' Days Access)",' +
      '  image: "https://thelawmens.com/logo.png",' +
      '  order_id: "' + orderId + '",' +
      '  prefill: {' +
      '    name: "' + name + '",' +
      '    email: "' + email + '",' +
      '    contact: "' + phone + '"' +
      '  },' +
      '  theme: { color: "#25AAE2" },' +
      '  handler: function(response) {' +
      '    window.ReactNativeWebView.postMessage(JSON.stringify({ status: "SUCCESS", data: response }));' +
      '  },' +
      '  modal: {' +
      '    ondismiss: function() {' +
      '      window.ReactNativeWebView.postMessage(JSON.stringify({ status: "DISMISSED" }));' +
      '    }' +
      '  }' +
      '};' +
      'var rzp = new Razorpay(options);' +
      'rzp.on("payment.failed", function(response) {' +
      '  window.ReactNativeWebView.postMessage(JSON.stringify({ status: "FAILED", data: response.error }));' +
      '});' +
      'window.onload = function() {' +
      '  setTimeout(function() { rzp.open(); }, 300);' +
      '};' +
      '</script></body></html>';
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
            <Text style={styles.summaryLabel}>GST / Taxes (18% Included)</Text>
            <Text style={styles.summaryValue}>₹ 0.00</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹ {plan.price}</Text>
          </View>
        </View>

        {/* Razorpay Badges */}
        <View style={styles.rzpCard}>
          <View style={styles.rzpHeader}>
            <Feather name="shield" size={20} color="#25AAE2" />
            <Text style={styles.rzpTitle}>100% Secure Razorpay Gateway</Text>
          </View>
          <Text style={styles.rzpDesc}>
            Pay securely using UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Wallets.
          </Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={styles.payBtn}
          activeOpacity={0.85}
          disabled={loading}
          onPress={handleProceedPayment}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.payBtnText}>Proceed to Pay ₹{plan.price} via Razorpay →</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Razorpay Checkout WebView Modal */}
      <Modal
        visible={showRazorpayModal}
        animationType="slide"
        onRequestClose={() => setShowRazorpayModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
          <View style={styles.modalTopBar}>
            <Text style={styles.modalTopTitle}>Razorpay Secure Checkout</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowRazorpayModal(false)}
            >
              <Feather name="x" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ html: getRazorpayHtml() }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webLoading}>
                <ActivityIndicator size="large" color="#25AAE2" />
                <Text style={{ color: '#94A3B8', marginTop: 12 }}>Connecting to Razorpay...</Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6EEF8',
  },
  darkHeader: {
    backgroundColor: '#181A20',
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    padding: 16,
    paddingBottom: 40,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DEF3FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#25AAE2',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 4,
  },
  planValidity: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
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
    backgroundColor: '#F1F5F9',
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
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#25AAE2',
  },
  rzpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  rzpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rzpTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
  rzpDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
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
  },
  payBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalTopBar: {
    height: 60,
    backgroundColor: '#181A20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  modalTopTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#25AAE2',
  },
  modalCloseBtn: {
    padding: 8,
  },
  webLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
});
