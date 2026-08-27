import { ApiService } from '../../Services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fcmNotificationService } from '../../Services/fcmNotificationService';
import { SyncService } from '../../Services/syncService';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SideDrawerModal from '../../Components/SideDrawer';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 3;

export default function HomeScreen({ navigation }) {
  const [lastRead, setLastRead] = useState(null);
  const [popupNotification, setPopupNotification] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [synced, setSynced] = useState(true);

  const checkLivePopups = async () => {
    try {
      const list = await ApiService.notifications.get();
      if (Array.isArray(list) && list.length > 0) {
        const popupItem = list.find(n => n.isPopup);
        if (popupItem && popupItem.id) {
          const isDismissed = await AsyncStorage.getItem('@dismissed_popup_' + String(popupItem.id));
          const lastDismissedId = await AsyncStorage.getItem('@last_dismissed_popup_id');
          if (!isDismissed && lastDismissedId !== String(popupItem.id)) {
            setPopupNotification({
              id: popupItem.id,
              title: popupItem.title,
              message: popupItem.desc,
              buttonText: 'Dismiss',
              actionUrl: popupItem.actionUrl || ''
            });
          }
        }
      }
    } catch (e) {}
  };

  const handleDismissPopup = async () => {
    try {
      if (popupNotification?.id) {
        await AsyncStorage.setItem('@dismissed_popup_' + String(popupNotification.id), 'true');
        await AsyncStorage.setItem('@last_dismissed_popup_id', String(popupNotification.id));
      }
    } catch (e) {}
    const actionUrl = popupNotification?.actionUrl;
    setPopupNotification(null);
    if (actionUrl) {
      navigation.navigate('Notifications');
    }
  };

  const loadLastRead = async () => {
    try {
      const saved = await AsyncStorage.getItem('@last_read_section');
      if (saved) setLastRead(JSON.parse(saved));
    } catch (e) {}
  };

  useEffect(() => {
    checkLivePopups();
    loadLastRead();

    const unsub = fcmNotificationService.onInAppPopup((notif) => {
      setPopupNotification(notif);
    });

    const unsubscribeFocus = navigation.addListener('focus', () => {
      loadLastRead();
      checkLivePopups();
    });

    const interval = setInterval(checkLivePopups, 5000);

    return () => {
      if (typeof unsub === 'function') unsub();
      if (typeof unsubscribeFocus === 'function') unsubscribeFocus();
      clearInterval(interval);
    };
  }, [navigation]);

  useEffect(() => {
    SyncService.pullLatestChanges();
  }, []);

  const handleRefreshSync = async () => {
    setSynced(false);
    await SyncService.pullLatestChanges();
    setSynced(true);
    Alert.alert('Synced', 'Synchronized with Admin Portal.');
  };

  const criminalLaws = [
    { id: 'bns', code: 'BNS', title: 'Bharatiya\nNyaya Sanhita...', fullName: 'Bharatiya Nyaya Sanhita , 2023' },
    { id: 'bnss', code: 'BNSS', title: 'Bharatiya\nNagarik Surak...', fullName: 'Bharatiya Nagarik Suraksha Sanhita , 2023' },
    { id: 'bsa', code: 'BSA', title: 'Bharatiya\nSakshya Adhin...', fullName: 'Bharatiya Sakshya Adhiniyam , 2023' },
    { id: 'ipc', code: 'IPC', title: 'Indian Penal\nCode , 1860', fullName: 'Indian Penal Code , 1860' },
    { id: 'crpc', code: 'CrPC', title: 'Code of\nCriminal Proce...', fullName: 'Code of Criminal Procedure ,1973' },
    { id: 'iea', code: 'IEA', title: 'India Evidence\nAct, 1872', fullName: 'India Evidence Act, 1872' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Side Drawer Modal */}
      <SideDrawerModal
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
      />

      {/* 1. TOP DARK CURVED HEADER */}
      <View style={styles.darkHeader}>
        <View style={styles.headerTopRow}>
          {/* Menu Button */}
          <TouchableOpacity
            style={styles.menuCircleButton}
            onPress={() => setDrawerVisible(true)}
            activeOpacity={0.8}
          >
            <Icon name="menu-outline" size={26} color="#111827" />
          </TouchableOpacity>

          {/* THE-LAWMEN'S Title */}
          <Text style={styles.appTitle}>THE-LAWMEN'S</Text>

          {/* Notification Bell */}
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <Icon name="notifications-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Integrated Search Bar with embedded mic */}
        <TouchableOpacity
          style={styles.searchContainer}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Search')}
        >
          <Icon name="search-outline" size={20} color="#7C8698" style={{ marginRight: 8 }} />
          <Text style={styles.searchPlaceholder}>Search sections, laws...</Text>
          <View style={styles.micButton}>
            <Icon name="mic" size={18} color="#00A3FF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* 2. BODY CONTENT */}
      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sync Status Banner */}
        <View style={styles.syncBanner}>
          <View style={styles.syncLeft}>
            <Feather name="cloud" size={16} color="#00A3FF" style={{ marginRight: 6 }} />
            <Text style={styles.syncText}>
              {synced ? 'Synced just now' : 'Not synced yet'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.syncRefreshButton}
            onPress={handleRefreshSync}
            activeOpacity={0.7}
          >
            <Feather name="refresh-cw" size={14} color="#0085CC" />
          </TouchableOpacity>
        </View>

                {/* Continue Reading Card (Matching Image 2) */}
        <TouchableOpacity
          style={styles.continueCard}
          activeOpacity={0.85}
          onPress={() => {
            if (lastRead) {
              navigation.navigate('Sectiondetail', {
                sectionData: lastRead.sectionData || {
                  name: lastRead.sectionNumber,
                  keyword: lastRead.keyword,
                  content: typeof lastRead.content === 'string' ? [{ content: lastRead.content }] : (lastRead.content || [])
                },
                actTitle: lastRead.actTitle,
                chapterName: lastRead.chapterName || 'Provisions'
              });
            } else {
              navigation.navigate('ActOptions', { actTitle: 'Bharatiya Nyaya Sanhita , 2023', actCode: 'BNS' });
            }
          }}
        >
          <View style={styles.continueTopRow}>
            <Text style={styles.continueBadge}>CONTINUE READING</Text>
            <Feather name="book-open" size={18} color="#00A3FF" />
          </View>
          <Text style={styles.continueSubtitle} numberOfLines={1}>
            {lastRead ? lastRead.actTitle : 'Bharatiya Nyaya Sanhita , 2023'}
          </Text>
          <Text style={styles.continueTitle} numberOfLines={1}>
            {lastRead ? `Section ${lastRead.sectionNumber}: ${lastRead.keyword || 'Punishments'}` : 'Section 4: Punishments'}
          </Text>
        </TouchableOpacity>

        {/* Section Heading */}
        <Text style={styles.sectionHeading}>
          Criminal laws ( old and new )
        </Text>

        {/* 3-Column Law Book Grid */}
        <View style={styles.gridContainer}>
          {criminalLaws.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.bookCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ActOptions', { act: item })}
            >
              <View style={styles.bookIllustrationContainer}>
                <View style={styles.bookOuterCard}>
                  <View style={styles.bookLeftSpine} />
                  <Text style={styles.bookCodeText}>{item.code}</Text>
                  <View style={styles.bookDividerLine} />
                  <View style={[styles.bookDividerLine, { width: 16, marginTop: 3 }]} />
                </View>
              </View>

              <Text style={styles.bookTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Central Criminal Minor Acts Action Button (Page 6) */}
        <TouchableOpacity
          style={styles.actionPillBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('MinorActs')}
        >
          <Feather name="book" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.actionPillText}>Central Criminal Minor Acts</Text>
        </TouchableOpacity>

        {/* Ask Question Action Button (Page 6) */}
        <TouchableOpacity
          style={styles.actionPillBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Contact')}
        >
          <MaterialCommunityIcons name="chat-question-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.actionPillText}>Ask Question</Text>
        </TouchableOpacity>
      </ScrollView>
          {/* In-App Broadcast Popup Alert */}
      <Modal
        visible={!!popupNotification}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPopupNotification(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, alignItems: 'center', elevation: 8 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#DEF3FA', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Feather name="bell" size={32} color="#00A3FF" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6, textAlign: 'center' }}>
              {popupNotification?.title || 'Notice'}
            </Text>
            <Text style={{ fontSize: 13.5, color: '#475569', textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
              {popupNotification?.message || popupNotification?.desc}
            </Text>
            <TouchableOpacity
              style={{ width: '100%', backgroundColor: '#00A3FF', paddingVertical: 13, borderRadius: 14, alignItems: 'center' }}
              onPress={handleDismissPopup}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
                {popupNotification?.buttonText || 'Dismiss'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF7FC' },
  darkHeader: {
    backgroundColor: '#181A20',
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  menuCircleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00A3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  bellButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252830',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#323744',
  },
  searchPlaceholder: { flex: 1, fontSize: 14, color: '#7C8698' },
  micButton: { padding: 4 },
  bodyScroll: { flex: 1 },
  bodyContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 110 },
  syncBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  syncLeft: { flexDirection: 'row', alignItems: 'center' },
  syncText: { fontSize: 14, color: '#5C6B73', fontWeight: '600' },
  syncRefreshButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DEF3FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
    marginBottom: 16,
  },
  continueTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  continueBadge: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 0.8,
  },
  continueActSubtitle: { fontSize: 13, color: '#5C6B73', marginBottom: 4 },
  continueSectionTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bookCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
  },
  bookIllustrationContainer: {
    width: 64,
    height: 74,
    borderRadius: 12,
    backgroundColor: '#EDF7FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bookOuterCard: {
    width: 44,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bookLeftSpine: {
    position: 'absolute',
    left: 2,
    top: 4,
    bottom: 4,
    width: 2.5,
    backgroundColor: '#00A3FF',
    borderRadius: 1,
  },
  bookCodeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00A3FF',
    marginBottom: 4,
  },
  bookDividerLine: {
    width: 22,
    height: 2,
    backgroundColor: '#BAE6FD',
    borderRadius: 1,
  },
  bookTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 15,
  },
  actionPillBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#00A3FF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionPillText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});
