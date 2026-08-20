import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backendroutes } from '../../Actions/constant';

export default function SubscriptionScreen({ navigation }) {
  const [plans, setPlans] = useState([
    {
      id: 'monthly',
      name: 'Monthly Pro Access',
      price: 199,
      strikePrice: 399,
      validity: 30,
      discount: 50,
      popular: false,
      features: [
        'Full IPC ↔ BNS Comparative Table',
        'CrPC ↔ BNSS & IEA ↔ BSA Engine',
        '150+ Central Criminal Minor Acts',
        'Standard PDF Export'
      ]
    },
    {
      id: 'annual',
      name: 'Annual Master Advocate',
      price: 999,
      strikePrice: 2388,
      validity: 365,
      discount: 60,
      popular: true,
      features: [
        'Everything in Monthly Access',
        'First & Second Schedules with Forms',
        'Complete Offline Database Sync',
        'Unlimited PDF Export with Citations',
        'Single-Device Priority Cloud Backup'
      ]
    },
    {
      id: 'quarterly',
      name: 'Quarterly Law Student',
      price: 499,
      strikePrice: 899,
      validity: 90,
      discount: 45,
      popular: false,
      features: [
        'All 6 Core Criminal Law Books',
        'Side-by-Side Live Diff Analysis',
        'Unlimited Bookmarks & Search'
      ]
    }
  ]);

  const [activeSub, setActiveSub] = useState(false);
  const [activePlanName, setActivePlanName] = useState('');

  useEffect(() => {
    checkActiveSubscription();
    fetchBackendPlans();
  }, []);

  const checkActiveSubscription = async () => {
    try {
      const active = await AsyncStorage.getItem('@subscription_active');
      const planName = await AsyncStorage.getItem('@plan_name');
      if (active === 'true') {
        setActiveSub(true);
        setActivePlanName(planName || 'Annual Master Advocate');
      }
    } catch (e) {}
  };

  const fetchBackendPlans = async () => {
    try {
      const res = await fetch(backendroutes.subscriptionPlans);
      const data = await res.json();
      if (data.status && data.data && data.data.length > 0) {
        setPlans(data.data);
      }
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Dark Curved Header */}
      <View style={styles.darkHeader}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backBtnCircle}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
        </View>
        <Text style={styles.subHeaderTitle}>Premium Legal Subscriptions</Text>
      </View>

      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Subscription Badge if Active */}
        {activeSub && (
          <View style={styles.activeBanner}>
            <Feather name="check-circle" size={20} color="#166534" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.activeBannerTitle}>Active Membership: {activePlanName}</Text>
              <Text style={styles.activeBannerDesc}>All premium legal acts & comparison tools unlocked.</Text>
            </View>
          </View>
        )}

        <Text style={styles.pageTitle}>Choose Your Plan</Text>
        <Text style={styles.pageSubtitle}>Unlock unlimited access to the entire Bharatiya & Colonial criminal law database.</Text>

        {/* Plan Cards */}
        {plans.map((plan) => (
          <View
            key={plan.id}
            style={[styles.planCard, plan.popular ? styles.popularPlanCard : null]}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>MOST POPULAR • BEST VALUE</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planValidity}>Validity: {plan.validity} Days</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.currency}>₹</Text>
              <Text style={styles.price}>{plan.price}</Text>
              {plan.strikePrice && (
                <Text style={styles.strikePrice}>₹{plan.strikePrice}</Text>
              )}
              {plan.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{plan.discount}% OFF</Text>
                </View>
              )}
            </View>

            {/* Features List */}
            <View style={styles.featuresList}>
              {(plan.features || []).map((feat, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Feather name="check" size={16} color="#00A3FF" style={{ marginRight: 8 }} />
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>

            {/* Subscribe Action Button */}
            <TouchableOpacity
              style={styles.subscribeBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Payment', { plan })}
            >
              <Text style={styles.subscribeBtnText}>Select {plan.name} ➔</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF7FC' },
  darkHeader: {
    backgroundColor: '#181A20',
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 1.2,
  },
  subHeaderTitle: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  bodyScroll: { flex: 1 },
  bodyContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  activeBanner: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
  },
  activeBannerDesc: {
    fontSize: 12,
    color: '#15803D',
    marginTop: 2,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginTop: -8,
    marginBottom: 4,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#D0E7F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  popularPlanCard: {
    borderColor: '#00A3FF',
    borderWidth: 2,
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  popularBadge: {
    backgroundColor: '#00A3FF',
    position: 'absolute',
    top: -12,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planHeader: {
    marginBottom: 10,
  },
  planName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  planValidity: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
    gap: 4,
  },
  currency: {
    fontSize: 18,
    fontWeight: '900',
    color: '#00A3FF',
  },
  price: {
    fontSize: 30,
    fontWeight: '900',
    color: '#00A3FF',
  },
  strikePrice: {
    fontSize: 16,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 8,
    fontWeight: '600',
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
  featuresList: {
    marginBottom: 18,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  subscribeBtn: {
    backgroundColor: '#00A3FF',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  subscribeBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
