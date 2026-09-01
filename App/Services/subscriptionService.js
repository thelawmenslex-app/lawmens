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

  // Authoritative status: strictly computes 3-day trial from registration
  getStatus: async () => {
    try {
      const token = await AsyncStorage.getItem('@authtoken');
      const userStr = await AsyncStorage.getItem('@userprofile');
      let user = userStr ? JSON.parse(userStr) : null;

      // 1. Check with Backend if token is available
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
            await AsyncStorage.setItem('@cached_subscription_status', JSON.stringify(serverData));
            
            return {
              hasAccess: serverData.hasAccess === true,
              isTrial: serverData.isTrial === true,
              isTrialActive: serverData.isTrial && !serverData.isExpired,
              isSubscribed: serverData.isPremium === true,
              isPremium: serverData.isPremium === true,
              canAccessMinorActs: serverData.canAccessMinorActs === true,
              daysLeft: serverData.daysRemaining || 0,
              planType: serverData.planName || (serverData.isPremium ? 'Premium License' : '3-Day Free Trial'),
              subtitle: serverData.isPremium ? 'Full Legal Research Access' : (serverData.hasAccess ? '3-Day Free Trial' : 'Trial Expired'),
              purchasedDate: serverData.purchasedDate ? new Date(serverData.purchasedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '13 Aug 2026',
              validTill: `${serverData.daysRemaining || 0} Days Left`,
              orderId: serverData.paymentId || 'FREE_TRIAL'
            };
          }
        } catch (apiErr) {
          console.warn('Live subscription status API note:', apiErr.message);
        }
      }

      // 2. Strict Local Calculation from User Registration Timestamp
      const isPremiumFlag = await AsyncStorage.getItem('@is_subscribed');
      const isPremium = user?.isPremium === true || isPremiumFlag === 'true';

      if (isPremium) {
        return {
          hasAccess: true,
          isTrial: false,
          isTrialActive: false,
          isSubscribed: true,
          isPremium: true,
          canAccessMinorActs: true,
          daysLeft: 30,
          planType: 'Start up',
          subtitle: 'Full Legal Research Access',
          purchasedDate: '13 Aug 2026',
          validTill: '30 Days Left',
          orderId: 'GPA.2338-4854-7510-16493'
        };
      }

      // Compute exact 3-day trial from registration date
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

  // Activate premium locally upon successful payment
  activateSubscription: async (paymentId) => {
    try {
      const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const statusObj = {
        hasAccess: true,
        isPremium: true,
        isTrial: false,
        isExpired: false,
        canAccessMinorActs: true,
        daysRemaining: 30,
        planName: 'Start up',
        paymentId: paymentId || ('PAY_' + Date.now()),
        purchasedDate: new Date().toISOString(),
        expiryDate: expirationDate
      };
      await AsyncStorage.setItem('@cached_subscription_status', JSON.stringify(statusObj));
      await AsyncStorage.setItem('@is_subscribed', 'true');
      await AsyncStorage.setItem('@subscription_order_id', paymentId || ('PAY_' + Date.now()));
    } catch (e) {}
  }
};
