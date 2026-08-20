import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';

export default function HistoryScreen({ navigation }) {
  const [historyItems, setHistoryItems] = useState([
    {
      id: 'h1',
      actTitle: 'Bharatiya Nyaya Sanhita , 2023',
      actCode: 'BNS',
      sectionNumber: '4',
      keyword: 'Punishments (Community Service added)',
      time: 'Today, 2:45 PM'
    },
    {
      id: 'h2',
      actTitle: 'Indian Penal Code , 1860',
      actCode: 'IPC',
      sectionNumber: '420',
      keyword: 'Cheating and dishonestly inducing delivery of property',
      time: 'Yesterday'
    },
    {
      id: 'h3',
      actTitle: 'Bharatiya Nagarik Suraksha Sanhita , 2023',
      actCode: 'BNSS',
      sectionNumber: '63',
      keyword: 'Form of summons',
      time: '2 days ago'
    }
  ]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('@reading_history');
      if (stored) {
        setHistoryItems(JSON.parse(stored));
      }
    } catch (e) {}
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your reading history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@reading_history');
            setHistoryItems([]);
          }
        }
      ]
    );
  };

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
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.brandTitle}>Reading History</Text>
          {historyItems.length > 0 && (
            <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
              <Feather name="trash-2" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.headerSubtitle}>Recently viewed legal sections & acts</Text>
      </View>

      {/* History List */}
      <FlatList
        data={historyItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Feather name="clock" size={48} color="#94A3B8" style={{ marginBottom: 14 }} />
            <Text style={styles.emptyTitle}>No Reading History</Text>
            <Text style={styles.emptyDesc}>Sections and legal provisions you read will appear here.</Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Text style={styles.exploreBtnText}>Explore Statutes</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.historyCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Comparison', {
              ipcSec: item.sectionNumber,
              actTitle: item.actTitle,
              actCode: item.actCode
            })}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.actCode || 'ACT'}</Text>
              </View>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>

            <Text style={styles.secTitle}>Section {item.sectionNumber}</Text>
            <Text style={styles.keywordText} numberOfLines={2}>{item.keyword}</Text>
            <Text style={styles.actSubtitle} numberOfLines={1}>{item.actTitle}</Text>
          </TouchableOpacity>
        )}
      />
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
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
  backArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  brandTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 1.2,
  },
  clearBtn: {
    padding: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D0E7F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#DEF3FA',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0284C7',
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  secTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  keywordText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    lineHeight: 18,
  },
  actSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: '#00A3FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});