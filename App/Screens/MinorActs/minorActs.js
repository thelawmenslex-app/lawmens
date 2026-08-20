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
import { ApiService } from '../../Services/apiService';

export default function MinorActsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const allMinorActs = useMemo(() => {
    return ApiService.laws.getMinorActs();
  }, []);

  const filteredActs = useMemo(() => {
    if (!search.trim()) return allMinorActs;
    const q = search.toLowerCase();
    return allMinorActs.filter(a => (a.title || a.name || '').toLowerCase().includes(q));
  }, [allMinorActs, search]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />
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
        <Text style={styles.subHeaderTitle}>Central Criminal Minor Acts</Text>
      </View>

      <View style={styles.searchBox}>
        <Feather name="search" size={16} color="#7C8698" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Minor Acts..."
          placeholderTextColor="#7C8698"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredActs}
        keyExtractor={(item, index) => item._id?.$oid || index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.actCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Seclist', {
              actTitle: item.title || item.name,
              chapterName: 'Sections',
              sections: item.sections || [{ name: '1', content: [{ content: item.description || 'Statutory legal text published from Admin Portal.' }] }]
            })}
          >
            <View style={styles.iconBox}>
              <Feather name="book" size={18} color="#00A3FF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actTitle}>{item.title || item.name}</Text>
              <Text style={styles.actSubtitle}>{item.sections ? `${item.sections.length} Sections` : 'Central Legislation'}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Feather name="file-text" size={54} color="#94A3B8" />
            <Text style={styles.emptyStateText}>No Minor Acts found.</Text>
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
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  brandTitle: { fontSize: 22, fontWeight: '900', color: '#00A3FF' },
  subHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00A3FF',
    textAlign: 'center',
    marginTop: 8,
  },
  searchBox: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  actCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actTitle: { fontSize: 13, fontWeight: '800', color: '#111827', lineHeight: 18 },
  actSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 14,
  },
});
