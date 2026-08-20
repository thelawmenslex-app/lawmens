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
import mappingData from '../../Assets/Data/comprehensiveMappings.json';

export default function MappingTableScreen({ route, navigation }) {
  const type = route?.params?.type || 'IPC_TO_BNS';

  const isCrpcBnss = type.includes('CRPC') || type.includes('BNSS');
  const isIeaBsa = type.includes('IEA') || type.includes('BSA');

  const [search, setSearch] = useState('');

  const { rawPairs, titleText, subtitleText, oldCode, newCode } = useMemo(() => {
    if (isCrpcBnss) {
      const isBnssToCrpc = type === 'BNSS_TO_CRPC';
      return {
        rawPairs: mappingData.crpcToBnss || [],
        titleText: isBnssToCrpc ? 'BNSS ↔ CrPC' : 'CrPC ↔ BNSS',
        subtitleText: 'CrPC 1973 to BNSS 2023 Section Mapping Table',
        oldCode: 'CrPC',
        newCode: 'BNSS'
      };
    }

    if (isIeaBsa) {
      const isBsaToIea = type === 'BSA_TO_IEA';
      return {
        rawPairs: mappingData.ieaToBsa || [],
        titleText: isBsaToIea ? 'BSA ↔ IEA' : 'IEA ↔ BSA',
        subtitleText: 'IEA 1872 to BSA 2023 Section Mapping Table',
        oldCode: 'IEA',
        newCode: 'BSA'
      };
    }

    // Default IPC <-> BNS
    const isBnsToIpc = type === 'BNS_TO_IPC';
    return {
      rawPairs: mappingData.ipcToBns || [],
      titleText: isBnsToIpc ? 'BNS ↔ IPC' : 'IPC ↔ BNS',
      subtitleText: 'IPC 1860 to BNS 2023 Section Mapping Table',
      oldCode: 'IPC',
      newCode: 'BNS'
    };
  }, [type, isCrpcBnss, isIeaBsa]);

  const filteredPairs = useMemo(() => {
    if (!search.trim()) return rawPairs;
    const q = search.toLowerCase();
    return rawPairs.filter(p =>
      (p.oldSec || '').toLowerCase().includes(q) ||
      (p.newSec || '').toLowerCase().includes(q) ||
      (p.title || '').toLowerCase().includes(q)
    );
  }, [rawPairs, search]);

  const isReversed = type.startsWith('BNS_') || type.startsWith('BNSS_') || type.startsWith('BSA_');

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
          <Text style={styles.headerTitle}>{titleText}</Text>
        </View>
        <Text style={styles.headerSubtitle}>{subtitleText}</Text>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search section number or keyword..."
            placeholderTextColor="#7C8698"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Mapping Cards List */}
      <FlatList
        data={filteredPairs}
        keyExtractor={(item, index) => `${item.oldSec}_${item.newSec}_${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={25}
        windowSize={10}
        renderItem={({ item }) => {
          const leftSec = isReversed ? `Sec ${item.newSec}` : `Sec ${item.oldSec}`;
          const leftLabel = item.title;
          const rightSec = isReversed ? `Sec ${item.oldSec}` : `Sec ${item.newSec}`;
          const rightLabel = isReversed ? `${oldCode} Equivalent` : `${newCode} Equivalent`;

          return (
            <TouchableOpacity
              style={styles.mapCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Comparison', {
                ipcSec: item.oldSec,
                actCode: oldCode
              })}
            >
              <View style={styles.leftCol}>
                <Text style={styles.leftSecText}>{leftSec}</Text>
                <Text style={styles.leftDescText} numberOfLines={2}>{leftLabel}</Text>
              </View>

              <Text style={styles.arrowIcon}>➔</Text>

              <View style={styles.rightCol}>
                <Text style={styles.rightSecText}>{rightSec}</Text>
                <Text style={styles.rightDescText}>{rightLabel}</Text>
              </View>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 16,
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
    marginLeft: 10,
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
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#D0E7F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leftCol: {
    flex: 1,
  },
  leftSecText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00A3FF',
    marginBottom: 4,
  },
  leftDescText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 16,
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00A3FF',
    marginHorizontal: 12,
  },
  rightCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  rightSecText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  rightDescText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'right',
  },
});
