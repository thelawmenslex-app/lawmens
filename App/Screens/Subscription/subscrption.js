import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function SubscriptionScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Plans</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.planCard}>
          <Text style={styles.planName}>Annual Pro</Text>
          <Text style={styles.planPrice}>₹999 / year</Text>
          <Text style={styles.planDesc}>Unlimited access to all Acts, Casebooks, IPC-BNS mapping & offline sync.</Text>
          <TouchableOpacity style={styles.buyBtn} onPress={() => alert('Proceed to Payment')}>
            <Text style={styles.buyText}>Subscribe Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF7FC' },
  header: {
    backgroundColor: '#181A20',
    paddingTop: 45,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { marginRight: 14 },
  backText: { fontSize: 24, color: '#00A3FF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, color: '#00A3FF', fontWeight: 'bold' },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#00A3FF',
  },
  planName: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  planPrice: { fontSize: 24, fontWeight: '900', color: '#00A3FF', marginVertical: 8 },
  planDesc: { fontSize: 14, color: '#5C6B73', lineHeight: 20, marginBottom: 16 },
  buyBtn: {
    backgroundColor: '#00A3FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buyText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});
