import React, { useState, useEffect, useMemo } from 'react';
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
import { ApiService } from '../../Services/apiService';

export default function MinorActsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [acts, setActs] = useState(() => DataService.getMinorActs() || []);

  useEffect(() => {
    loadActs();
  }, []);

  const loadActs = async () => {
    try {
      const liveActs = await ApiService.laws.getMinorActs();
      if (liveActs && liveActs.length > 0) {
        setActs(liveActs);
      }
    } catch (e) {}
  };

  const filteredActs = useMemo(() => {
    if (!search.trim()) return acts;
    const q = search.toLowerCase();
    return acts.filter(a => (a.title || a.name || '').toLowerCase().includes(q));
  }, [acts, search]);

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
        keyExtractor={(item, index) => item._id?.$oid || item._id || index.toString()}
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
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 1.2,
  },
  subHeaderTitle: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 48,
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
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  listContent: { padding: 16, paddingBottom: 32, gap: 12 },
  actCard: {
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
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 2 },
  actSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  emptyStateContainer: { padding: 40, alignItems: 'center' },
  emptyStateText: { marginTop: 12, color: '#64748B', fontSize: 14 },
});
