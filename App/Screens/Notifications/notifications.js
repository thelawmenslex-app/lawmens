import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Criminal Laws Live in Database',
      desc: 'BNS, BNSS, and BSA complete 100+ chapters & sections are fully synced and ready for offline research.',
      time: 'Just now',
      read: false
    },
    {
      id: '2',
      title: 'Free Trial Activated',
      desc: 'Your 7-Day Free Trial is active. You have complete access to IPC/BNS comparison and bare acts.',
      time: '2 hours ago',
      read: false
    },
    {
      id: '3',
      title: 'Admin Content Update',
      desc: 'Central Criminal Minor Acts have been refreshed with official legislative PDF references.',
      time: '1 day ago',
      read: true
    }
  ]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Dark Header */}
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
        <Text style={styles.subHeaderTitle}>Notifications</Text>
      </View>

      {/* Notification Cards List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.notifCard, !item.read && styles.unreadCard]}>
            <View style={styles.notifHeaderRow}>
              <View style={styles.badgeBox}>
                <Feather name="bell" size={16} color="#00A3FF" />
              </View>
              <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
            <Text style={styles.notifDesc}>{item.desc}</Text>
          </View>
        )}
      />
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
  brandTitle: { fontSize: 22, fontWeight: '900', color: '#00A3FF' },
  subHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00A3FF',
    textAlign: 'center',
    marginTop: 8,
  },
  listContent: { padding: 16, gap: 12 },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
  },
  unreadCard: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F8FCFF',
  },
  notifHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  badgeBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  notifTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: '#111827' },
  notifTime: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  notifDesc: { fontSize: 13, color: '#475569', lineHeight: 19 },
});
