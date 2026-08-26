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
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotifications();
    });
    return unsubscribe;
  }, [navigation]);

  const loadNotifications = async () => {
    try {
      const list = await ApiService.notifications.get();
      if (list && list.length > 0) {
        setNotifications(list);
      }
    } catch (e) {
      console.warn('Notifications error:', e);
    } finally {
      setLoading(false);
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
          <Feather name="bell" size={18} color="#00A3FF" />
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
          <Feather name="arrow-left" size={20} color="#00A3FF" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerBrand}>THE-LAWMEN'S</Text>
          <Text style={styles.headerSubtitle}>Notifications</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00A3FF" />
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
              colors={['#00A3FF']}
              tintColor="#00A3FF"
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
    backgroundColor: 'rgba(0, 163, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A3FF',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
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
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#00A3FF',
  },
  readCard: {
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
    fontSize: 14.5,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  cardTime: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
  },
});
