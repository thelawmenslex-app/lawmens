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
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function SubscriptionScreen({ navigation }) {
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [status, setStatus] = useState({
    hasAccess: true,
    isTrialActive: true,
    isSubscribed: false,
    daysLeft: 3,
    planType: '3-Day Free Trial',
    validTill: '3 Days Left'
  });
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const s = await SubscriptionService.getStatus();
    setStatus(s);
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

  const plans = [
    {
      id: 'startup',
      name: 'Start up',
      price: 1500,
      validity: 30,
      features: [
        'Full Access to all 125+ Bare Acts',
        'BNS vs IPC Comparative Table',
        'BNSS vs CrPC & BSA vs IEA Comparison',
        'Offline Reading & Unlimited Search'
      ]
    },
    {
      id: 'annual',
      name: 'Annual Master',
      price: 4999,
      validity: 365,
      features: [
        'Everything in Start up',
        'All Schedules & Legal Forms',
        'Single-Device Priority Cloud Backup',
        '24/7 Priority Support'
      ]
    }
  ];

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
        {/* Top Active License Card (Image 2) */}
        <View style={styles.licenseCard}>
          {/* Top Status Row */}
          <View style={styles.statusRow}>
            <View style={styles.activePill}>
              <View style={styles.greenDot} />
              <Text style={styles.activePillText}>ACTIVE PREMIUM PASS</Text>
            </View>
            <Text style={styles.daysLeftText}>{status.daysLeft} Days Left</Text>
          </View>

          {/* Plan Heading */}
          <Text style={styles.licenseTitle}>{status.planType}</Text>
          <Text style={styles.licenseSubtitle}>{status.subtitle || (status.isSubscribed ? 'Full Legal Research Access' : 'Free Access')}</Text>

          {/* Grey Details Box */}
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Purchased Date:</Text>
              <Text style={styles.detailValueBold}>{status.purchasedDate || '13 Aug 2026'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Valid Till (Expiry):</Text>
              <Text style={styles.detailValueGreen}>{status.validTill}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Receipt / Order ID:</Text>
              <Text style={styles.detailValueMono}>{status.orderId || 'GPA.2338-4854-7510-16493'}</Text>
            </View>
          </View>

          {/* Upgrade / Extend Plan Action Button */}
          <TouchableOpacity
            style={styles.upgradeButton}
            activeOpacity={0.85}
            onPress={() => setShowPlansModal(true)}
          >
            <Text style={styles.upgradeButtonText}>Upgrade / Extend Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Included Features Card (Image 2) */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresHeading}>
            Subscription Features Included:
          </Text>

          <View style={styles.featureItem}>
            <Feather name="check" size={18} color="#10B981" style={styles.checkIcon} />
            <Text style={styles.featureItemText}>
              Access to all 125+ Bare Acts & Schedules
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Feather name="check" size={18} color="#10B981" style={styles.checkIcon} />
            <Text style={styles.featureItemText}>
              Side-by-Side BNS vs IPC & BNSS vs CrPC Comparison
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Feather name="check" size={18} color="#10B981" style={styles.checkIcon} />
            <Text style={styles.featureItemText}>
              Full Offline Downloads & Reading
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Feather name="check" size={18} color="#10B981" style={styles.checkIcon} />
            <Text style={styles.featureItemText}>
              Unlimited Bookmarks & Instant Search
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Feather name="check" size={18} color="#10B981" style={styles.checkIcon} />
            <Text style={styles.featureItemText}>
              Ad-Free Premium Experience
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Upgrade / Plan Selection Modal */}
      <Modal
        visible={showPlansModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlansModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Choose Your Plan</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowPlansModal(false)}
              >
                <Feather name="x" size={20} color="#111827" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Unlock unlimited access to the entire Bharatiya & Colonial criminal law database.
            </Text>

            {plans.map((plan) => (
              <View key={plan.id} style={styles.modalPlanCard}>
                <Text style={styles.modalPlanName}>{plan.name}</Text>
                <Text style={styles.modalPlanValidity}>Validity: {plan.validity} Days</Text>
                <Text style={styles.modalPlanPrice}>₹ {plan.price}</Text>

                <TouchableOpacity
                  style={styles.modalPlanBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    setShowPlansModal(false);
                    navigation.navigate('Payment', { plan });
                  }}
                >
                  <Text style={styles.modalPlanBtnText}>Select {plan.name} ➔</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
  cyanSubheader: {
    backgroundColor: '#00A3FF',
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
    textAlign: 'center',
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  licenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.3,
  },
  daysLeftText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00A3FF',
  },
  licenseTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 2,
  },
  licenseSubtitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#00A3FF',
    marginBottom: 16,
  },
  detailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValueBold: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
  },
  detailValueGreen: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#10B981',
  },
  detailValueMono: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'monospace',
  },
  upgradeButton: {
    backgroundColor: '#00A3FF',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeButtonText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 14,
  },
  featuresHeading: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 10,
  },
  featureItemText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#EDF7FC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '80%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  modalPlanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#D0E7F5',
  },
  modalPlanName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  modalPlanValidity: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  modalPlanPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00A3FF',
    marginBottom: 12,
  },
  modalPlanBtn: {
    backgroundColor: '#00A3FF',
    borderRadius: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPlanBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
