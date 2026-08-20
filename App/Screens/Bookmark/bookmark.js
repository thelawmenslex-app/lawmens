import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { ApiService } from '../../Services/apiService';

export default function BookmarkScreen({ navigation }) {
  const [bookmarks, setBookmarks] = useState([
    {
      id: '1',
      actTitle: 'Bharatiya Nyaya Sanhita , 2023',
      secName: '4',
      title: 'Section 4: Punishments',
      desc: 'Death, Imprisonment for life, Rigorous imprisonment, Simple imprisonment, Forfeiture of property, Fine, Community service.'
    },
    {
      id: '2',
      actTitle: 'Indian Penal Code , 1860',
      secName: '420',
      title: 'Section 420: Cheating and dishonestly inducing delivery of property',
      desc: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person...'
    },
    {
      id: '3',
      actTitle: 'Bharatiya Sakshya Adhiniyam , 2023',
      secName: '36',
      title: 'Section 36: Relevancy and effect of judgments, orders or decrees',
      desc: 'Judgments, orders or decrees other than those mentioned in section 35 are relevant if they relate to matters of a public nature...'
    }
  ]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    const list = await ApiService.bookmarks.getAll();
    if (list && list.length > 0) {
      setBookmarks(list);
    }
  };

  const removeBookmark = async (item) => {
    await ApiService.bookmarks.toggle(item);
    loadBookmarks();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Dark Curved Header */}
      <View style={styles.darkHeader}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
      </View>

      <FlatList
        data={bookmarks}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={styles.badgeBox}>
                <Text style={styles.badgeText}>Sec {item.secName}</Text>
              </View>
              <Text style={styles.actTitle} numberOfLines={1}>{item.actTitle}</Text>
              <TouchableOpacity
                onPress={() => removeBookmark(item)}
                style={styles.deleteBtn}
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
                actCode: item.actCode
              })}
            >
              <Text style={styles.openBtnText}>Open Legal Reference</Text>
              <Feather name="arrow-right" size={14} color="#00A3FF" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="bookmark" size={54} color="#94A3B8" />
            <Text style={styles.emptyText}>No bookmarks saved yet.</Text>
          </View>
        }
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
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#00A3FF' },
  listContent: { padding: 16, paddingBottom: 110, gap: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  badgeBox: {
    backgroundColor: '#DEF3FA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  badgeText: { fontSize: 11, fontWeight: '900', color: '#00A3FF' },
  actTitle: { flex: 1, fontSize: 12, color: '#64748B', fontWeight: '700' },
  deleteBtn: { padding: 4 },
  itemTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 4 },
  itemDesc: { fontSize: 12, color: '#475569', lineHeight: 18, marginBottom: 12 },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 10,
  },
  openBtnText: { fontSize: 12, fontWeight: '800', color: '#00A3FF' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 15, color: '#64748B', fontWeight: '600', marginTop: 12 },
});
