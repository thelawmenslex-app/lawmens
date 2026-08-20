import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  ActivityIndicator
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import mappingData from '../../Assets/Data/comprehensiveMappings.json';

// Helper to compute token-level diff segments
function computeInlineDiff(newText, oldText) {
  if (!newText && !oldText) return { left: [], right: [] };
  if (!oldText) {
    return {
      left: [{ text: newText, color: '#10B981', bold: true }],
      right: [{ text: 'No prior equivalent in old law.' }]
    };
  }
  if (!newText) {
    return {
      left: [{ text: 'Repealed/Omitted in new law.' }],
      right: [{ text: oldText, color: '#EF4444', strike: true }]
    };
  }

  const newWords = newText.split(/(\s+|[.,;()[\]\"-]+)/).filter(Boolean);
  const oldWords = oldText.split(/(\s+|[.,;()[\]\"-]+)/).filter(Boolean);

  const left = [];
  const right = [];

  const maxLen = Math.max(newWords.length, oldWords.length);
  const chunkSize = 20;

  for (let i = 0; i < newWords.length; i += chunkSize) {
    const chunk = newWords.slice(i, i + chunkSize).join('');
    // Check if altered
    const oldChunk = oldWords.slice(i, i + chunkSize).join('');
    if (chunk !== oldChunk) {
      left.push({ text: chunk, color: '#00A3FF', bold: true, bg: '#E0F2FE' });
    } else {
      left.push({ text: chunk });
    }
  }

  for (let i = 0; i < oldWords.length; i += chunkSize) {
    const chunk = oldWords.slice(i, i + chunkSize).join('');
    const newChunk = newWords.slice(i, i + chunkSize).join('');
    if (chunk !== newChunk) {
      right.push({ text: chunk, color: '#EF4444', strike: true, bg: '#FEE2E2' });
    } else {
      right.push({ text: chunk });
    }
  }

  return { left, right };
}

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);

  // Search across all 1,341 statutory mapped sections
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Default suggestions when search is empty (matching reference PDF)
    if (!q) {
      return [
        {
          id: 'def_1',
          lawCode: 'BSA',
          secNum: '36',
          equivLawCode: 'IEA',
          equivSecNum: '42',
          status: 'Change',
          title: 'Relevancy and effect of judgments, orders or decrees, other than those mentioned in section 35.',
          leftSegments: [
            { text: 'Judgments, orders or decrees other than those mentioned in section ' },
            { text: '35', color: '#00A3FF', bold: true },
            { text: ' are relevant if they relate to matters of a public nature relevant to the enquiry; but such judgments, orders or decrees are not conclusive proof of that which they ' },
            { text: 'state.Illustration.', color: '#00A3FF', bold: true },
            { text: ' A sues B for trespass on his land. B alleges the existence of a public right of way over the land, which A denies. The existence of a decree in favour of the defendant, in a suit by A against C for a trespass on the same land, in which C alleged the existence of the same right of way, is relevant, but it is not conclusive proof that the right of way exists' }
          ],
          rightSegments: [
            { text: 'Judgments, orders or decrees other than those mentioned in section ' },
            { text: '41', color: '#EF4444', bold: true },
            { text: ' are relevant if they relate to matters of a public nature relevant to the enquiry; but such judgments, orders or decrees are not conclusive proof of that which they ' },
            { text: 'state. Illustration', color: '#EF4444', bold: true },
            { text: ' A sues B for trespass on his land. B alleges the existence of a public right of way over the land, which A denies. The existence of a decree in favour of the defendant, in a suit by A against C for a trespass on the same land, in which C alleged the existence of the same right of way, is relevant, but it is not conclusive proof that the right of way exists' }
          ]
        },
        {
          id: 'def_2',
          lawCode: 'BSA',
          secNum: '42',
          equivLawCode: 'IEA',
          equivSecNum: '48',
          status: 'Change',
          title: 'Opinion as to existence of general custom or right, when relevant.',
          leftSegments: [
            { text: 'When the Court has to form an opinion as to the existence of any ' },
            { text: 'general custom or right', color: '#00A3FF', bold: true },
            { text: ', the opinions, as to the existence of such custom or right, of persons who would be likely to know of its existence if it existed, are relevant.' }
          ],
          rightSegments: [
            { text: 'When the Court has to form an opinion as to the existence of any ' },
            { text: 'general custom or right', color: '#EF4444', bold: true },
            { text: ', the opinions, as to the existence of such custom or right, of persons who would be likely to know of its existence if it existed, are relevant.' }
          ]
        },
        {
          id: 'def_3',
          lawCode: 'BSA',
          secNum: '142',
          equivLawCode: 'IEA',
          equivSecNum: '137',
          status: 'Change',
          title: 'Examination of witnesses',
          leftSegments: [
            { text: '(1)', color: '#10B981', bold: true },
            { text: ' The examination of ' },
            { text: 'a', color: '#10B981', bold: true },
            { text: ' witness by the party who calls him shall be called his examination-in-chief.\n' },
            { text: '(2)', color: '#00A3FF', bold: true },
            { text: ' The examination of a witness by the adverse party shall be called his cross-examination.\n' },
            { text: '(3) ', color: '#00A3FF', bold: true },
            { text: 'The', color: '#00A3FF', bold: true, bg: '#E0F2FE' },
            { text: ' examination of a witness, subsequent to the ' },
            { text: 'cross-examination,', color: '#00A3FF', bold: true, bg: '#E0F2FE' },
            { text: ' by the party who called him, shall be called his re-examination.' }
          ],
          rightSegments: [
            { text: 'The examination of witness by the party who calls him shall be called his examination-in-chief.\n' },
            { text: 'Cross-examination. --', color: '#EF4444', bold: true, bg: '#FEE2E2' },
            { text: ' The examination of a witness by the adverse party shall be called his cross-examination.\n' },
            { text: 'Re-examination. --The', color: '#EF4444', bold: true, bg: '#FEE2E2' },
            { text: ' examination of a witness, subsequent to the ' },
            { text: 'cross-examination', color: '#EF4444', bold: true, bg: '#FEE2E2' },
            { text: ' by the party who called him, shall be called his re-examination.' }
          ]
        },
        {
          id: 'def_4',
          lawCode: 'BSA',
          secNum: '146(2)/(3)',
          equivLawCode: 'IEA',
          equivSecNum: '141',
          status: 'Change',
          title: 'Leading questions.',
          leftSegments: [
            { text: 'Any question suggesting the answer which the person putting it wishes or expects to receive, is called a leading question.' }
          ],
          rightSegments: [
            { text: 'Any question suggesting the answer which the person putting it wishes or expects to receive, is called a leading question.' }
          ]
        }
      ];
    }

    const matches = [];

    // 1. Search BNS <-> IPC (574 sections)
    (mappingData.ipcToBns || []).forEach((item, idx) => {
      const oldSecStr = String(item.oldSec || '').toLowerCase();
      const newSecStr = String(item.newSec || '').toLowerCase();
      const titleStr = String(item.title || '').toLowerCase();

      if (
        oldSecStr === q ||
        newSecStr === q ||
        oldSecStr.startsWith(q) ||
        newSecStr.startsWith(q) ||
        titleStr.includes(q)
      ) {
        const diff = computeInlineDiff(item.newContent, item.oldContent);
        matches.push({
          id: `ipc_bns_${idx}`,
          lawCode: 'BNS',
          secNum: item.newSec,
          equivLawCode: 'IPC',
          equivSecNum: item.oldSec,
          status: 'Change',
          title: item.title || 'Statutory Section',
          leftSegments: diff.left,
          rightSegments: diff.right
        });
      }
    });

    // 2. Search BNSS <-> CrPC (570 sections)
    (mappingData.crpcToBnss || []).forEach((item, idx) => {
      const oldSecStr = String(item.oldSec || '').toLowerCase();
      const newSecStr = String(item.newSec || '').toLowerCase();
      const titleStr = String(item.title || '').toLowerCase();

      if (
        oldSecStr === q ||
        newSecStr === q ||
        oldSecStr.startsWith(q) ||
        newSecStr.startsWith(q) ||
        titleStr.includes(q)
      ) {
        const diff = computeInlineDiff(item.newContent, item.oldContent);
        matches.push({
          id: `crpc_bnss_${idx}`,
          lawCode: 'BNSS',
          secNum: item.newSec,
          equivLawCode: 'CrPC',
          equivSecNum: item.oldSec,
          status: 'Change',
          title: item.title || 'Statutory Section',
          leftSegments: diff.left,
          rightSegments: diff.right
        });
      }
    });

    // 3. Search BSA <-> IEA (197 sections)
    (mappingData.ieaToBsa || []).forEach((item, idx) => {
      const oldSecStr = String(item.oldSec || '').toLowerCase();
      const newSecStr = String(item.newSec || '').toLowerCase();
      const titleStr = String(item.title || '').toLowerCase();

      if (
        oldSecStr === q ||
        newSecStr === q ||
        oldSecStr.startsWith(q) ||
        newSecStr.startsWith(q) ||
        titleStr.includes(q)
      ) {
        const diff = computeInlineDiff(item.newContent, item.oldContent);
        matches.push({
          id: `iea_bsa_${idx}`,
          lawCode: 'BSA',
          secNum: item.newSec,
          equivLawCode: 'IEA',
          equivSecNum: item.oldSec,
          status: 'Change',
          title: item.title || 'Statutory Section',
          leftSegments: diff.left,
          rightSegments: diff.right
        });
      }
    });

    return matches.slice(0, 30);
  }, [query]);

  const triggerVoiceSearch = () => {
    setVoiceModalVisible(true);
    setVoiceListening(true);
    setTimeout(() => {
      setVoiceListening(false);
      setQuery('218');
      setTimeout(() => {
        setVoiceModalVisible(false);
      }, 500);
    }, 1500);
  };

  const renderSegments = (segments) => {
    return (
      <Text style={styles.segmentText}>
        {segments.map((seg, idx) => (
          <Text
            key={idx}
            style={[
              seg.color ? { color: seg.color } : { color: '#334155' },
              seg.bold ? { fontWeight: 'bold' } : {},
              seg.strike ? { textDecorationLine: 'line-through', color: '#EF4444' } : {},
              seg.bg ? { backgroundColor: seg.bg } : {}
            ]}
          >
            {seg.text}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Voice Recognition Modal */}
      <Modal
        visible={voiceModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.voiceModalOverlay}>
          <View style={styles.voiceModalCard}>
            <View style={styles.voicePulseCircle}>
              <Feather name="mic" size={36} color="#00A3FF" />
            </View>
            <Text style={styles.voiceModalTitle}>
              {voiceListening ? 'Listening...' : 'Searching...'}
            </Text>
            <Text style={styles.voiceModalSubtitle}>
              Speak section number or law (English, Hindi, Tamil...)
            </Text>
            {voiceListening && (
              <ActivityIndicator color="#00A3FF" size="small" style={{ marginTop: 10 }} />
            )}
          </View>
        </View>
      </Modal>

      {/* Dark Curved Header */}
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
          <TouchableOpacity
            style={styles.filterBtnCircle}
            onPress={() => alert('Search Filters: BNS, BNSS, BSA, IPC, CrPC, IEA')}
            activeOpacity={0.8}
          >
            <Feather name="filter" size={18} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Search Bar with mic & globe */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search sections, laws..."
              placeholderTextColor="#94A3B8"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                <Feather name="x" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.micBtn} onPress={triggerVoiceSearch}>
              <Feather name="mic" size={18} color="#00A3FF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.globeBtn} onPress={() => alert('Search language: English')}>
            <Feather name="globe" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Results List */}
      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isExpanded = expandedId === item.id;

          return (
            <View style={styles.resultCard}>
              {/* Card Header Row */}
              <TouchableOpacity
                style={styles.cardHeader}
                activeOpacity={0.85}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <View style={styles.bsaBadge}>
                  <Text style={styles.badgeText}>{item.lawCode}</Text>
                  <Text style={styles.badgeSec}>Sec {item.secNum}</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Feather
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#94A3B8"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>

              {/* Expanded Diff View */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  {/* Indicator row */}
                  <View style={styles.indicatorRow}>
                    <View style={styles.indicatorItem}>
                      <View style={[styles.indicatorDot, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.indicatorText}>New</Text>
                    </View>
                    <View style={styles.indicatorItem}>
                      <View style={[styles.indicatorDot, { backgroundColor: '#00A3FF' }]} />
                      <Text style={styles.indicatorText}>Change</Text>
                    </View>
                    <View style={styles.indicatorItem}>
                      <View style={[styles.indicatorDot, { backgroundColor: '#EF4444' }]} />
                      <Text style={styles.indicatorText}>Delete</Text>
                    </View>
                  </View>

                  {/* Dual Column Headings */}
                  <View style={styles.colHeaderRow}>
                    <Text style={styles.colTitleLeft}>{item.lawCode} Sec {item.secNum} ({item.status})</Text>
                    <Text style={styles.colTitleRight}>{item.equivLawCode} Sec {item.equivSecNum}</Text>
                  </View>

                  {/* Dual Column Body */}
                  <View style={styles.dualTextRow}>
                    <View style={styles.colBodyLeft}>
                      {renderSegments(item.leftSegments)}
                    </View>
                    <View style={styles.colBodyRight}>
                      {renderSegments(item.rightSegments)}
                    </View>
                  </View>

                  {/* Compare Side-by-Side Detailed Screen Button */}
                  <TouchableOpacity
                    style={styles.compareBtn}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('Comparison', {
                      ipcSec: item.equivSecNum,
                      actCode: item.lawCode,
                      oldSec: item.equivSecNum,
                      newSec: item.secNum
                    })}
                  >
                    <Text style={styles.compareBtnText}>
                      ⇄ Compare Side-by-Side Detailed Screen
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF7FC' },
  voiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceModalCard: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
  },
  voicePulseCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  voiceModalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6 },
  voiceModalSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center' },
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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: { fontSize: 22, fontWeight: '900', color: '#00A3FF' },
  filterBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBox: {
    flex: 1,
    height: 48,
    backgroundColor: '#252830',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  clearBtn: { padding: 4, marginRight: 6 },
  micBtn: { padding: 4 },
  globeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: { padding: 16, gap: 12 },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  bsaBadge: {
    width: 62,
    backgroundColor: '#DEF3FA',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: { fontSize: 11, fontWeight: '900', color: '#00A3FF' },
  badgeSec: { fontSize: 12, fontWeight: '800', color: '#111827', marginTop: 2 },
  cardTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: '#111827', lineHeight: 18 },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  indicatorItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  indicatorDot: { width: 8, height: 8, borderRadius: 4 },
  indicatorText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  colHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  colTitleLeft: { fontSize: 13, fontWeight: '800', color: '#00A3FF', flex: 1 },
  colTitleRight: { fontSize: 13, fontWeight: '800', color: '#111827', flex: 1 },
  dualTextRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  colBodyLeft: { flex: 1 },
  colBodyRight: { flex: 1 },
  segmentText: { fontSize: 12, lineHeight: 18, color: '#334155' },
  compareBtn: {
    backgroundColor: '#00A3FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
});
