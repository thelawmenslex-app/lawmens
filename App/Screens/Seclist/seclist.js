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
import { DataService } from '../../Services/dataService';

function parseSection(s) {
  if (!s) return { num: 0, suffix: '' };
  const str = String(s).trim();
  const match = str.match(/^(\d+)(.*)$/);
  if (match) {
    return { num: parseInt(match[1], 10), suffix: match[2].trim() };
  }
  return { num: 9999, suffix: str };
}

export default function SeclistScreen({ route, navigation }) {
  const {
    actTitle = 'Indian Penal Code , 1860',
    actCode = 'IPC',
    chapterName = 'CHAPTER I - PRELIMINARY',
    sections = []
  } = route?.params || {};

  const [search, setSearch] = useState('');

  // Fallback to DataService if sections was not provided in params
  const rawSections = useMemo(() => {
    if (sections && sections.length > 0) return sections;
    return DataService.getSections(actCode, chapterName);
  }, [sections, actCode, chapterName]);

  // Sort sections in natural numerical order
  const sortedSections = useMemo(() => {
    return [...rawSections].sort((a, b) => {
      const pa = parseSection(a.name);
      const pb = parseSection(b.name);
      if (pa.num !== pb.num) return pa.num - pb.num;
      return pa.suffix.localeCompare(pb.suffix);
    });
  }, [rawSections]);

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sortedSections;
    const q = search.toLowerCase();
    return sortedSections.filter(sec => {
      const nameMatch = (sec.name || '').toLowerCase().includes(q);
      const keyMatch = (sec.keyword || '').toLowerCase().includes(q);
      const contentMatch = (sec.content || []).some(c => (c.content || '').toLowerCase().includes(q));
      return nameMatch || keyMatch || contentMatch;
    });
  }, [sortedSections, search]);

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
        keyExtractor={(item, index) => item._id?.$oid || item._id || `${item.name}_${index}`}
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
              <View style={styles.sectionNumberBadge}>
                <Text style={styles.sectionNumberText}>Sec {item.name}</Text>
              </View>

              <View style={styles.sectionTextContainer}>
                <Text style={styles.sectionTitle} numberOfLines={2}>
                  {item.keyword || `Section ${item.name}`}
                </Text>
                {contentPreview ? (
                  <Text style={styles.sectionPreview} numberOfLines={2}>
                    {contentPreview}
                  </Text>
                ) : null}
              </View>

              <Text style={styles.chevron}>›</Text>
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
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  chapterSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00A3FF',
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
  },
  searchIcon: {
    fontSize: 16,
    color: '#94A3B8',
    marginLeft: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D0E7F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionNumberBadge: {
    backgroundColor: '#DEF3FA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 65,
  },
  sectionNumberText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0284C7',
  },
  sectionTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 18,
  },
  sectionPreview: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '900',
    color: '#94A3B8',
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
