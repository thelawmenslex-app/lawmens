import AsyncStorage from '@react-native-async-storage/async-storage';
import { liveSyncService } from '../../Services/liveSyncService';
import { Modal } from 'react-native';
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
      if (Array.isArray(list) && list.length > 0) {
        setNotifications(list);
        
        // Check for latest in-app popup
        const latest = list[0];
        const lastSeenPopup = await AsyncStorage.getItem('@last_seen_popup_id');
        if (latest && latest.isPopup && latest.id !== lastSeenPopup) {
          
        }
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
    
      {/* In-App Broadcast Popup Modal */}
      {activePopup && (
        <Modal
          visible={!!activePopup}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActivePopup(null)}
        >
          <View style={popupStyles.overlay}>
            <View style={popupStyles.modalCard}>
              <View style={popupStyles.bellCircle}>
                <Feather name="bell" size={28} color="#00A3FF" />
              </View>
              <Text style={popupStyles.popupTitle}>{activePopup.title}</Text>
              <Text style={popupStyles.popupDesc}>{activePopup.desc}</Text>
              <TouchableOpacity
                style={popupStyles.popupBtn}
                activeOpacity={0.85}
                onPress={() => setActivePopup(null)}
              >
                <Text style={popupStyles.popupBtnText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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

const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  bellCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  popupDesc: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  popupBtn: {
    backgroundColor: '#00A3FF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  popupBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
