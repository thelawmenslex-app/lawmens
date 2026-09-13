import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
  Alert
} from 'react-native';
import { ApiService } from '../../Services/apiService';
import { ComparisonService } from '../../Services/comparisonService';
import { computeLegalDiff } from '../../Utilities/legalDiffEngine';
import rawData from '../../Assets/Data/lawData.json';
import mappingData from '../../Assets/Data/comprehensiveMappings.json';

export default function ComparisonScreen({ route, navigation }) {
  const {
    ipcSec = null,
    oldSec = null,
    newSec = null,
    leftSec = null,
    rightSec = null,
    leftCode = null,
    rightCode = null,
    primaryCode = null,
    sectionData = null,
    actTitle = '',
    actCode = ''
  } = route?.params || {};

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

  // Determine the statutory comparison pair (IPC<->BNS, CrPC<->BNSS, IEA<->BSA)
  const pairInfo = useMemo(() => {
    const rawLookup = (leftCode || primaryCode || actCode || actTitle || '').toUpperCase();
    return ComparisonService.getComparisonPairInfo(rawLookup);
  }, [leftCode, primaryCode, actCode, actTitle]);

  // Determine if the initial left side requested by the caller is the New Law (e.g. BNSS, BNS, BSA)
  const isNewLawInitial = useMemo(() => {
    const targetCode = (leftCode || primaryCode || actCode || '').toUpperCase();
    if (targetCode === 'BNSS' || targetCode === 'BNS' || targetCode === 'BSA') {
      return true;
    }
    if (targetCode === 'CRPC' || targetCode === 'IPC' || targetCode === 'IEA') {
      return false;
    }
    return targetCode === pairInfo.newCode.toUpperCase();
  }, [leftCode, primaryCode, actCode, pairInfo]);

  // Dynamic content mapping based on the selected law pair and section
  const comparisonData = useMemo(() => {
    let pairList = mappingData.ipcToBns || [];
    if (pairInfo.oldCode === 'CrPC') {
      pairList = mappingData.crpcToBnss || [];
    } else if (pairInfo.oldCode === 'IEA') {
      pairList = mappingData.ieaToBsa || [];
    }

    // Determine target lookup query
    const querySec = String(leftSec || newSec || oldSec || ipcSec || '1').trim();

    // 1. Try finding by newSec if starting from new law or newSec was provided
    let foundPair = null;
    if (newSec) {
      foundPair = pairList.find(p => p.newSec === newSec);
    }
    if (!foundPair && oldSec) {
      foundPair = pairList.find(p => p.oldSec === oldSec);
    }
    if (!foundPair) {
      foundPair = pairList.find(p => p.newSec === querySec || p.oldSec === querySec);
    }
    if (!foundPair) {
      const baseSec = querySec.split('(')[0].trim();
      foundPair = pairList.find(p => p.oldSec === baseSec || p.newSec === baseSec || p.oldSec.startsWith(baseSec) || p.newSec.startsWith(baseSec));
    }

    // Resolved Section Numbers
    let resolvedNewSec = foundPair ? foundPair.newSec : (newSec || (isNewLawInitial ? querySec : null));
    let resolvedOldSec = foundPair ? foundPair.oldSec : (oldSec || (!isNewLawInitial ? querySec : null));

    if (!resolvedNewSec && resolvedOldSec) {
      resolvedNewSec = pairInfo.mapping?.[resolvedOldSec]?.bnssSec || pairInfo.mapping?.[resolvedOldSec]?.bnsSec || pairInfo.mapping?.[resolvedOldSec]?.bsaSec || resolvedOldSec;
    }
    if (!resolvedOldSec && resolvedNewSec) {
      resolvedOldSec = pairInfo.mapping?.[resolvedNewSec]?.crpcSec || pairInfo.mapping?.[resolvedNewSec]?.ipcSec || pairInfo.mapping?.[resolvedNewSec]?.ieaSec || resolvedNewSec;
    }

    // Resolved Headings
    let newLawHeading = foundPair?.title || (isNewLawInitial && sectionData?.keyword) || `Section ${resolvedNewSec}`;
    let oldLawHeading = foundPair?.title || (!isNewLawInitial && sectionData?.keyword) || `Section ${resolvedOldSec}`;

    // Resolved Content
    let newLawContent = foundPair?.newContent || (isNewLawInitial && sectionData?.content?.[0]?.content) || '';
    let oldLawContent = foundPair?.oldContent || (!isNewLawInitial && sectionData?.content?.[0]?.content) || '';

    // Search rawData for old law text if not yet resolved
    if (!oldLawContent && resolvedOldSec) {
      for (const ch of rawData.casebooks || []) {
        const cId = (ch.categoryId && ch.categoryId['$oid']) || ch.categoryId;
        if (cId === pairInfo.oldCatId) {
          for (const s of ch.section || []) {
            if (s.name === resolvedOldSec || s.name?.toLowerCase() === resolvedOldSec.toLowerCase()) {
              oldLawContent = s.content?.[0]?.content || '';
              if (s.keyword) oldLawHeading = s.keyword;
              break;
            }
          }
        }
      }
    }

    // Search rawData for new law text if not yet resolved
    if (!newLawContent && resolvedNewSec && resolvedNewSec !== 'Repealed' && !resolvedNewSec.includes('Omitted')) {
      for (const ch of rawData.casebooks || []) {
        const cId = (ch.categoryId && ch.categoryId['$oid']) || ch.categoryId;
        if (cId === pairInfo.newCatId) {
          for (const s of ch.section || []) {
            if (s.name === resolvedNewSec || s.name?.toLowerCase() === resolvedNewSec.toLowerCase() || s.name?.startsWith(resolvedNewSec)) {
              newLawContent = s.content?.[0]?.content || '';
              if (s.keyword) newLawHeading = s.keyword;
              break;
            }
          }
        }
      }
    }

    if (!oldLawContent) {
      oldLawContent = `Statutory legal provision under ${pairInfo.oldTitle} Section ${resolvedOldSec}.`;
    }
    if (!newLawContent) {
      if (resolvedNewSec && (resolvedNewSec.includes('Repealed') || resolvedNewSec.includes('Omitted'))) {
        newLawContent = `This provision has been repealed and omitted in the ${pairInfo.newTitle}.`;
      } else {
        newLawContent = `Corresponding statutory legal provision under ${pairInfo.newTitle} Section ${resolvedNewSec}.`;
      }
    }

    // Determine current visual columns based on isNewLawInitial and isSwapped toggle
    const showNewOnLeft = isNewLawInitial ? !isSwapped : isSwapped;

    const leftCol = showNewOnLeft ? {
      code: pairInfo.newCode,
      title: pairInfo.newTitle,
      label: `${pairInfo.newTitle} (New Law)`,
      sec: resolvedNewSec,
      heading: newLawHeading,
      content: newLawContent,
      isNew: true
    } : {
      code: pairInfo.oldCode,
      title: pairInfo.oldTitle,
      label: `${pairInfo.oldTitle} (Old Law)`,
      sec: resolvedOldSec,
      heading: oldLawHeading,
      content: oldLawContent,
      isNew: false
    };

    const rightCol = showNewOnLeft ? {
      code: pairInfo.oldCode,
      title: pairInfo.oldTitle,
      label: `${pairInfo.oldTitle} (Old Law)`,
      sec: resolvedOldSec,
      heading: oldLawHeading,
      content: oldLawContent,
      isNew: false
    } : {
      code: pairInfo.newCode,
      title: pairInfo.newTitle,
      label: `${pairInfo.newTitle} (New Law)`,
      sec: resolvedNewSec,
      heading: newLawHeading,
      content: newLawContent,
      isNew: true
    };

    // Compute live 100% accurate LCS diff highlights between Left and Right columns
    const diffResult = computeLegalDiff(leftCol.content, rightCol.content);

    return {
      leftCol,
      rightCol,
      headerSubtitle: `${leftCol.title} vs ${rightCol.title} Comparison`,
      status: diffResult.status.toUpperCase(),
      diffBlocks: diffResult.diffCount,
      leftSegments: diffResult.leftSegments,
      rightSegments: diffResult.rightSegments,
    };
  }, [leftSec, oldSec, newSec, ipcSec, sectionData, pairInfo, isNewLawInitial, isSwapped]);

  const handleCopy = () => {
    Alert.alert('Copied', 'Comparison text copied to clipboard.');
  };

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    await ApiService.bookmarks.toggle({
      id: `comp_${comparisonData.leftCol.sec}_${comparisonData.leftCol.code}_${comparisonData.rightCol.sec}_${comparisonData.rightCol.code}`,
      actTitle: comparisonData.headerSubtitle,
      secName: comparisonData.leftCol.sec,
      title: comparisonData.leftCol.heading,
      desc: `Comparison between ${comparisonData.leftCol.code} Sec ${comparisonData.leftCol.sec} and ${comparisonData.rightCol.code} Sec ${comparisonData.rightCol.sec}`
    });
    Alert.alert('Bookmark', isBookmarked ? 'Bookmark removed.' : 'Comparison bookmarked successfully.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `THE-LAWMEN'S Legal Comparison:\n${comparisonData.headerSubtitle}\n${comparisonData.leftCol.code} Sec ${comparisonData.leftCol.sec} vs ${comparisonData.rightCol.code} Sec ${comparisonData.rightCol.sec}\nDownload THE-LAWMEN'S app for full legal research.`
      });
    } catch (e) {}
  };

  const renderSegments = (segments) => {
    return (
      <Text style={styles.contentText}>
        {segments.map((seg, idx) => (
          <Text
            key={idx}
            style={[
              seg.color ? { color: seg.color } : { color: '#1E293B' },
              seg.bold ? { fontWeight: 'bold' } : {},
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

      {/* 1. TOP DARK HEADER */}
      <View style={styles.darkHeader}>
        <TouchableOpacity
          style={styles.backBtnCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
      </View>

      {/* 2. CYAN SUBHEADER CARD */}
      <View style={styles.cyanSubheader}>
        <Text style={styles.cyanSubheaderText}>
          {comparisonData.headerSubtitle}
        </Text>
      </View>

      {/* 3. STATUS & DIFF BLOCKS BAR WITH SWAP BUTTON */}
      <View style={styles.statusBarRow}>
        <View style={styles.statusLeft}>
          <Text style={styles.statusLabel}>Status: </Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{comparisonData.status}</Text>
          </View>
        </View>

        {/* Interactive Swap Sides Button */}
        <TouchableOpacity
          style={styles.swapBtn}
          onPress={() => setIsSwapped(prev => !prev)}
          activeOpacity={0.8}
        >
          <Text style={styles.swapBtnIcon}>⇄</Text>
          <Text style={styles.swapBtnText}>Swap Sides</Text>
        </TouchableOpacity>

        <Text style={styles.diffBlocksText}>
          Diff Blocks: {comparisonData.diffBlocks}
        </Text>
      </View>

      {/* 4. DUAL COLUMN TITLES */}
      <View style={styles.colTitleRow}>
        <Text style={styles.colTitleLeft}>{comparisonData.leftCol.label}</Text>
        <Text style={styles.colTitleRight}>{comparisonData.rightCol.label}</Text>
      </View>

      {/* 5. SCROLLABLE SIDE-BY-SIDE CARDS */}
      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Heading Cards Row */}
        <View style={styles.dualCardRow}>
          {/* Left Heading Card */}
          <View style={styles.sectionHeadingCard}>
            <View style={styles.cardHeaderTag}>
              <Text style={styles.cardHeaderTagText}>{comparisonData.leftCol.code}</Text>
            </View>
            <Text style={styles.secNumberText}>Sec {comparisonData.leftCol.sec}</Text>
            <Text style={styles.secTitleText}>{comparisonData.leftCol.heading}</Text>
          </View>

          {/* Right Heading Card */}
          <View style={styles.sectionHeadingCard}>
            <View style={[styles.cardHeaderTag, styles.cardHeaderTagRight]}>
              <Text style={styles.cardHeaderTagText}>{comparisonData.rightCol.code}</Text>
            </View>
            <Text style={styles.secNumberText}>Sec {comparisonData.rightCol.sec}</Text>
            <Text style={styles.secTitleText}>{comparisonData.rightCol.heading}</Text>
          </View>
        </View>

        {/* Section Content Cards Row */}
        <View style={styles.dualCardRow}>
          {/* Left Content Card */}
          <View style={styles.contentCard}>
            <Text style={styles.contentHeaderLabel}>Content</Text>
            {renderSegments(comparisonData.leftSegments)}
          </View>

          {/* Right Content Card */}
          <View style={styles.contentCard}>
            <Text style={styles.contentHeaderLabel}>Content</Text>
            {renderSegments(comparisonData.rightSegments)}
          </View>
        </View>
      </ScrollView>

      {/* 6. FLOATING LIGHT CYAN BOTTOM ACTION BAR */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomActionBar}>
          {/* Copy */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleCopy}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionBtnText}>Copy</Text>
          </TouchableOpacity>

          {/* Bookmark */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleBookmark}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>{isBookmarked ? '🔖' : '🏷️'}</Text>
            <Text style={styles.actionBtnText}>Bookmark</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🔗</Text>
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkHeader: {
    backgroundColor: '#181A20',
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25AAE2',
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
    fontSize: 20,
    fontWeight: '900',
    color: '#25AAE2',
    letterSpacing: 1.2,
  },
  cyanSubheader: {
    backgroundColor: '#25AAE2',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cyanSubheaderText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 18,
  },
  statusBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  statusPill: {
    borderWidth: 1.5,
    borderColor: '#25AAE2',
    backgroundColor: '#DEF3FA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#25AAE2',
  },
  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181A20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  swapBtnIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#25AAE2',
    marginRight: 4,
  },
  swapBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  diffBlocksText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  colTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  colTitleLeft: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 17,
  },
  colTitleRight: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 17,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
  dualCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionHeadingCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#D0E7F5',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  cardHeaderTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#DEF3FA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  cardHeaderTagRight: {
    backgroundColor: '#F1F5F9',
  },
  cardHeaderTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#25AAE2',
  },
  secNumberText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  secTitleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 16,
  },
  contentCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#D0E7F5',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 280,
  },
  contentHeaderLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  contentText: {
    fontSize: 12.5,
    color: '#1E293B',
    lineHeight: 19,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  bottomActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#DEF3FA',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#C2E6F5',
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#25AAE2',
  },
});
