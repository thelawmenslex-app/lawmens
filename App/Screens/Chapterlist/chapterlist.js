import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { DataService } from '../../Services/dataService';

export default function ChapterlistScreen({ route, navigation }) {
  const act = route?.params?.act || {
    id: 'bns',
    code: 'BNS',
    title: 'Bharatiya Nyaya Sanhita , 2023',
    fullName: 'Bharatiya Nyaya Sanhita , 2023'
  };

  const [search, setSearch] = useState('');

  const actCode = (act.code || act.id || 'BNS').toUpperCase();
  const actFullName = act.fullName || act.title || 'Bharatiya Nyaya Sanhita , 2023';

  const chapters = useMemo(() => {
    const list = DataService.getChaptersByCategory(actCode);
    if (list && list.length > 0) return list;
    return DataService.getChaptersByCategory('bns');
  }, [actCode]);

  const filteredChapters = useMemo(() => {
    if (!search.trim()) return chapters;
    const q = search.toLowerCase();
    return chapters.filter(c => (c.name || '').toLowerCase().includes(q));
  }, [chapters, search]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Dark Curved Header */}
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

        <Text style={styles.actTitleHeader} numberOfLines={1}>
          {actFullName}
        </Text>
        <Text style={styles.chapterSubtitle}>
          Chapters and Statutory Provisions ({chapters.length})
        </Text>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search sections or chapters..."
            placeholderTextColor="#7C8698"
            value={search}
            onChangeText={setSearch}
          />
          <Feather name="search" size={18} color="#94A3B8" />
        </View>
      </View>

      {/* Solid Cyan Chapter Cards (Exact Reference PDF Page 13) */}
      <FlatList
        data={filteredChapters}
        keyExtractor={(item, index) => item._id?.$oid || item._id || `chap_${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        windowSize={10}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chapters found for "{search}"</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chapterPillCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Seclist', {
              actTitle: actFullName,
              actCode: actCode,
              chapterName: item.name,
              sections: item.section || []
            })}
          >
            <View style={styles.chapterTextContainer}>
              <Text style={styles.chapterPillText}>
                {item.name}
              </Text>
              <Text style={styles.sectionCountText}>
                {item.section ? `${item.section.length} Sections` : 'Provisions'}
              </Text>
            </View>
            <Feather name="chevron-right" size={22} color="#111827" />
          </TouchableOpacity>
        )}
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
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25AAE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#25AAE2',
    letterSpacing: 1.2,
  },
  actTitleHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  chapterSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 14,
  },
  searchBox: {
    backgroundColor: '#252830',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#323744',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 10,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  chapterPillCard: {
    backgroundColor: '#25AAE2',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#7DD3FC',
    shadowColor: '#0284C7',
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  chapterTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  chapterPillText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    lineHeight: 19,
  },
  sectionCountText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#034E7B',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
});
