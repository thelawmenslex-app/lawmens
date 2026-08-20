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

export default function SeclistScreen({ route, navigation }) {
  const {
    actTitle = 'Indian Penal Code , 1860',
    actCode = 'IPC',
    chapterName = 'CHAPTER I - PRELIMINARY',
    sections = []
  } = route?.params || {};

  const [search, setSearch] = useState('');

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;
    const q = search.toLowerCase();
    return sections.filter(sec => {
      const nameMatch = (sec.name || '').toLowerCase().includes(q);
      const keyMatch = (sec.keyword || '').toLowerCase().includes(q);
      const contentMatch = (sec.content || []).some(c => (c.content || '').toLowerCase().includes(q));
      return nameMatch || keyMatch || contentMatch;
    });
  }, [sections, search]);

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
          <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
        </View>

        <Text style={styles.actTitleHeader} numberOfLines={1}>{actTitle}</Text>
        <Text style={styles.chapterSubtitle}>{chapterName}</Text>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search sections by number or keyword..."
            placeholderTextColor="#7C8698"
            value={search}
            onChangeText={setSearch}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>
      </View>

      {/* Sections List */}
      <FlatList
        data={filteredSections}
        keyExtractor={(item, index) => item._id?.$oid || item._id || item.name || index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sections found for this chapter.</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const contentPreview = item.content?.[0]?.content || '';
          return (
            <TouchableOpacity
              style={styles.sectionCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Comparison', {
                ipcSec: item.name,
                sectionData: item,
                actTitle: actTitle,
                actCode: actCode,
                chapterName: chapterName
              })}
            >
              <View style={styles.sectionHeaderRow}>
                <View style={styles.secBadge}>
                  <Text style={styles.secBadgeText}>Section {item.name}</Text>
                </View>
                <Text style={styles.compareTag}>Compare ➔</Text>
              </View>

              {item.keyword ? (
                <Text style={styles.keywordText} numberOfLines={2}>
                  {item.keyword}
                </Text>
              ) : null}

              {contentPreview ? (
                <Text style={styles.previewText} numberOfLines={2}>
                  {contentPreview}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
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
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    fontSize: 22,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 1.2,
  },
  actTitleHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E2E8F0',
    marginTop: 2,
  },
  chapterSubtitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#00A3FF',
    marginTop: 2,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  searchBox: {
    backgroundColor: '#252830',
    borderRadius: 12,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#323744',
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  searchIcon: {
    fontSize: 16,
    color: '#94A3B8',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  sectionCard: {
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  secBadge: {
    backgroundColor: '#DEF3FA',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  secBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0284C7',
  },
  compareTag: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#00A3FF',
  },
  keywordText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 19,
  },
  previewText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
});
