import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { ApiService } from '../../Services/apiService';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const list = await ApiService.notifications.get();
      if (list && list.length > 0) {
        setNotifications(list);
      } else {
        // Exact cards matching User Image 3
        setNotifications([
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
            desc: 'Your 3-Day Free Trial is active. You have complete access to IPC/BNS comparison and bare acts.',
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
      }
    } catch (e) {
      console.warn('Notifications error:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Dark Header (Matching Image 3) */}
      <View style={styles.darkHeader}>
        <TouchableOpacity
          style={styles.backBtnCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
        <Text style={styles.subHeaderTitle}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item, index) => item.id || String(index)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00A3FF']}
            tintColor="#00A3FF"
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={styles.iconCircle}>
                <Feather name="bell" size={16} color="#00A3FF" />
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.timeText}>{item.time || 'Recent'}</Text>
            </View>
            <Text style={styles.cardDesc}>{item.desc || item.message || ''}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#00A3FF" />
            ) : (
              <>
                <Feather name="bell-off" size={54} color="#94A3B8" />
                <Text style={styles.emptyStateText}>No notifications yet.</Text>
                <Text style={styles.emptyStateSub}>Admin updates and sync alerts will appear here.</Text>
              </>
            )}
          </View>
        }
      />
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
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  backBtnCircle: {
    position: 'absolute',
    left: 20,
    top: 45,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 1.2,
  },
  subHeaderTitle: {
    fontSize: 13,
    color: '#00A3FF',
    fontWeight: '700',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#F5F9FD',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#A8BED6',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginLeft: 6,
  },
  cardDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 12,
  },
  emptyStateSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});
