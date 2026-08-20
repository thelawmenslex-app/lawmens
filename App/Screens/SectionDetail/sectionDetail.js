import React, { useState } from 'react';
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

export default function SectionDetailScreen({ route, navigation }) {
  const {
    actTitle = 'Bharatiya Nyaya Sanhita , 2023',
    actCode = 'BNS',
    chapterName = 'CHAPTER II - OF PUNISHMENTS',
    sectionData = {}
  } = route?.params || {};

  const [isBookmarked, setIsBookmarked] = useState(false);

  const secNumber = sectionData.name || '1';
  const secTitle = sectionData.keyword || `Section ${secNumber}`;
  const paragraphs = sectionData.content || [];

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
      desc: paragraphs[0]?.content || ''
    });
    Alert.alert('Bookmark', isBookmarked ? 'Bookmark removed.' : 'Section bookmarked successfully.');
  };

  const handleShare = async () => {
    try {
      const fullText = paragraphs.map(p => p.content).join('\n\n');
      await Share.share({
        message: `${actTitle}\n${chapterName}\n\nSection ${secNumber}: ${secTitle}\n\n${fullText}\n\nDownload THE-LAWMEN'S app for full legal access.`
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

      {/* 3. SCROLLABLE EXACT STATUTORY LAW CONTENT */}
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

          {/* Full Statutory Provisions */}
          {paragraphs.length > 0 ? (
            paragraphs.map((item, idx) => (
              <View key={idx} style={styles.paragraphBlock}>
                <Text style={styles.statutoryText}>
                  {item.content}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.statutoryText}>
              Statutory provisions and legal text for Section {secNumber}.
            </Text>
          )}
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
    backgroundColor: '#EDF7FC',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
  paragraphBlock: {
    marginBottom: 14,
  },
  statutoryText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1E293B',
    fontWeight: '500',
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
    backgroundColor: '#DEF3FA',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 4,
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
