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

function parseSection(s) {
  if (!s) return { num: 0, suffix: '' };
  const str = String(s).trim();
  const match = str.match(/^(\d+)(.*)$/);
  if (match) {
    return { num: parseInt(match[1], 10), suffix: match[2].trim() };
  }
  return { num: 9999, suffix: str };
}

function sortListBySec(list, secKey) {
  return [...list].sort((a, b) => {
    const pa = parseSection(a[secKey]);
    const pb = parseSection(b[secKey]);
    if (pa.num !== pb.num) return pa.num - pb.num;
    return pa.suffix.localeCompare(pb.suffix);
  });
}

export default function MappingTableScreen({ route, navigation }) {
  const type = (route?.params?.type || '').toUpperCase();
  const actCode = (route?.params?.act?.code || '').toUpperCase();
  const [search, setSearch] = useState('');

  const config = useMemo(() => {
    // 1. BNSS -> CrPC
    if (type === 'BNSS_TO_CRPC' || (actCode === 'BNSS' && type.includes('CRPC'))) {
      const list = (mappingData.crpcToBnss || []).map(item => ({
        leftSec: item.newSec,
        rightSec: item.oldSec,
        title: item.title,
        leftContent: item.newContent,
        rightContent: item.oldContent,
        rawOldSec: item.oldSec,
        rawNewSec: item.newSec
      }));
      return {
        titleText: 'BNSS ↔ CrPC',
        subtitleText: 'Corresponding Section Table of BNSS with Code of Criminal Procedure',
        leftCode: 'BNSS',
        rightCode: 'CrPC',
        pairs: sortListBySec(list, 'leftSec')
      };
    }

    // 2. CrPC -> BNSS
    if (type === 'CRPC_TO_BNSS' || (actCode === 'CRPC' && type.includes('BNSS'))) {
      const list = (mappingData.crpcToBnss || []).map(item => ({
        leftSec: item.oldSec,
        rightSec: item.newSec,
        title: item.title,
        leftContent: item.oldContent,
        rightContent: item.newContent,
        rawOldSec: item.oldSec,
        rawNewSec: item.newSec
      }));
      return {
        titleText: 'CrPC ↔ BNSS',
        subtitleText: 'Corresponding Section Table of CrPC with BNSS',
        leftCode: 'CrPC',
        rightCode: 'BNSS',
        pairs: sortListBySec(list, 'leftSec')
      };
    }

    // 3. BSA -> IEA
    if (type === 'BSA_TO_IEA' || (actCode === 'BSA' && type.includes('IEA'))) {
      const list = (mappingData.ieaToBsa || []).map(item => ({
        leftSec: item.newSec,
        rightSec: item.oldSec,
        title: item.title,
        leftContent: item.newContent,
        rightContent: item.oldContent,
        rawOldSec: item.oldSec,
        rawNewSec: item.newSec
      }));
      return {
        titleText: 'BSA ↔ IEA',
        subtitleText: 'Corresponding Section Table of BSA with Indian Evidence Act',
        leftCode: 'BSA',
        rightCode: 'IEA',
        pairs: sortListBySec(list, 'leftSec')
      };
    }

    // 4. IEA -> BSA
    if (type === 'IEA_TO_BSA' || (actCode === 'IEA' && type.includes('BSA'))) {
      const list = (mappingData.ieaToBsa || []).map(item => ({
        leftSec: item.oldSec,
        rightSec: item.newSec,
        title: item.title,
        leftContent: item.oldContent,
        rightContent: item.newContent,
        rawOldSec: item.oldSec,
        rawNewSec: item.newSec
      }));
      return {
        titleText: 'IEA ↔ BSA',
        subtitleText: 'Corresponding Section Table of IEA with BSA',
        leftCode: 'IEA',
        rightCode: 'BSA',
        pairs: sortListBySec(list, 'leftSec')
      };
    }

    // 5. IPC -> BNS
    if (type === 'IPC_TO_BNS' || (actCode === 'IPC' && type.includes('BNS'))) {
      const list = (mappingData.ipcToBns || []).map(item => ({
        leftSec: item.oldSec,
        rightSec: item.newSec,
        title: item.title,
        leftContent: item.oldContent,
        rightContent: item.newContent,
        rawOldSec: item.oldSec,
        rawNewSec: item.newSec
      }));
      return {
        titleText: 'IPC ↔ BNS',
        subtitleText: 'Corresponding Section Table of IPC with BNS',
        leftCode: 'IPC',
        rightCode: 'BNS',
        pairs: sortListBySec(list, 'leftSec')
      };
    }

    // 6. Default: BNS -> IPC
    const list = (mappingData.ipcToBns || []).map(item => ({
      leftSec: item.newSec,
      rightSec: item.oldSec,
      title: item.title,
      leftContent: item.newContent,
      rightContent: item.oldContent,
      rawOldSec: item.oldSec,
      rawNewSec: item.newSec
    }));
    return {
      titleText: 'BNS ↔ IPC',
      subtitleText: 'Corresponding Section Table of BNS with Indian Penal Code (IPC)',
      leftCode: 'BNS',
      rightCode: 'IPC',
      pairs: sortListBySec(list, 'leftSec')
    };
  }, [type, actCode]);

  const filteredPairs = useMemo(() => {
    if (!search.trim()) return config.pairs;
    const q = search.toLowerCase();
    return config.pairs.filter(p =>
      (p.leftSec || '').toLowerCase().includes(q) ||
      (p.rightSec || '').toLowerCase().includes(q) ||
      (p.title || '').toLowerCase().includes(q)
    );
  }, [config.pairs, search]);

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
          <Text style={styles.headerTitle}>{config.titleText}</Text>
        </View>
        <Text style={styles.headerSubtitle}>{config.subtitleText}</Text>

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
        keyExtractor={(item, index) => `${item.leftSec}_${item.rightSec}_${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={30}
        windowSize={10}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.mapCard}
            activeOpacity={0.85}
            onPress={() => {
              navigation.navigate('Comparison', {
                ipcSec: item.rawOldSec,
                actCode: config.leftCode,
                oldSec: item.rawOldSec,
                newSec: item.rawNewSec,
                sectionData: {
                  keyword: item.title,
                  name: item.leftSec,
                  content: [{ content: item.leftContent }]
                }
              });
            }}
          >
            <View style={styles.leftCol}>
              <Text style={styles.leftSecText}>Sec {item.leftSec}</Text>
              <Text style={styles.leftDescText} numberOfLines={2}>{item.title}</Text>
            </View>

            <Text style={styles.arrowIcon}>➔</Text>

            <View style={styles.rightCol}>
              <Text style={styles.rightSecText}>Sec {item.rightSec}</Text>
              <Text style={styles.rightDescText}>{config.rightCode} Equivalent</Text>
            </View>
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
