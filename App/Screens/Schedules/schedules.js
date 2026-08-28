import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { DataService } from '../../Services/dataService';

export default function SchedulesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('SECOND'); // 'FIRST', 'SECOND'
  const [search, setSearch] = useState('');
  const secondScheduleForms = DataService.getSecondSchedule();

  const filteredForms = secondScheduleForms.filter(f =>
    (f.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.formNo || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statutory Schedules</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'FIRST' && styles.tabBtnActive]}
          onPress={() => setActiveTab('FIRST')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'FIRST' && styles.tabTextActive]}>First Schedule (Offenses)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'SECOND' && styles.tabBtnActive]}
          onPress={() => setActiveTab('SECOND')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'SECOND' && styles.tabTextActive]}>Second Schedule (Forms - 57)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search statutory forms (e.g. Form 1, Summons, Warrant)..."
          placeholderTextColor="#7C8698"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={activeTab === 'SECOND' ? filteredForms : []}
        keyExtractor={(item, index) => item._id?.$oid || index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.formCard}>
            <View style={styles.formBadge}>
              <Text style={styles.formBadgeText}>{item.formNo}</Text>
            </View>
            <Text style={styles.formTitle}>{item.title}</Text>
            <Text style={styles.formContent} numberOfLines={4}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {activeTab === 'FIRST' ? 'First Schedule PDF classification table is available for offline download in BNSS section.' : 'No forms found.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF7FC' },
  header: { backgroundColor: '#181A20', paddingTop: 45, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12, padding: 4 },
  backText: { fontSize: 24, color: '#25AAE2', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, color: '#25AAE2', fontWeight: 'bold' },
  tabRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#D8ECF7' },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
  tabBtnActive: { borderColor: '#25AAE2' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#25AAE2' },
  searchBox: { padding: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#D8ECF7' },
  searchInput: { height: 40, backgroundColor: '#F3F8FB', borderRadius: 10, paddingHorizontal: 12, fontSize: 13, color: '#111827', borderWidth: 1, borderColor: '#D8ECF7' },
  listContent: { padding: 16, paddingBottom: 50 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#D8ECF7' },
  formBadge: { alignSelf: 'flex-start', backgroundColor: '#DEF3FA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  formBadgeText: { fontSize: 12, fontWeight: '800', color: '#0085CC' },
  formTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 6 },
  formContent: { fontSize: 13, color: '#475569', lineHeight: 19 },
  emptyState: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center' },
});
