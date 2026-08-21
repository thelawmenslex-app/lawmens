import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { DataService } from '../../Services/dataService';
import { ApiService } from '../../Services/apiService';
import { BASE_URL, Imageurl } from '../../Actions/constant';

export default function MinorActsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [acts, setActs] = useState(() => DataService.getMinorActs() || []);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActs();
  }, []);

  const loadActs = async () => {
    try {
      setLoading(true);
      const liveActs = await ApiService.laws.getMinorActs();
      if (liveActs && liveActs.length > 0) {
        setActs(liveActs);
      }
    } catch (e) {
      console.warn('Minor acts load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const liveActs = await ApiService.laws.getMinorActs();
      if (liveActs && liveActs.length > 0) {
        setActs(liveActs);
      }
    } catch (e) {
      console.warn('Minor acts refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

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
        <Text style={styles.subHeaderCount}>Live Sync: {acts.length} Acts Available</Text>
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
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color="#7C8698" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredActs}
        keyExtractor={(item, index) => item._id?.$oid || item._id || `${item.name}_${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00A3FF']}
            tintColor="#00A3FF"
          />
        }
        renderItem={({ item, index }) => {
          const actTitle = item.title || item.name || 'Minor Act';
          const hasPdf = Boolean(item.pdfUrl);

          return (
            <TouchableOpacity
              style={styles.actCard}
              activeOpacity={0.85}
              onPress={() => {
                navigation.navigate('Seclist', {
                  actTitle: actTitle,
                  chapterName: 'Sections',
                  sections: item.sections && item.sections.length > 0
                    ? item.sections
                    : [{
                        name: '1',
                        keyword: actTitle,
                        content: [{ content: item.description || `Official Legal Act — ${actTitle}. ${hasPdf ? 'Document is synchronized with Admin Portal.' : ''}` }]
                      }]
                });
              }}
            >
              <View style={styles.iconBox}>
                <Feather name={hasPdf ? "file-text" : "book"} size={18} color="#00A3FF" />
              </View>

              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.actTitle} numberOfLines={2}>{actTitle}</Text>
                <View style={styles.badgeRow}>
                  {hasPdf ? (
                    <View style={styles.pdfBadge}>
                      <Text style={styles.pdfBadgeText}>PDF Document</Text>
                    </View>
                  ) : null}
                  <Text style={styles.actSubtitle}>
                    {item.sections && item.sections.length > 0 ? `${item.sections.length} Sections` : 'Central Legislation'}
                  </Text>
                </View>
              </View>

              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#00A3FF" />
            ) : (
              <>
                <Feather name="file-text" size={54} color="#94A3B8" />
                <Text style={styles.emptyStateText}>No Minor Acts found.</Text>
                <Text style={styles.emptyStateSub}>Pull down to refresh from Admin server.</Text>
              </>
            )}
          </View>
        }
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
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 1.2,
  },
  subHeaderTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 2,
  },
  subHeaderCount: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D0E7F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },
  actCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
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
    marginRight: 12,
  },
  actTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pdfBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pdfBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  actSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
  },
  emptyStateSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});
