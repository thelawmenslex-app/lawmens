import AsyncStorage from '@react-native-async-storage/async-storage';

export const SubscriptionService = {
  // Get 3-day trial and subscription status
  getStatus: async () => {
    try {
      let regTimeStr = await AsyncStorage.getItem('@trial_start_date');
      if (!regTimeStr) {
        regTimeStr = String(Date.now());
        await AsyncStorage.setItem('@trial_start_date', regTimeStr);
      }
      const regTime = Number(regTimeStr);
      const daysElapsed = (Date.now() - regTime) / (1000 * 60 * 60 * 24);
      const isSubscribedStr = await AsyncStorage.getItem('@is_subscribed');
      const isSubscribed = isSubscribedStr === 'true';

      const daysLeft = Math.max(0, Math.ceil(3 - daysElapsed));
      const isTrialActive = daysElapsed <= 3;
      const hasAccess = isSubscribed || isTrialActive;

      return {
        hasAccess,
        isTrialActive,
        isSubscribed,
        daysLeft,
        planType: isSubscribed ? 'Premium Pass' : (isTrialActive ? '3-Day Free Trial' : 'Trial Expired'),
        validTill: isSubscribed ? '13 Aug 2027' : `${daysLeft} Days Left`
      };
    } catch (e) {
      return {
        hasAccess: true,
        isTrialActive: true,
        isSubscribed: false,
        daysLeft: 3,
        planType: '3-Day Free Trial',
        validTill: '3 Days Left'
      };
    }
  },

  // Activate Subscription (Google Play / Admin pass)
  activateSubscription: async (orderId = 'GP_PURCHASE') => {
    await AsyncStorage.setItem('@is_subscribed', 'true');
    await AsyncStorage.setItem('@subscription_order_id', orderId);
    return { success: true };
  }
};
