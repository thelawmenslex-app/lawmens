import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../Actions/constant';

export const SubscriptionService = {
  // Fetch live active subscription plans
  getAvailablePlans: async () => {
    try {
      const res = await fetch(`${BASE_URL}/subscription/plans`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data && data.status && Array.isArray(data.data) && data.data.length > 0) {
        await AsyncStorage.setItem('@cached_subscription_plans', JSON.stringify(data.data));
        return data.data;
      }
    } catch (e) {
      console.log('Error fetching live subscription plans:', e.message);
    }
    try {
      const cached = await AsyncStorage.getItem('@cached_subscription_plans');
      if (cached) return JSON.parse(cached);
    } catch (e) {}

    return [
      {
        _id: 'startup',
        name: 'Start up',
        price: 1500,
        validity: 30,
        description: 'Gain comprehensive access to our legal database of newly enacted three criminal laws including the latest updates and exclusive content.'
      }
    ];
  },

  // Authoritative status verification
  getStatus: async () => {
    try {
      const isSubscribedFlag = await AsyncStorage.getItem('@is_subscribed');
      const userStr = await AsyncStorage.getItem('@userprofile');
      let user = userStr ? JSON.parse(userStr) : null;
      const orderId = await AsyncStorage.getItem('@subscription_order_id');

      // 1. If user completed payment (isSubscribed === 'true' or user.isPremium === true), UNLOCK FULL APP!
      if (isSubscribedFlag === 'true' || user?.isPremium === true) {
        return {
          hasAccess: true,
          isTrial: false,
          isTrialActive: false,
          isSubscribed: true,
          isPremium: true,
          canAccessMinorActs: true,
          daysLeft: 30,
          planType: 'Start up',
          subtitle: 'Full Legal Research Access (Active)',
          purchasedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          validTill: '30 Days Left',
          orderId: orderId || 'PAY_ACTIVE_PASS'
        };
      }

      // 2. Check with Backend if token is available
      const token = await AsyncStorage.getItem('@authtoken');
      if (token && token !== 'offline_authenticated_token') {
        try {
          const res = await fetch(`${BASE_URL}/subscription/status`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
            }
          });
          const json = await res.json();
          if (json && json.status && json.data) {
            const serverData = json.data;
            
            if (serverData.isPremium === true && serverData.hasAccess === true) {
              await AsyncStorage.setItem('@is_subscribed', 'true');
              return {
                hasAccess: true,
                isTrial: false,
                isTrialActive: false,
                isSubscribed: true,
                isPremium: true,
                canAccessMinorActs: true,
                daysLeft: serverData.daysRemaining || 30,
                planType: serverData.planName || 'Start up',
                subtitle: 'Full Legal Research Access (Active)',
                purchasedDate: serverData.purchasedDate ? new Date(serverData.purchasedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '13 Aug 2026',
                validTill: `${serverData.daysRemaining || 30} Days Left`,
                orderId: serverData.paymentId || 'PAY_ACTIVE_PASS'
              };
            }
            
            if (serverData.hasAccess === false) {
              return {
                hasAccess: false,
                isTrial: true,
                isTrialActive: false,
                isSubscribed: false,
                isPremium: false,
                canAccessMinorActs: false,
                daysLeft: 0,
                planType: 'Trial Expired',
                subtitle: 'Trial Expired • App Locked',
                purchasedDate: '13 Aug 2026',
                validTill: '0 Days Left',
                orderId: 'FREE_TRIAL'
              };
            }
          }
        } catch (apiErr) {
          console.warn('Live subscription status API note:', apiErr.message);
        }
      }

      // 3. Strict 3-day calculation from registration
      let trialStartMs = null;
      if (user?.createdAt) {
        trialStartMs = new Date(user.createdAt).getTime();
      } else {
        const storedTrialStart = await AsyncStorage.getItem('@trial_start_date');
        if (storedTrialStart) {
          trialStartMs = Number(storedTrialStart);
        } else {
          trialStartMs = Date.now();
          await AsyncStorage.setItem('@trial_start_date', String(trialStartMs));
        }
      }

      const now = Date.now();
      const trialDurationMs = 3 * 24 * 60 * 60 * 1000; // Strictly 3 Days
      const elapsedMs = now - trialStartMs;
      const isExpired = elapsedMs > trialDurationMs;
      const daysLeft = isExpired ? 0 : Math.max(0, Math.ceil((trialDurationMs - elapsedMs) / (1000 * 60 * 60 * 24)));

      return {
        hasAccess: !isExpired,
        isTrial: true,
        isTrialActive: !isExpired,
        isSubscribed: false,
        isPremium: false,
        canAccessMinorActs: false,
        daysLeft: daysLeft,
        planType: isExpired ? 'Trial Expired' : '3-Day Free Trial',
        subtitle: isExpired ? 'Trial Expired • App Locked' : 'Complimentary 3-Day Access',
        purchasedDate: new Date(trialStartMs).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        validTill: `${daysLeft} Days Left`,
        orderId: 'FREE_TRIAL'
      };
    } catch (e) {
      return {
        hasAccess: false,
        isTrial: true,
        isTrialActive: false,
        isSubscribed: false,
        isPremium: false,
        canAccessMinorActs: false,
        daysLeft: 0,
        planType: 'Trial Expired',
        subtitle: 'Trial Expired • App Locked',
        purchasedDate: '13 Aug 2026',
        validTill: '0 Days Left',
        orderId: 'FREE_TRIAL'
      };
    }
  },

  // Activate premium permanently upon payment verification
  activateSubscription: async (paymentId, validityDays = 30) => {
    try {
      const expirationDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();
      const effectivePaymentId = paymentId || ('pay_' + Date.now());

      await AsyncStorage.setItem('@is_subscribed', 'true');
      await AsyncStorage.setItem('@subscription_order_id', effectivePaymentId);

      const userStr = await AsyncStorage.getItem('@userprofile');
      let user = userStr ? JSON.parse(userStr) : {};
      user.isPremium = true;
      user.premiumPurchaseDate = new Date().toISOString();
      user.trialEndDate = expirationDate;
      user.premiumPaymentId = effectivePaymentId;
      await AsyncStorage.setItem('@userprofile', JSON.stringify(user));

      const statusObj = {
        hasAccess: true,
        isPremium: true,
        isTrial: false,
        isExpired: false,
        canAccessMinorActs: true,
        daysRemaining: validityDays,
        planName: 'Start up',
        paymentId: effectivePaymentId,
        purchasedDate: new Date().toISOString(),
        expiryDate: expirationDate
      };
      await AsyncStorage.setItem('@cached_subscription_status', JSON.stringify(statusObj));
      console.log('SUBSCRIPTION ACTIVATED & APP UNLOCKED SUCCESSFULLY!');
    } catch (e) {
      console.warn('activateSubscription error:', e);
    }
  }
};
