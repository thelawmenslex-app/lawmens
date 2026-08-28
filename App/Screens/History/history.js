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
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });
    loadHistory();
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    try {
      const histStr = await AsyncStorage.getItem('@read_history');
      if (histStr) {
        setHistory(JSON.parse(histStr));
      } else {
        // Default sample fallback
        setHistory([
          {
            actTitle: 'Bharatiya Nyaya Sanhita , 2023',
            sectionNumber: '4',
            keyword: 'Punishments',
            title: 'Section 4: Punishments',
            chapterName: 'Punishments',
            timestamp: Date.now() - 1000 * 60 * 5
          },
          {
            actTitle: 'Indian Penal Code , 1860',
            sectionNumber: '369',
            keyword: 'Kidnapping or abducting child under ten years',
            title: 'Section 369: Kidnapping or abducting child under ten years',
            chapterName: 'Offences against the Human Body',
            timestamp: Date.now() - 1000 * 60 * 60 * 2
          }
        ]);
      }
    } catch (e) {
      console.warn('Load history error:', e);
    }
  };

  const removeHistoryItem = async (indexToRemove) => {
    try {
      const updated = history.filter((_, i) => i !== indexToRemove);
      setHistory(updated);
      await AsyncStorage.setItem('@read_history', JSON.stringify(updated));
    } catch (e) {}
  };

  const clearAllHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your entire reading history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setHistory([]);
            await AsyncStorage.removeItem('@read_history');
          }
        }
      ]
    );
  };

  const formatTime = (ts) => {
    if (!ts) return 'Recent';
    const diffMin = Math.floor((Date.now() - Number(ts)) / (1000 * 60));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} mins ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
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
            <Feather name="arrow-left" size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.brandTitle}>Reading History</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={clearAllHistory} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subHeaderCount}>{history.length} Recently Viewed Provisions</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item, index) => `hist_${item.actTitle}_${item.sectionNumber}_${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => {
              navigation.navigate('Sectiondetail', {
                sectionData: item.sectionData || {
                  name: item.sectionNumber,
                  keyword: item.keyword,
                  content: typeof item.content === 'string' ? [{ content: item.content }] : (item.content || [])
                },
                actTitle: item.actTitle,
                chapterName: item.chapterName || 'Provisions'
              });
            }}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.badgeBox}>
                <Text style={styles.badgeText}>Sec {item.sectionNumber}</Text>
              </View>
              <Text style={styles.actTitle} numberOfLines={1}>{item.actTitle}</Text>
              <TouchableOpacity
                onPress={() => removeHistoryItem(index)}
                style={styles.deleteBtn}
              >
                <Feather name="x" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.itemTitle}>{item.title || `Section ${item.sectionNumber}: ${item.keyword}`}</Text>
            
            <View style={styles.cardBottomRow}>
              <View style={styles.timeTag}>
                <Feather name="clock" size={12} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
              </View>
              <View style={styles.reopenTag}>
                <Text style={styles.reopenText}>Reopen Section</Text>
                <Feather name="chevron-right" size={14} color="#25AAE2" />
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Feather name="clock" size={54} color="#94A3B8" />
            <Text style={styles.emptyStateText}>No reading history yet.</Text>
            <Text style={styles.emptyStateSub}>Sections you read will automatically appear here.</Text>
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
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25AAE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  clearBtn: {
    backgroundColor: '#2A2E39',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  clearBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  subHeaderCount: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginLeft: 46,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#F5F9FD',
    borderRadius: 18,
    padding: 14,
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
  badgeBox: {
    backgroundColor: '#DEF3FA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#25AAE2',
  },
  actTitle: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  reopenTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reopenText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#25AAE2',
    marginRight: 2,
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
