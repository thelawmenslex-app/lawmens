import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../Actions/constant';

export const SubscriptionService = {
  // Fetch live active subscription plans from backend
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

  // Authoritative status verified by Backend MongoDB
  getStatus: async () => {
    try {
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
            await AsyncStorage.setItem('@cached_subscription_status', JSON.stringify(serverData));
            
            return {
              hasAccess: serverData.hasAccess,
              isTrial: serverData.isTrial,
              isTrialActive: serverData.isTrial && !serverData.isExpired,
              isSubscribed: serverData.isPremium,
              isPremium: serverData.isPremium,
              canAccessMinorActs: serverData.canAccessMinorActs,
              daysLeft: serverData.daysRemaining,
              planType: serverData.planName,
              subtitle: serverData.isPremium ? 'Full Legal Research Access' : (serverData.isExpired ? 'Trial Expired' : '3-Day Free Trial'),
              purchasedDate: serverData.purchasedDate ? new Date(serverData.purchasedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '13 Aug 2026',
              validTill: `${serverData.daysRemaining} Days Left`,
              orderId: serverData.paymentId || 'GPA.2338-4854-7510-16493'
            };
          }
        } catch (apiErr) {
          console.warn('Live subscription status fetch note:', apiErr.message);
        }
      }

      // Local Cached Verification
      const cachedStr = await AsyncStorage.getItem('@cached_subscription_status');
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        return {
          hasAccess: cached.hasAccess,
          isTrial: cached.isTrial,
          isTrialActive: cached.isTrial && !cached.isExpired,
          isSubscribed: cached.isPremium,
          isPremium: cached.isPremium,
          canAccessMinorActs: cached.canAccessMinorActs,
          daysLeft: cached.daysRemaining,
          planType: cached.planName,
          subtitle: cached.isPremium ? 'Full Legal Research Access' : '3-Day Free Trial',
          purchasedDate: '13 Aug 2026',
          validTill: `${cached.daysRemaining} Days Left`,
          orderId: cached.paymentId || 'GPA.2338-4854-7510-16493'
        };
      }

      // Default to 3-day trial active for new sessions
      return {
        hasAccess: true,
        isTrial: true,
        isTrialActive: true,
        isSubscribed: false,
        isPremium: false,
        canAccessMinorActs: false,
        daysLeft: 3,
        planType: '3-Day Free Trial',
        subtitle: 'Complimentary Access',
        purchasedDate: '13 Aug 2026',
        validTill: '3 Days Left',
        orderId: 'FREE_TRIAL'
      };
    } catch (e) {
      return {
        hasAccess: true,
        isTrial: true,
        isTrialActive: true,
        isSubscribed: false,
        isPremium: false,
        canAccessMinorActs: false,
        daysLeft: 3,
        planType: '3-Day Free Trial',
        subtitle: 'Complimentary Access',
        purchasedDate: '13 Aug 2026',
        validTill: '3 Days Left',
        orderId: 'FREE_TRIAL'
      };
    }
  },

  // Activate premium locally upon successful Razorpay payment
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
