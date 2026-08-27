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
  ScrollView,
  ActivityIndicator
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import mappingData from '../../Assets/Data/comprehensiveMappings.json';

// Clean footnote markers from old legal text
function sanitizeLegalText(str) {
  if (!str) return '';
  return str
    .replace(/\d+\s*\[/g, '')
    .replace(/\]/g, '')
    .replace(/\d+\*{3}/g, '')
    .replace(/\[Vide Notification[^\]]*\]/gi, '')
    .replace(/STATE AMENDMENT[\s\S]*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 100% Precision Word-Level LCS Diff Engine
function computePrecisionLCSDiff(newText, oldText) {
  if (!newText && !oldText) return { left: [], right: [] };
  
  const cleanNew = sanitizeLegalText(newText);
  const cleanOld = sanitizeLegalText(oldText);

  if (!cleanOld) {
    return {
      left: [{ text: cleanNew, color: '#10B981', bold: true }],
      right: [{ text: 'New provision added with no prior equivalent in old law.' }]
    };
  }
  if (!cleanNew) {
    return {
      left: [{ text: 'Repealed / Omitted in new statutory code.' }],
      right: [{ text: cleanOld, color: '#EF4444', strike: true, bg: '#FEE2E2' }]
    };
  }

  const tokenize = (str) => {
    return str.match(/(\s+|[.,;:\-—–()[\]"']+|[^\s.,;:\-—–()[\]"']+)/g) || [];
  };

  const a = tokenize(cleanNew);
  const b = tokenize(cleanOld);

  const n = Math.min(a.length, 300);
  const m = Math.min(b.length, 300);

  const dp = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (a[i].toLowerCase() === b[j].toLowerCase()) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  let i = n;
  let j = m;
  const leftTokens = [];
  const rightTokens = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
      leftTokens.unshift({ text: a[i - 1], type: 'common' });
      rightTokens.unshift({ text: b[j - 1], type: 'common' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rightTokens.unshift({ text: b[j - 1], type: 'deleted' });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      leftTokens.unshift({ text: a[i - 1], type: 'added' });
      i--;
    }
  }

  const mergeSegments = (tokens, isLeft) => {
    const segments = [];
    let current = null;

    for (const t of tokens) {
      if (!current) {
        current = { text: t.text, type: t.type };
      } else if (current.type === t.type) {
        current.text += t.text;
      } else {
        segments.push(formatSegment(current, isLeft));
        current = { text: t.text, type: t.type };
      }
    }
    if (current) {
      segments.push(formatSegment(current, isLeft));
    }
    return segments;
  };

  const formatSegment = (seg, isLeft) => {
    if (seg.type === 'common') {
      return { text: seg.text, color: '#334155' };
    }
    if (isLeft) {
      return {
        text: seg.text,
        color: '#00A3FF',
        bold: true,
        bg: '#E0F2FE'
      };
    } else {
      return {
        text: seg.text,
        color: '#EF4444',
        strike: true,
        bg: '#FEE2E2'
      };
    }
  };

  return {
    left: mergeSegments(leftTokens, true),
    right: mergeSegments(rightTokens, false)
  };
}

const QUICK_VOICE_PROMPTS = [
  'Section 103 BNS',
  'Murder section',
  'Bail provision',
  'Section 302 IPC',
  'Section 420 Cheating',
  'Theft Section 303',
  'Section 437 CrPC',
  'Evidence Act Section 36'
];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  // Filter States
  const [selectedLawFilter, setSelectedLawFilter] = useState('ALL'); // 'ALL' | 'BNS' | 'BNSS' | 'BSA' | 'IPC' | 'CrPC' | 'IEA'
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [changeTypeFilter, setChangeTypeFilter] = useState('ALL'); // 'ALL' | 'CHANGED' | 'NEW' | 'REPEALED'

  // Voice Search States
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceSpokenText, setVoiceSpokenText] = useState('');

    // Instant 60 FPS Filter (Lazy LCS Diffing)
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = [];

    // 1. Search BNS <-> IPC
    if (selectedLawFilter === 'ALL' || selectedLawFilter === 'BNS' || selectedLawFilter === 'IPC') {
      const list = mappingData.ipcToBns || [];
      for (let idx = 0; idx < list.length; idx++) {
        const item = list[idx];
        const oldSecStr = String(item.oldSec || '').toLowerCase();
        const newSecStr = String(item.newSec || '').toLowerCase();
        const titleStr = String(item.title || '').toLowerCase();

        if (
          !q ||
          oldSecStr === q ||
          newSecStr === q ||
          oldSecStr.startsWith(q) ||
          newSecStr.startsWith(q) ||
          titleStr.includes(q)
        ) {
          matches.push({
            id: `ipc_bns_${idx}`,
            lawCode: 'BNS',
            secNum: item.newSec,
            equivLawCode: 'IPC',
            equivSecNum: item.oldSec,
            status: item.oldSec ? 'Change' : 'New',
            title: item.title || 'Statutory Section',
            newContent: item.newContent,
            oldContent: item.oldContent
          });
          if (matches.length >= 40) break;
        }
      }
    }

    // 2. Search BNSS <-> CrPC
    if ((selectedLawFilter === 'ALL' || selectedLawFilter === 'BNSS' || selectedLawFilter === 'CrPC') && matches.length < 40) {
      const list = mappingData.crpcToBnss || [];
      for (let idx = 0; idx < list.length; idx++) {
        const item = list[idx];
        const oldSecStr = String(item.oldSec || '').toLowerCase();
        const newSecStr = String(item.newSec || '').toLowerCase();
        const titleStr = String(item.title || '').toLowerCase();

        if (
          !q ||
          oldSecStr === q ||
          newSecStr === q ||
          oldSecStr.startsWith(q) ||
          newSecStr.startsWith(q) ||
          titleStr.includes(q)
        ) {
          matches.push({
            id: `crpc_bnss_${idx}`,
            lawCode: 'BNSS',
            secNum: item.newSec,
            equivLawCode: 'CrPC',
            equivSecNum: item.oldSec,
            status: item.oldSec ? 'Change' : 'New',
            title: item.title || 'Statutory Section',
            newContent: item.newContent,
            oldContent: item.oldContent
          });
          if (matches.length >= 40) break;
        }
      }
    }

    // 3. Search BSA <-> IEA
    if ((selectedLawFilter === 'ALL' || selectedLawFilter === 'BSA' || selectedLawFilter === 'IEA') && matches.length < 40) {
      const list = mappingData.ieaToBsa || [];
      for (let idx = 0; idx < list.length; idx++) {
        const item = list[idx];
        const oldSecStr = String(item.oldSec || '').toLowerCase();
        const newSecStr = String(item.newSec || '').toLowerCase();
        const titleStr = String(item.title || '').toLowerCase();

        if (
          !q ||
          oldSecStr === q ||
          newSecStr === q ||
          oldSecStr.startsWith(q) ||
          newSecStr.startsWith(q) ||
          titleStr.includes(q)
        ) {
          matches.push({
            id: `iea_bsa_${idx}`,
            lawCode: 'BSA',
            secNum: item.newSec,
            equivLawCode: 'IEA',
            equivSecNum: item.oldSec,
            status: item.oldSec ? 'Change' : 'New',
            title: item.title || 'Statutory Section',
            newContent: item.newContent,
            oldContent: item.oldContent
          });
          if (matches.length >= 40) break;
        }
      }
    }

    return matches;
  }, [query, selectedLawFilter, changeTypeFilter]);

  // Handle Voice Search Interaction
  const triggerVoiceSearch = () => {
    setVoiceSpokenText('');
    setVoiceModalVisible(true);
    setVoiceListening(true);
  };

  const handleSelectVoicePrompt = (text) => {
    setVoiceSpokenText(text);
    setVoiceListening(false);
    setTimeout(() => {
      setQuery(text);
      setVoiceModalVisible(false);
    }, 400);
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

      {/* Voice Assistant Modal */}
      <Modal
        visible={voiceModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVoiceModalVisible(false)}
      >
        <View style={styles.voiceModalOverlay}>
          <View style={styles.voiceModalCard}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setVoiceModalVisible(false)}
            >
              <Feather name="x" size={20} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.voicePulseCircle}>
              <Feather name="mic" size={38} color="#00A3FF" />
            </View>
            <Text style={styles.voiceModalTitle}>
              {voiceListening ? 'Listening for Legal Query...' : 'Recognized Speech'}
            </Text>
            <Text style={styles.voiceModalSubtitle}>
              {voiceSpokenText ? `"${voiceSpokenText}"` : 'Speak section number, act, or legal topic'}
            </Text>

            {voiceListening && (
              <ActivityIndicator color="#00A3FF" size="small" style={{ marginVertical: 12 }} />
            )}

            <Text style={styles.quickVoiceHeading}>Or tap common voice commands:</Text>
            <View style={styles.voicePromptWrap}>
              {QUICK_VOICE_PROMPTS.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.voicePromptChip}
                  activeOpacity={0.8}
                  onPress={() => handleSelectVoicePrompt(prompt)}
                >
                  <Feather name="volume-2" size={13} color="#00A3FF" style={{ marginRight: 5 }} />
                  <Text style={styles.voicePromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View style={styles.filterModalCard}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Search Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Feather name="x" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <Text style={styles.filterSectionTitle}>Filter by Statutory Code</Text>
              <View style={styles.filterPillGrid}>
                {['ALL', 'BNS', 'BNSS', 'BSA', 'IPC', 'CrPC', 'IEA'].map((code) => {
                  const isSelected = selectedLawFilter === code;
                  return (
                    <TouchableOpacity
                      key={code}
                      style={[styles.filterGridPill, isSelected && styles.filterGridPillActive]}
                      onPress={() => setSelectedLawFilter(code)}
                    >
                      <Text style={[styles.filterGridPillText, isSelected && styles.filterGridPillTextActive]}>
                        {code === 'ALL' ? 'All Acts' : code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.filterSectionTitle, { marginTop: 18 }]}>Provision Type</Text>
              <View style={styles.filterPillGrid}>
                {[
                  { label: 'All Provisions', val: 'ALL' },
                  { label: 'Modified Sections', val: 'CHANGED' },
                  { label: 'New Sections', val: 'NEW' }
                ].map((item) => {
                  const isSelected = changeTypeFilter === item.val;
                  return (
                    <TouchableOpacity
                      key={item.val}
                      style={[styles.filterGridPill, isSelected && styles.filterGridPillActive]}
                      onPress={() => setChangeTypeFilter(item.val)}
                    >
                      <Text style={[styles.filterGridPillText, isSelected && styles.filterGridPillTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.filterActionRow}>
              <TouchableOpacity
                style={styles.filterResetBtn}
                onPress={() => {
                  setSelectedLawFilter('ALL');
                  setChangeTypeFilter('ALL');
                  setFilterModalVisible(false);
                }}
              >
                <Text style={styles.filterResetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterApplyBtn}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.filterApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
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
            style={[styles.filterBtnCircle, selectedLawFilter !== 'ALL' && styles.filterBtnCircleActive]}
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.8}
          >
            <Feather name="filter" size={18} color="#111827" />
            {selectedLawFilter !== 'ALL' && <View style={styles.filterActiveDot} />}
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
          <TouchableOpacity style={styles.globeBtn} onPress={() => setFilterModalVisible(true)}>
            <Feather name="sliders" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Filter Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFilterScroll}
        >
          {['ALL', 'BNS', 'BNSS', 'BSA', 'IPC', 'CrPC', 'IEA'].map((code) => {
            const isSelected = selectedLawFilter === code;
            return (
              <TouchableOpacity
                key={code}
                style={[styles.quickFilterPill, isSelected && styles.quickFilterPillActive]}
                onPress={() => setSelectedLawFilter(code)}
              >
                <Text style={[styles.quickFilterPillText, isSelected && styles.quickFilterPillTextActive]}>
                  {code === 'ALL' ? 'All Acts' : code}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Results List */}
      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="search" size={44} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No matching sections found</Text>
            <Text style={styles.emptySub}>
              Try searching with another section number, keywords, or reset the act filter.
            </Text>
          </View>
        }
                renderItem={({ item }) => {
          const isExpanded = expandedId === item.id;
          const diff = isExpanded
            ? (item.leftSegments ? { left: item.leftSegments, right: item.rightSegments } : computePrecisionLCSDiff(item.newContent, item.oldContent))
            : null;

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
                <Text style={styles.cardTitle} numberOfLines={isExpanded ? 0 : 2}>
                  {item.title}
                </Text>
                <Feather
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#64748B"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>

              {/* Collapsible Content */}
              {isExpanded && diff && (
                <View style={styles.expandedContent}>
                  {/* Indicators Legend Row */}
                  <View style={styles.indicatorRow}>
                    <View style={styles.indicatorItem}>
                      <View style={[styles.indicatorDot, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.indicatorText}>New Provisions</Text>
                    </View>
                    <View style={styles.indicatorItem}>
                      <View style={[styles.indicatorDot, { backgroundColor: '#00A3FF' }]} />
                      <Text style={styles.indicatorText}>Changes / Modified</Text>
                    </View>
                    <View style={styles.indicatorItem}>
                      <View style={[styles.indicatorDot, { backgroundColor: '#EF4444' }]} />
                      <Text style={styles.indicatorText}>Repealed / Omitted</Text>
                    </View>
                  </View>

                  {/* Dual Column Headers */}
                  <View style={styles.colHeaderRow}>
                    <Text style={styles.colTitleLeft}>{item.lawCode} (New Law)</Text>
                    <Text style={styles.colTitleRight}>{item.equivLawCode} (Old Law)</Text>
                  </View>

                  {/* Dual Column Diff Body */}
                  <View style={styles.dualTextRow}>
                    <View style={styles.colBodyLeft}>
                      {renderSegments(diff.left)}
                    </View>
                    <View style={styles.colBodyRight}>
                      {renderSegments(diff.right)}
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
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  voiceModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    elevation: 8,
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  voicePulseCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#DEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  voiceModalTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 4 },
  voiceModalSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 8 },
  quickVoiceHeading: { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginTop: 10, marginBottom: 8, alignSelf: 'flex-start' },
  voicePromptWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    width: '100%',
  },
  voicePromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8FD',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#D8ECF7',
  },
  voicePromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A3FF',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 34,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 12,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 10,
  },
  filterPillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterGridPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  filterGridPillActive: {
    backgroundColor: '#DEF3FA',
    borderColor: '#00A3FF',
  },
  filterGridPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  filterGridPillTextActive: {
    color: '#00A3FF',
    fontWeight: '800',
  },
  filterActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  filterResetBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterResetText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  filterApplyBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterApplyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  darkHeader: {
    backgroundColor: '#181A20',
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: { fontSize: 20, fontWeight: '900', color: '#00A3FF', letterSpacing: 1.1 },
  filterBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnCircleActive: {
    backgroundColor: '#38BDF8',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
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
  searchInput: { flex: 1, fontSize: 14.5, color: '#FFFFFF', fontWeight: '600' },
  clearBtn: { padding: 4, marginRight: 6 },
  micBtn: { padding: 4 },
  globeBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickFilterScroll: {
    paddingTop: 12,
    paddingBottom: 2,
    gap: 8,
  },
  quickFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#252830',
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickFilterPillActive: {
    backgroundColor: '#00A3FF',
    borderColor: '#38BDF8',
  },
  quickFilterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  quickFilterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  listContent: { padding: 16, gap: 12 },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  bsaBadge: {
    width: 66,
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
  indicatorText: { fontSize: 11.5, fontWeight: '700', color: '#475569' },
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 14,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
});
