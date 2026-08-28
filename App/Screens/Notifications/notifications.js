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
import { liveSyncService } from '../../Services/liveSyncService';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotifications();
    });

    // Auto-polling for real-time live notification broadcast sync
    const interval = setInterval(() => {
      loadNotifications(true);
    }, 5000);

    let removeSync = null;
    try {
      if (liveSyncService && typeof liveSyncService.subscribe === 'function') {
        removeSync = liveSyncService.subscribe((event) => {
          if (event?.type === 'CONTENT_CHANGED' && event?.data?.entity === 'notification') {
            loadNotifications();
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

  const loadNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const list = await ApiService.notifications.get();
      if (Array.isArray(list)) {
        setNotifications(list);
      }
    } catch (e) {
      console.warn('Notifications error:', e);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
  };

  const markAllAsRead = () => {
    const updated = notifications.map(item => ({ ...item, read: true }));
    setNotifications(updated);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.read ? styles.readCard : styles.unreadCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Feather name="bell" size={18} color="#25AAE2" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>
          <Text style={styles.cardDesc}>{item.desc}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Dark Curved Header */}
      <View style={styles.darkHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={20} color="#25AAE2" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerBrand}>THE-LAWMEN'S</Text>
          <Text style={styles.headerSubtitle}>Notifications</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#25AAE2" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#25AAE2']}
              tintColor="#25AAE2"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Feather name="bell-off" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySub}>You are completely up to date with legal broadcasts.</Text>
            </View>
          }
        />
      )}
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
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 170, 226, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: '900',
    color: '#25AAE2',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#25AAE2',
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#25AAE2',
  },
  readCard: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  cardTime: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
