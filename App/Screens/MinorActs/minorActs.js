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
  ActivityIndicator,
  Linking,
  Alert
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataService } from '../../Services/dataService';
import { ApiService } from '../../Services/apiService';
import { SyncService } from '../../Services/syncService';
import { BASE_URL, Imageurl } from '../../Actions/constant';

export default function MinorActsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [acts, setActs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActs();
  }, []);

  const loadActs = async () => {
    try {
      // 1. Instant load from cached dynamic storage
      const cached = await SyncService.getMinorActs();
      if (cached && cached.length > 0) {
        setActs(cached);
        setLoading(false);
      }

      // 2. Fetch live updates from Admin Portal API
      const liveActs = await ApiService.laws.getMinorActs();
      if (liveActs && liveActs.length > 0) {
        setActs(liveActs);
      } else if (!cached) {
        setActs(DataService.getMinorActs());
      }
    } catch (e) {
      console.warn('Minor acts load error:', e);
      if (acts.length === 0) setActs(DataService.getMinorActs());
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

  const handleActPress = (item) => {
    const actTitle = item.name || item.title || 'Minor Act';
    const pdfUrl = item.pdfUrl;

    if (pdfUrl) {
      const fullPdfUrl = pdfUrl.startsWith('http')
        ? pdfUrl
        : `${Imageurl}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`;

      Alert.alert(
        actTitle,
        item.description || 'Document uploaded from Admin Portal.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open PDF',
            onPress: () => {
              Linking.openURL(fullPdfUrl).catch(() => {
                Alert.alert('PDF Viewer', `Opening PDF document: ${fullPdfUrl}`);
              });
            }
          },
          {
            text: 'View Law Text',
            onPress: () => {
              navigation.navigate('Seclist', {
                actTitle: actTitle,
                chapterName: 'Provisions',
                sections: item.sections && item.sections.length > 0
                  ? item.sections
                  : [{
                      name: '1',
                      keyword: actTitle,
                      content: [{ content: item.description || `Official Legal Act — ${actTitle}. Document is synchronized with Admin Portal.` }]
                    }]
              });
            }
          }
        ]
      );
    } else {
      navigation.navigate('Seclist', {
        actTitle: actTitle,
        chapterName: 'Sections',
        sections: item.sections && item.sections.length > 0
          ? item.sections
          : [{
              name: '1',
              keyword: actTitle,
              content: [{ content: item.description || `Official Legal Act — ${actTitle}.` }]
            }]
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Neumorphic Dark Header */}
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
        <Text style={styles.subHeaderCount}>Live Sync: {acts.length} Acts Cataloged</Text>
      </View>

      {/* Debossed Neumorphic Search Bar */}
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

      {/* Minor Acts List */}
      <FlatList
        data={filteredActs}
        keyExtractor={(item, index) => item._id?.$oid || item._id || `${item.name || item.title}_${index}`}
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
          const actTitle = item.name || item.title || 'Minor Act';
          const hasPdf = Boolean(item.pdfUrl);
          const orderNum = item.order !== undefined ? item.order + 1 : index + 1;

          return (
            <TouchableOpacity
              style={styles.actCard}
              activeOpacity={0.85}
              onPress={() => handleActPress(item)}
            >
              {/* Order Number Badge */}
              <View style={styles.orderBadge}>
                <Text style={styles.orderBadgeText}>{orderNum}</Text>
              </View>

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
    backgroundColor: '#EBF3FB',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#A8BED6',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
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
    backgroundColor: '#F5F9FD',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#A8BED6',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  orderBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00A3FF',
  },
  iconBox: {
    width: 40,
    height: 40,
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
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
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
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
