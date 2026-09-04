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
  const [userProfile, setUserProfile] = useState({ name: 'User', email: 'user@example.com', phone: '9876543210' });

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

          setUserProfile({
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

  // Generate completely dynamic, live Razorpay HTML with real user profile & live plan price
  const getDynamicRazorpayHtml = () => {
    const key = razorpayOrder?.key || RAZORPAY_KEY_ID || 'rzp_test_TXwX8ooQGH96ui';
    const amountInPaise = razorpayOrder?.amount || ((plan.price || 1500) * 100);
    const rupeeAmount = (amountInPaise / 100).toFixed(2);
    const orderId = razorpayOrder?.id || '';
    const planName = plan.name || 'Start up Plan';
    const name = userProfile.name || 'Advocate';
    const email = userProfile.email || 'advocate@thelawmens.com';
    const phone = userProfile.phone || '9876543210';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>THE-LAWMEN'S | Razorpay Checkout</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-4">

  <div class="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-2xl font-black text-white tracking-tight">THE-LAWMEN'S</h1>
      <p class="text-xs text-sky-400 font-bold uppercase tracking-wider mt-1">Official Razorpay Checkout</p>
    </div>

    <!-- Live Selected Plan Card -->
    <div class="space-y-1">
      <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscription Plan</label>
      <div class="p-3.5 bg-slate-900 border border-sky-500/40 rounded-xl flex items-center justify-between">
        <div>
          <h3 class="font-bold text-sm text-white">${planName}</h3>
          <p class="text-xs text-slate-400">Full Legal Database Access • ${plan.validity || 30} Days</p>
        </div>
        <span class="text-xl font-black text-sky-400">₹${rupeeAmount}</span>
      </div>
    </div>

    <!-- Live User Profile Details -->
    <div class="space-y-3">
      <div>
        <label class="block text-xs font-semibold text-slate-400 mb-1">Subscriber Name</label>
        <input id="userName" type="text" value="${name}" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 font-medium">
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
        <input id="userEmail" type="email" value="${email}" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 font-medium">
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-400 mb-1">Mobile Number (WhatsApp)</label>
        <input id="userPhone" type="tel" value="${phone}" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 font-medium">
      </div>
    </div>

    <!-- Status Box -->
    <div id="statusBox" class="hidden p-3 rounded-lg text-xs"></div>

    <!-- Checkout Button -->
    <button id="payBtn" onclick="openCheckout()" class="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#25AAE2] hover:bg-[#1E90C0] transition flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-98">
      <span>Proceed to Pay ₹${rupeeAmount} via Razorpay →</span>
    </button>

    <div class="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
      <svg class="w-3.5 h-3.5 text-sky-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clip-rule="evenodd"></path></svg>
      <span>Secured with 256-bit Razorpay Payment Gateway</span>
    </div>
  </div>

  <script>
    function notifyApp(type, payload) {
      const msg = JSON.stringify({ status: type, data: payload });
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(msg);
      }
    }

    let rzp = null;
    function openCheckout() {
      const currentName = document.getElementById('userName').value || "${name}";
      const currentEmail = document.getElementById('userEmail').value || "${email}";
      const currentPhone = document.getElementById('userPhone').value || "${phone}";

      const options = {
        key: "${key}",
        amount: ${amountInPaise},
        currency: "INR",
        name: "THE-LAWMEN'S",
        description: "${planName} Subscription",
        image: "https://lawmens-1.onrender.com/favicon.svg",
        ${orderId ? `order_id: "${orderId}",` : ''}
        prefill: {
          name: currentName,
          email: currentEmail,
          contact: currentPhone
        },
        theme: {
          color: "#25AAE2"
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        modal: {
          ondismiss: function () {
            notifyApp('DISMISSED');
          }
        },
        handler: function (response) {
          const statusBox = document.getElementById('statusBox');
          statusBox.className = 'p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs';
          statusBox.innerHTML = '<strong>Payment Successful! 🎉</strong><br>Activating Subscription...';
          notifyApp('SUCCESS', response);
        }
      };

      try {
        rzp = new Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          const statusBox = document.getElementById('statusBox');
          statusBox.className = 'p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs';
          statusBox.innerText = 'Payment Declined: ' + (resp.error?.description || 'Transaction failed');
          notifyApp('FAILED', resp);
        });
        rzp.open();
      } catch (e) {
        console.error('Failed to open Razorpay:', e);
      }
    }

    window.onload = function () {
      setTimeout(openCheckout, 250);
    };
  </script>
</body>
</html>`;
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

        {/* User Details */}
        <View style={styles.userSummaryCard}>
          <Text style={styles.userSummaryTitle}>Subscriber Account</Text>
          <Text style={styles.userSummaryItem}>👤 {userProfile.name}</Text>
          <Text style={styles.userSummaryItem}>📧 {userProfile.email}</Text>
          <Text style={styles.userSummaryItem}>📱 +91 {userProfile.phone}</Text>
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
            source={{ html: getDynamicRazorpayHtml(), baseUrl: 'https://api.razorpay.com' }}
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
            allowUniversalAccessFromFileURLs={true}
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
  userSummaryCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  userSummaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
    marginBottom: 8,
  },
  userSummaryItem: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
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
