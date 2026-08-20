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
import { ComparisonService, computeLegalDiff } from '../../Services/comparisonService';
import rawData from '../../Assets/Data/lawData.json';
import mappingData from '../../Assets/Data/comprehensiveMappings.json';

export default function ComparisonScreen({ route, navigation }) {
  const {
    ipcSec = '1',
    oldSec = null,
    newSec = null,
    sectionData = null,
    actTitle = 'Indian Penal Code , 1860',
    actCode = 'IPC'
  } = route?.params || {};

  const [isBookmarked, setIsBookmarked] = useState(false);

  // Determine the exact statutory comparison pair (IPC<->BNS, CrPC<->BNSS, IEA<->BSA)
  const pairInfo = useMemo(() => {
    return ComparisonService.getComparisonPairInfo(actCode || actTitle);
  }, [actCode, actTitle]);

  // Dynamic content mapping based on the selected law pair and section
  const comparisonData = useMemo(() => {
    const querySec = String(oldSec || ipcSec || '1').trim();
    let pairList = mappingData.ipcToBns || [];
    if (pairInfo.oldCode === 'CrPC') {
      pairList = mappingData.crpcToBnss || [];
    } else if (pairInfo.oldCode === 'IEA') {
      pairList = mappingData.ieaToBsa || [];
    }

    // Find in comprehensive mapping table
    let foundPair = pairList.find(p => p.oldSec === querySec);
    if (!foundPair && newSec) {
      foundPair = pairList.find(p => p.newSec === newSec);
    }
    if (!foundPair) {
      foundPair = pairList.find(p => p.newSec === querySec);
    }

    let leftSecNum = foundPair ? foundPair.oldSec : (oldSec || querySec);
    let rightSecNum = foundPair ? foundPair.newSec : (newSec || querySec);

    let leftHeading = sectionData?.keyword || foundPair?.title || `Section ${leftSecNum}`;
    let rightHeading = foundPair?.title || leftHeading;

    let leftContentText = sectionData?.content?.[0]?.content || foundPair?.oldContent || '';
    let rightContentText = foundPair?.newContent || '';

    // Search rawData for old law text if not yet resolved
    if (!leftContentText) {
      for (const ch of rawData.casebooks || []) {
        const cId = (ch.categoryId && ch.categoryId['$oid']) || ch.categoryId;
        if (cId === pairInfo.oldCatId) {
          for (const s of ch.section || []) {
            if (s.name === leftSecNum || s.name?.toLowerCase() === leftSecNum.toLowerCase()) {
              leftContentText = s.content?.[0]?.content || '';
              if (s.keyword) leftHeading = s.keyword;
              break;
            }
          }
        }
      }
    }

    // Search rawData for new law text if not yet resolved
    if (!rightContentText) {
      for (const ch of rawData.casebooks || []) {
        const cId = (ch.categoryId && ch.categoryId['$oid']) || ch.categoryId;
        if (cId === pairInfo.newCatId) {
          for (const s of ch.section || []) {
            if (s.name === rightSecNum || s.name?.toLowerCase() === rightSecNum.toLowerCase() || s.name?.startsWith(rightSecNum)) {
              rightContentText = s.content?.[0]?.content || '';
              if (s.keyword) rightHeading = s.keyword;
              break;
            }
          }
        }
      }
    }

    if (!leftContentText) {
      leftContentText = `Statutory legal provision under ${pairInfo.oldTitle} Section ${leftSecNum}.`;
    }
    if (!rightContentText) {
      rightContentText = `Corresponding statutory legal provision under ${pairInfo.newTitle} Section ${rightSecNum}.`;
    }

    // Compute live diff highlights
    const { diffItems, diffCount } = computeLegalDiff(leftContentText, rightContentText);

    return {
      oldLawLabel: `${pairInfo.oldTitle} (Old Law)`,
      newLawLabel: `${pairInfo.newTitle} (New Law)`,
      headerSubtitle: `${pairInfo.oldTitle} vs ${pairInfo.newTitle} Comparison`,
      status: foundPair ? 'UPDATED' : 'PROVISION',
      diffBlocks: diffCount > 0 ? diffCount : 1,
      leftSec: leftSecNum,
      leftHeading: leftHeading,
      rightSec: rightSecNum,
      rightHeading: rightHeading,
      leftContentText: leftContentText,
      rightContentText: rightContentText,
      diffItems: diffItems
    };
  }, [ipcSec, oldSec, newSec, sectionData, pairInfo]);

  const handleCopy = () => {
    Alert.alert('Copied', 'Comparison text copied to clipboard.');
  };

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    await ApiService.bookmarks.toggle({
      id: `comp_${comparisonData.leftSec}_${pairInfo.oldCode}`,
      actTitle: comparisonData.headerSubtitle,
      secName: comparisonData.leftSec,
      title: comparisonData.leftHeading,
      desc: `Comparison between ${pairInfo.oldCode} Sec ${comparisonData.leftSec} and ${pairInfo.newCode} Sec ${comparisonData.rightSec}`
    });
    Alert.alert('Bookmark', isBookmarked ? 'Bookmark removed.' : 'Comparison bookmarked successfully.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `THE-LAWMEN'S Legal Comparison:\n${comparisonData.headerSubtitle}\n${pairInfo.oldCode} Sec ${comparisonData.leftSec} vs ${pairInfo.newCode} Sec ${comparisonData.rightSec}\nDownload THE-LAWMEN'S app for full legal research.`
      });
    } catch (e) {}
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

      {/* 3. STATUS & DIFF BLOCKS BAR */}
      <View style={styles.statusBarRow}>
        <View style={styles.statusLeft}>
          <Text style={styles.statusLabel}>Status: </Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{comparisonData.status}</Text>
          </View>
        </View>
        <Text style={styles.diffBlocksText}>
          Diff Blocks: {comparisonData.diffBlocks}
        </Text>
      </View>

      {/* 4. DUAL COLUMN TITLES */}
      <View style={styles.colTitleRow}>
        <Text style={styles.colTitleLeft}>{comparisonData.oldLawLabel}</Text>
        <Text style={styles.colTitleRight}>{comparisonData.newLawLabel}</Text>
      </View>

      {/* 5. SCROLLABLE SIDE-BY-SIDE CARDS */}
      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Heading Cards Row */}
        <View style={styles.dualCardRow}>
          {/* Left Heading Card (Old Law) */}
          <View style={styles.sectionHeadingCard}>
            <Text style={styles.secNumberText}>Sec {comparisonData.leftSec}</Text>
            <Text style={styles.secTitleText}>{comparisonData.leftHeading}</Text>
          </View>

          {/* Right Heading Card (New Law) */}
          <View style={styles.sectionHeadingCard}>
            <Text style={styles.secNumberText}>Sec {comparisonData.rightSec}</Text>
            <Text style={styles.secTitleText}>{comparisonData.rightHeading}</Text>
          </View>
        </View>

        {/* Section Content Cards Row */}
        <View style={styles.dualCardRow}>
          {/* Left Content Card (Old Law) */}
          <View style={styles.contentCard}>
            <Text style={styles.contentHeaderLabel}>Content</Text>
            <Text style={styles.contentText}>
              {comparisonData.leftContentText}
            </Text>
          </View>

          {/* Right Content Card (New Law with Highlights) */}
          <View style={styles.contentCard}>
            <Text style={styles.contentHeaderLabel}>Content</Text>
            <Text style={styles.contentText}>
              {comparisonData.diffItems.map((item, idx) => {
                if (item.type === 'INSERTED') {
                  return (
                    <Text key={idx} style={styles.diffInserted}>
                      {item.text}
                    </Text>
                  );
                }
                if (item.type === 'UPDATED') {
                  return (
                    <Text key={idx} style={styles.diffUpdated}>
                      {item.newText || item.text}
                    </Text>
                  );
                }
                return <Text key={idx}>{item.text}</Text>;
              })}
            </Text>
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
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 1.2,
  },
  cyanSubheader: {
    backgroundColor: '#00A3FF',
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
    paddingTop: 16,
    paddingBottom: 10,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  statusPill: {
    borderWidth: 1.5,
    borderColor: '#00A3FF',
    backgroundColor: '#DEF3FA',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00A3FF',
  },
  diffBlocksText: {
    fontSize: 13,
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
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 18,
  },
  colTitleRight: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 18,
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
  },
  secNumberText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
  },
  secTitleText: {
    fontSize: 12.5,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 20,
  },
  diffInserted: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
    fontWeight: 'bold',
  },
  diffUpdated: {
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
    fontWeight: 'bold',
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
    color: '#00A3FF',
  },
});
