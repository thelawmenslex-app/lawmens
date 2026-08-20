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

export default function ChapterlistScreen({ route, navigation }) {
  const act = route?.params?.act || { id: 'ipc', code: 'IPC', title: 'Indian Penal Code , 1860' };
  const [search, setSearch] = useState('');

  const chapters = useMemo(() => {
    return DataService.getChaptersByCategory(act.id || 'ipc');
  }, [act.id]);

  const filteredChapters = useMemo(() => {
    if (!search.trim()) return chapters;
    const q = search.toLowerCase();
    return chapters.filter(c => (c.name || '').toLowerCase().includes(q));
  }, [chapters, search]);

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

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search sections or chapters..."
            placeholderTextColor="#7C8698"
            value={search}
            onChangeText={setSearch}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>
      </View>

      {/* Solid Cyan Chapter Cards with Full Chapter Names */}
      <FlatList
        data={filteredChapters}
        keyExtractor={(item, index) => item._id?.$oid || item._id || index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chapterPillCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Seclist', {
              actTitle: act.fullName || act.title,
              actCode: act.code || 'IPC',
              chapterName: item.name,
              sections: item.section || []
            })}
          >
            <View style={styles.chapterTextContainer}>
              <Text style={styles.chapterPillText}>
                {item.name}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
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
    marginBottom: 16,
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
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  chapterPillCard: {
    backgroundColor: '#00A3FF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
  chevron: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
});
