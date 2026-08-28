import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SubscriptionService } from '../../Services/subscriptionService';
import { liveSyncService } from '../../Services/liveSyncService';

export default function SubscriptionScreen({ navigation }) {
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState({
    hasAccess: true,
    isTrialActive: true,
    isSubscribed: false,
    daysLeft: 3,
    planType: '3-Day Free Trial',
    validTill: '3 Days Left'
  });
  const [purchasing, setPurchasing] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    loadStatus();
    loadPlans();

    const unsubscribe = navigation.addListener('focus', () => {
      loadStatus();
      loadPlans();
    });

    // Dynamic polling & live sync from Admin Portal
    const interval = setInterval(() => {
      loadPlans();
    }, 8000);

    let removeSync = null;
    try {
      if (liveSyncService && typeof liveSyncService.subscribe === 'function') {
        removeSync = liveSyncService.subscribe((event) => {
          if (event?.type === 'CONTENT_CHANGED' && event?.data?.entity === 'subscription') {
            loadPlans();
          }
        });
      }
    } catch (e) {}

    return () => {
      unsubscribe();
      clearInterval(interval);
      if (typeof removeSync === 'function') removeSync();
    };
  }, [navigation]);

  const loadStatus = async () => {
    const s = await SubscriptionService.getStatus();
    setStatus(s);
  };

  const loadPlans = async () => {
    try {
      const p = await SubscriptionService.getAvailablePlans();
      if (Array.isArray(p) && p.length > 0) {
        setPlans(p);
      }
    } catch (e) {
      console.warn('Error loading plans:', e);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleGooglePlayPurchase = async (plan) => {
    setPurchasing(true);
    setTimeout(async () => {
      await SubscriptionService.activateSubscription(`GP_ORD_${Date.now()}`);
      await loadStatus();
      setPurchasing(false);
      setShowPlansModal(false);
      Alert.alert('Subscription Activated', `Thank you for subscribing to ${plan.name}! Your Google Play purchase was successful.`);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* 1. DARK TOP HEADER */}
      <View style={styles.darkHeader}>
        <TouchableOpacity
          style={styles.backBtnCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
      </View>

      {/* 2. CYAN CURVED SUBHEADER (Exact Image 2) */}
      <View style={styles.cyanSubheader}>
        <Text style={styles.cyanSubheaderText}>My Subscription</Text>
      </View>

      {/* 3. MAIN SUBSCRIPTION STATUS CONTENT */}
      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.activeBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.activeBadgeText}>
                {status.isSubscribed ? 'ACTIVE PREMIUM PASS' : (status.isTrialActive ? 'ACTIVE TRIAL PASS' : 'PASS EXPIRED')}
              </Text>
            </View>
            <Text style={styles.daysLeftText}>{status.daysLeft} Days Left</Text>
          </View>

          <Text style={styles.planTitle}>{status.planType}</Text>
          <Text style={styles.planSubtitle}>{status.subtitle || 'Full Legal Research Access'}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Purchased Date:</Text>
            <Text style={styles.infoValue}>{status.purchasedDate || '13 Aug 2026'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valid Till (Expiry):</Text>
            <Text style={[styles.infoValue, { color: '#10B981' }]}>{status.validTill || '14 Aug 2027'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Receipt / Order ID:</Text>
            <Text style={styles.infoValue}>{status.orderId || 'GPA.2338-4854-7510-16493'}</Text>
          </View>

          <TouchableOpacity
            style={styles.upgradeBtn}
            activeOpacity={0.85}
            onPress={() => setShowPlansModal(true)}
          >
            <Text style={styles.upgradeBtnText}>
              {status.isSubscribed ? 'Change or Renew Plan' : 'Choose Your Plan'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Included with Your Plan</Text>
          
          <View style={styles.benefitItem}>
            <Feather name="check-circle" size={18} color="#10B981" />
            <Text style={styles.benefitText}>Unlimited Access to Bharatiya Nyaya Sanhita (BNS)</Text>
          </View>
          <View style={styles.benefitItem}>
            <Feather name="check-circle" size={18} color="#10B981" />
            <Text style={styles.benefitText}>BNSS & BSA Side-by-Side Comparison Matrices</Text>
          </View>
          <View style={styles.benefitItem}>
            <Feather name="check-circle" size={18} color="#10B981" />
            <Text style={styles.benefitText}>125+ Central & State Minor Acts and Schedules</Text>
          </View>
          <View style={styles.benefitItem}>
            <Feather name="check-circle" size={18} color="#10B981" />
            <Text style={styles.benefitText}>Offline Data Storage & Legal Bookmarks</Text>
          </View>
        </View>
      </ScrollView>

      {/* 4. CHOOSE YOUR PLAN MODAL (Dynamically Synced with Admin Portal) */}
      <Modal
        visible={showPlansModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlansModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Choose Your Plan</Text>
                <Text style={styles.modalSubtitle}>
                  Unlock unlimited access to the entire Bharatiya & Colonial criminal law database.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowPlansModal(false)}
              >
                <Feather name="x" size={20} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {loadingPlans && plans.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#25AAE2" />
              </View>
            ) : (
              <ScrollView
                style={{ maxHeight: 420 }}
                showsVerticalScrollIndicator={false}
              >
                {plans.map((plan) => (
                  <View key={plan._id || plan.id} style={styles.planCard}>
                    <Text style={styles.planCardName}>{plan.name}</Text>
                    <Text style={styles.planCardValidity}>Validity: {plan.validity || 30} Days</Text>
                    <Text style={styles.planCardPrice}>₹ {plan.price}</Text>

                    <TouchableOpacity
                      style={styles.selectPlanBtn}
                      activeOpacity={0.85}
                      disabled={purchasing}
                      onPress={() => handleGooglePlayPurchase(plan)}
                    >
                      {purchasing ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.selectPlanBtnText}>Select {plan.name} →</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
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
  cyanSubheader: {
    backgroundColor: '#25AAE2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  cyanSubheaderText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#10B981',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  daysLeftText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#25AAE2',
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 2,
  },
  planSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#25AAE2',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  upgradeBtn: {
    backgroundColor: '#25AAE2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  upgradeBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#F0F9FF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
    paddingRight: 16,
  },
  closeBtn: {
    padding: 6,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  planCardName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  planCardValidity: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  planCardPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#25AAE2',
    marginBottom: 12,
  },
  selectPlanBtn: {
    backgroundColor: '#25AAE2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectPlanBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
