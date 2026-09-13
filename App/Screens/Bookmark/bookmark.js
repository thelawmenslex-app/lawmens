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
import { ApiService } from '../../Services/apiService';

export default function BookmarkScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('bookmarks'); // 'bookmarks' | 'notes'
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    loadData();
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      const bmList = await ApiService.bookmarks.getAll();
      setBookmarks(bmList || []);
      const notesList = await ApiService.notes.getAllNotes();
      setNotes(notesList || []);
    } catch (e) {
      console.warn('Bookmark/notes load error:', e);
    }
  };

  const removeBookmark = async (itemToRemove) => {
    try {
      const key = await ApiService.getUserScopedKey('@bookmarks');
      const updated = bookmarks.filter(b => {
        if (b.id && itemToRemove.id) return b.id !== itemToRemove.id;
        return !(b.secName === itemToRemove.secName && b.actTitle === itemToRemove.actTitle);
      });
      setBookmarks(updated);
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('Remove bookmark error:', e);
    }
  };

  const removeNote = async (itemToRemove) => {
    try {
      await ApiService.notes.saveSectionNote(itemToRemove.actTitle, itemToRemove.secNumber, '');
      loadData();
    } catch (e) {
      console.warn('Remove note error:', e);
    }
  };

  const clearAllBookmarks = () => {
    Alert.alert(
      'Clear Bookmarks',
      'Remove all saved bookmarks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const key = await ApiService.getUserScopedKey('@bookmarks');
            setBookmarks([]);
            await AsyncStorage.setItem(key, JSON.stringify([]));
          }
        }
      ]
    );
  };

  const currentList = activeTab === 'bookmarks' ? bookmarks : notes;

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
          <Text style={styles.brandTitle}>Saved Content</Text>
          {activeTab === 'bookmarks' && bookmarks.length > 0 && (
            <TouchableOpacity onPress={clearAllBookmarks} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'bookmarks' && styles.tabBtnActive]}
            onPress={() => setActiveTab('bookmarks')}
            activeOpacity={0.8}
          >
            <Feather name="bookmark" size={14} color={activeTab === 'bookmarks' ? '#FFFFFF' : '#94A3B8'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, activeTab === 'bookmarks' && styles.tabTextActive]}>
              Bookmarks ({bookmarks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'notes' && styles.tabBtnActive]}
            onPress={() => setActiveTab('notes')}
            activeOpacity={0.8}
          >
            <Feather name="edit-3" size={14} color={activeTab === 'notes' ? '#FFFFFF' : '#94A3B8'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
              Notes ({notes.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={currentList}
        keyExtractor={(item, index) => item.id || `item_${item.actTitle}_${item.secName || item.secNumber}_${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (activeTab === 'notes') {
            return (
              <View style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.badgeBox}>
                    <Text style={styles.badgeText}>Sec {item.secNumber}</Text>
                  </View>
                  <Text style={styles.actTitle} numberOfLines={1}>{item.actTitle}</Text>
                  <TouchableOpacity
                    onPress={() => removeNote(item)}
                    style={styles.deleteBtn}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemTitle}>Personal Note</Text>
                <Text style={styles.itemDesc}>{item.note}</Text>

                <TouchableOpacity
                  style={styles.openBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Sectiondetail', {
                    actTitle: item.actTitle,
                    sectionData: { name: item.secNumber, keyword: `Section ${item.secNumber}` }
                  })}
                >
                  <Text style={styles.openBtnText}>Open Section</Text>
                  <Feather name="arrow-right" size={14} color="#25AAE2" />
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.badgeBox}>
                  <Text style={styles.badgeText}>Sec {item.secName}</Text>
                </View>
                <Text style={styles.actTitle} numberOfLines={1}>{item.actTitle}</Text>
                <TouchableOpacity
                  onPress={() => removeBookmark(item)}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                >
                  <Feather name="trash-2" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc} numberOfLines={3}>{item.desc}</Text>

              <TouchableOpacity
                style={styles.openBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Comparison', {
                  ipcSec: item.secName,
                  actTitle: item.actTitle,
                  actCode: item.actCode || 'IPC'
                })}
              >
                <Text style={styles.openBtnText}>Open Legal Reference</Text>
                <Feather name="arrow-right" size={14} color="#25AAE2" />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Feather name={activeTab === 'bookmarks' ? "bookmark" : "edit-3"} size={54} color="#94A3B8" />
            <Text style={styles.emptyStateText}>
              {activeTab === 'bookmarks' ? 'No bookmarks saved.' : 'No personal notes saved yet.'}
            </Text>
            <Text style={styles.emptyStateSub}>
              {activeTab === 'bookmarks' 
                ? 'Tap the bookmark icon on any section to save it here.' 
                : 'Tap "Notes" on any legal provision to write and save notes offline.'}
            </Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#2A2E39',
    borderRadius: 14,
    padding: 3,
    marginTop: 12,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: '#25AAE2',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
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
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  itemDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DEF3FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  openBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#25AAE2',
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
