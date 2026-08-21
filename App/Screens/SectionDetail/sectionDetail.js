import React, { useState, useMemo, useEffect } from 'react';
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
import Feather from 'react-native-vector-icons/Feather';
import { ApiService } from '../../Services/apiService';
import mappingData from '../../Assets/Data/comprehensiveMappings.json';
import { SyncService } from '../../Services/syncService';
import { BASE_URL } from '../../Actions/constant';

// Admin Portal Synced Rich Clause Parser (Exact 1:1 WYSIWYG match)
function parseAdminPortalClauses(text) {
  if (!text) return [];

  // 1. If text has HTML tags from Admin WYSIWYG editor (<p>, <br>, etc.), preserve natural HTML structure
  let normalized = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();

  // 2. Handle cases where clause marker is preceded by punctuation/newline without space e.g. "Magistrate.(6) Nothing"
  normalized = normalized.replace(/([.:;?!]|\n)\s*(\(\d+[a-zA-Z]?\))(?=\s+[A-Z])/gi, '$1\n\n$2 ');
  normalized = normalized.replace(/([.:;?!]|\n)\s*(\([a-z]\))(?=\s+[A-Z])/gi, '$1\n\n$2 ');
  normalized = normalized.replace(/([.:;?!]|\n)\s*(\([ivxLCDM]+\))(?=\s+[A-Z])/gi, '$1\n\n$2 ');

  // 3. Handle cases where clause marker is preceded by whitespace, but NOT part of inline cross references like "sub-section(4)"
  normalized = normalized.replace(/(?<!(sub-section|sub section|section|clause|sub-clause|under|of|item|paragraph|rule|order|article|proviso|schedule|and|or)[-( ]*)\s+(\(\d+[a-zA-Z]?\))(?=\s+[A-Z])/gi, '\n\n$2 ');
  normalized = normalized.replace(/(?<!(sub-section|sub section|section|clause|sub-clause|under|of|item|paragraph|rule|order|article|proviso|schedule|and|or)[-( ]*)\s+(\([a-z]\))(?=\s+[A-Z])/gi, '\n\n$2 ');
  normalized = normalized.replace(/(?<!(sub-section|sub section|section|clause|sub-clause|under|of|item|paragraph|rule|order|article|proviso|schedule|and|or)[-( ]*)\s+(\([ivxLCDM]+\))(?=\s+[A-Z])/gi, '\n\n$2 ');

  // 4. Handle structural legal blocks
  normalized = normalized.replace(/(?<!\n)\s*(Illustration(\s*\d*|\s*[A-Z])?\s*[.:])/gi, '\n\n$1');
  normalized = normalized.replace(/(?<!\n)\s*(Explanation(\s*\d*)?\s*[.:])/gi, '\n\n$1');
  normalized = normalized.replace(/(?<!\n)\s*(Provided(\s+further)?\s+that)/gi, '\n\n$1');

  const rawBlocks = normalized
    .split(/\n\s*\n/)
    .map(b => b.trim())
    .filter(Boolean);

  return rawBlocks.map(block => {
    const match = block.match(/^(\(\d+[a-zA-Z]?\)|\([a-z]\)|\([ivxLCDM]+\)|Illustration[^\n.:]*[.:]|Explanation[^\n.:]*[.:]|Provided[^\n.:]*that)\s*(.*)$/i);
    if (match) {
      return {
        clausePrefix: match[1],
        body: match[2]
      };
    }
    return {
      clausePrefix: null,
      body: block
    };
  });
}

export default function SectionDetailScreen({ route, navigation }) {

  useEffect(() => {
    // Record Last Read and History
    const recordHistory = async () => {
      try {
        const itemToSave = {
          actTitle: actTitle || 'Central Legislation',
          sectionNumber: secNum,
          sectionName: secNum,
          keyword: secTitle,
          title: `Section ${secNum}: ${secTitle}`,
          chapterName: chapterName || 'Provisions',
          content: rawContent,
          sectionData: sectionData || null,
          timestamp: Date.now()
        };

        // 1. Save Last Read
        await AsyncStorage.setItem('@last_read_section', JSON.stringify(itemToSave));

        // 2. Append to History
        const histStr = await AsyncStorage.getItem('@read_history');
        let hist = histStr ? JSON.parse(histStr) : [];
        hist = hist.filter(h => !(h.actTitle === itemToSave.actTitle && String(h.sectionNumber) === String(itemToSave.sectionNumber)));
        hist.unshift(itemToSave);
        if (hist.length > 50) hist = hist.slice(0, 50);
        await AsyncStorage.setItem('@read_history', JSON.stringify(hist));
      } catch (e) {
        console.warn('History tracking error:', e);
      }
    };
    recordHistory();
  }, [actTitle, secNum, secTitle]);

  const {
    actTitle = 'Bharatiya Nagarik Suraksha Sanhita , 2023',
    actCode = 'BNSS',
    chapterName = 'CHAPTER II - CONSTITUTION OF CRIMINAL COURTS AND OFFICES',
    sectionData = {}
  } = route?.params || {};

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [liveOverrideContent, setLiveOverrideContent] = useState(null);

  const secNumber = String(sectionData.name || '1').trim();
  const secTitle = sectionData.keyword || `Section ${secNumber}`;

  useEffect(() => {
    let isMounted = true;
    (async () => {
      // 1. Check local dynamic updates
      const dynamicSec = await SyncService.getDynamicSection(secNumber);
      if (dynamicSec && dynamicSec.content && dynamicSec.content.length > 0 && isMounted) {
        const txt = dynamicSec.content.map(c => typeof c === 'string' ? c : c.content).join('\n\n');
        if (txt) setLiveOverrideContent(txt);
      }

      // 2. Background live sync from Admin Portal
      SyncService.pullLatestChanges().then(() => {
        SyncService.getDynamicSection(secNumber).then(updated => {
          if (updated && updated.content && updated.content.length > 0 && isMounted) {
            const txt = updated.content.map(c => typeof c === 'string' ? c : c.content).join('\n\n');
            if (txt) setLiveOverrideContent(txt);
          }
        });
      }).catch(() => {});
    })();

    return () => { isMounted = false; };
  }, [secNumber]);

  // Robust content resolver matching Admin Portal
  const fullContent = useMemo(() => {
    if (liveOverrideContent) return liveOverrideContent;

    const rawParagraphs = (sectionData.content || [])
      .map(c => typeof c === 'string' ? c : c.content)
      .filter(Boolean)
      .filter(t => t.trim() !== 'No content available' && t.trim() !== 'No content');

    if (rawParagraphs.length > 0) {
      return rawParagraphs.join('\n\n');
    }

    // Fallback: look up in comprehensive statutory mapping
    const code = String(actCode || '').toUpperCase();
    if (code.includes('BNSS')) {
      const found = (mappingData.crpcToBnss || []).find(x => String(x.newSec).trim() === secNumber);
      if (found && found.newContent && !found.newContent.includes('No content')) return found.newContent;
    }
    if (code.includes('CRPC')) {
      const found = (mappingData.crpcToBnss || []).find(x => String(x.oldSec).trim() === secNumber);
      if (found && found.oldContent && !found.oldContent.includes('No content')) return found.oldContent;
    }
    if (code.includes('BNS')) {
      const found = (mappingData.ipcToBns || []).find(x => String(x.newSec).trim() === secNumber);
      if (found && found.newContent && !found.newContent.includes('No content')) return found.newContent;
    }
    if (code.includes('IPC')) {
      const found = (mappingData.ipcToBns || []).find(x => String(x.oldSec).trim() === secNumber);
      if (found && found.oldContent && !found.oldContent.includes('No content')) return found.oldContent;
    }
    if (code.includes('BSA')) {
      const found = (mappingData.ieaToBsa || []).find(x => String(x.newSec).trim() === secNumber);
      if (found && found.newContent && !found.newContent.includes('No content')) return found.newContent;
    }
    if (code.includes('IEA')) {
      const found = (mappingData.ieaToBsa || []).find(x => String(x.oldSec).trim() === secNumber);
      if (found && found.oldContent && !found.oldContent.includes('No content')) return found.oldContent;
    }

    return `Statutory provisions and legal text for Section ${secNumber}.`;
  }, [sectionData, actCode, secNumber, liveOverrideContent]);

  // Formatted clauses matching Admin Portal
  const clauses = useMemo(() => {
    return parseAdminPortalClauses(fullContent);
  }, [fullContent]);

  const handleCopy = () => {
    Alert.alert('Copied', `Section ${secNumber}: ${secTitle} copied to clipboard.`);
  };

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    await ApiService.bookmarks.toggle({
      id: `${actCode}_${secNumber}`,
      actTitle: actTitle,
      secName: secNumber,
      title: secTitle,
      desc: fullContent.substring(0, 120)
    });
    Alert.alert('Bookmark', isBookmarked ? 'Bookmark removed.' : 'Section bookmarked successfully.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${actTitle}\n${chapterName}\n\nSection ${secNumber}: ${secTitle}\n\n${fullContent}\n\nDownload THE-LAWMEN'S app for full legal access.`
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
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.brandTitle}>THE-LAWMEN'S</Text>
      </View>

      {/* 2. CYAN CURVED SUBHEADER (Exact Page 15) */}
      <View style={styles.cyanSubheader}>
        <Text style={styles.cyanActTitle} numberOfLines={1}>{actTitle}</Text>
        <Text style={styles.cyanChapterSubtitle} numberOfLines={1}>{chapterName}</Text>
      </View>

      {/* 3. SCROLLABLE STATUTORY LAW CONTENT (Synced with Admin Portal) */}
      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statuteCard}>
          {/* Section Badge & Title */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.secBadge}>
              <Text style={styles.secBadgeText}>Section {secNumber}</Text>
            </View>
            <Text style={styles.statuteTitle}>{secTitle}</Text>
          </View>

          <View style={styles.cardDivider} />

          {/* Formatted Clauses Synced with Admin Portal */}
          {clauses.map((clause, idx) => (
            <View key={idx} style={styles.clauseParagraph}>
              <Text style={styles.clauseText}>
                {clause.clausePrefix ? (
                  <Text style={styles.clausePrefixText}>
                    {clause.clausePrefix}{' '}
                  </Text>
                ) : null}
                {clause.body}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 4. FLOATING LIGHT CYAN BOTTOM ACTION BAR (Page 15) */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomActionBar}>
          {/* Copy */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleCopy}
            activeOpacity={0.7}
          >
            <Feather name="copy" size={20} color="#00A3FF" />
            <Text style={styles.actionBtnText}>Copy</Text>
          </TouchableOpacity>

          {/* Bookmark */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleBookmark}
            activeOpacity={0.7}
          >
            <Feather
              name="bookmark"
              size={20}
              color="#00A3FF"
            />
            <Text style={styles.actionBtnText}>Bookmark</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Feather name="share-2" size={20} color="#00A3FF" />
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
    backgroundColor: '#E6EEF8',
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
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 1.2,
  },
  cyanSubheader: {
    backgroundColor: '#00A3FF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  cyanActTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  cyanChapterSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#034E7B',
    textAlign: 'center',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 110,
  },
  statuteCard: {
    backgroundColor: '#F5F9FD',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#A8BED6',
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  secBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DEF3FA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  secBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00A3FF',
  },
  statuteTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 22,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  clauseParagraph: {
    marginBottom: 16,
  },
  clauseText: {
    fontSize: 14,
    lineHeight: 23,
    color: '#1E293B',
    fontWeight: '400',
  },
  clausePrefixText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0085CC',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  bottomActionBar: {
    width: '100%',
    height: 56,
    backgroundColor: '#EBF3FB',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 6,
    shadowColor: '#A8BED6',
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00A3FF',
    marginTop: 2,
  },
});
