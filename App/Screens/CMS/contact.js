import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ApiService } from '../../Services/apiService';

const CATEGORIES = ['BNS', 'BNSS', 'BSA', 'IPC', 'CrPC', 'IEA', 'Subscription', 'General'];

export default function ContactScreen({ navigation, route }) {
  const defaultSubject = route?.params?.subject || '';
  const defaultCategory = route?.params?.category || 'BNS';

  const [activeTab, setActiveTab] = useState('ask'); // 'ask' | 'my_queries'
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [subject, setSubject] = useState(defaultSubject);
  const [question, setQuestion] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [myQueries, setMyQueries] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(false);

  useEffect(() => {
    loadUser();
    loadMyQueries();
  }, []);

  const loadUser = async () => {
    try {
      const u = await ApiService.auth.getProfile();
      if (u) setUserProfile(u);
    } catch (e) {}
  };

  const loadMyQueries = async () => {
    setLoadingQueries(true);
    try {
      const list = await ApiService.queries.getMyQueries();
      setMyQueries(Array.isArray(list) ? list : []);
    } catch (e) {
      setMyQueries([]);
    } finally {
      setLoadingQueries(false);
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('Required Field', 'Please enter a subject for your question.');
      return;
    }
    if (!question.trim()) {
      Alert.alert('Required Field', 'Please type your question or inquiry.');
      return;
    }

    setSubmitting(true);
    try {
      const fullSubject = selectedCategory ? `[${selectedCategory}] ${subject.trim()}` : subject.trim();
      const res = await ApiService.queries.submit({
        subject: fullSubject,
        question: question.trim(),
        name: userProfile?.name || 'User',
        email: userProfile?.email || '',
        phoneNumber: userProfile?.phoneNumber || userProfile?.phone || ''
      });

      setSubmitting(false);
      if (res.status) {
        Alert.alert(
          'Question Submitted',
          'Your legal inquiry has been submitted. Our legal team will review and reply soon.',
          [{ text: 'View My Questions', onPress: () => {
            setSubject('');
            setQuestion('');
            setActiveTab('my_queries');
            loadMyQueries();
          }}]
        );
      } else {
        Alert.alert('Submission Error', res.message || 'Could not submit question.');
      }
    } catch (e) {
      setSubmitting(false);
      Alert.alert('Submission Error', 'Failed to connect. Please check your network.');
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'Recent';
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* 1. Header */}
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
        <Text style={styles.subHeaderTitle}>Ask Question & Support</Text>
        <Text style={styles.headerSubtitleText}>
          Submit questions, report legal provision errors, or request assistance
        </Text>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'ask' && styles.tabButtonActive]}
            onPress={() => setActiveTab('ask')}
            activeOpacity={0.85}
          >
            <Feather
              name="edit-3"
              size={15}
              color={activeTab === 'ask' ? '#FFFFFF' : '#94A3B8'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, activeTab === 'ask' && styles.tabTextActive]}>
              Ask Question
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'my_queries' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('my_queries');
              loadMyQueries();
            }}
            activeOpacity={0.85}
          >
            <Feather
              name="message-square"
              size={15}
              color={activeTab === 'my_queries' ? '#FFFFFF' : '#94A3B8'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, activeTab === 'my_queries' && styles.tabTextActive]}>
              My Inquiries {myQueries.length > 0 ? `(${myQueries.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. TAB CONTENT */}
      {activeTab === 'ask' ? (
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info Capsule */}
          {userProfile && (
            <View style={styles.userInfoCard}>
              <View style={styles.userAvatarMini}>
                <Feather name="user" size={16} color="#25AAE2" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userNameText}>{userProfile.name || 'User'}</Text>
                <Text style={styles.userEmailText}>{userProfile.email || userProfile.phone || ''}</Text>
              </View>
              <View style={styles.connectedBadge}>
                <Text style={styles.connectedBadgeText}>Verified</Text>
              </View>
            </View>
          )}

          {/* Category Chips */}
          <Text style={styles.fieldLabel}>Select Topic / Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipSelected
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat && styles.categoryChipTextSelected
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Subject Field */}
          <Text style={styles.fieldLabel}>Subject / Topic</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. BNS Section 70 query or app issue"
              placeholderTextColor="#94A3B8"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          {/* Question / Inquiry Text Area */}
          <View style={styles.labelWithCount}>
            <Text style={styles.fieldLabel}>Your Question / Details</Text>
            <Text style={styles.charCountText}>{question.length}/1000</Text>
          </View>
          <View style={[styles.inputBox, styles.textAreaBox]}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your legal question or feedback in detail..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
              value={question}
              onChangeText={setQuestion}
            />
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Submit Question</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footerNoteBox}>
            <Feather name="shield" size={14} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={styles.footerNoteText}>
              Inquiries are received by our support & legal team for direct resolution.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={myQueries}
          keyExtractor={(item, index) => item._id || String(index)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loadingQueries}
              onRefresh={loadMyQueries}
              colors={['#25AAE2']}
            />
          }
          renderItem={({ item }) => {
            const isAnswered = item.status === 'Answered' || !!item.adminReply;
            return (
              <View style={styles.queryCard}>
                <View style={styles.queryTopRow}>
                  <Text style={styles.querySubject} numberOfLines={1}>
                    {item.subject || 'Legal Query'}
                  </Text>
                  <View style={[styles.statusBadge, isAnswered ? styles.statusBadgeAnswered : styles.statusBadgePending]}>
                    <Text style={[styles.statusText, isAnswered ? styles.statusTextAnswered : styles.statusTextPending]}>
                      {isAnswered ? 'Answered' : 'Pending'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.queryTimestamp}>
                  Submitted on {formatTimestamp(item.createdAt)}
                </Text>

                <View style={styles.questionBubble}>
                  <Text style={styles.questionBubbleLabel}>QUESTION</Text>
                  <Text style={styles.questionText}>{item.question}</Text>
                </View>

                {item.adminReply ? (
                  <View style={styles.replyBubble}>
                    <View style={styles.replyHeader}>
                      <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" style={{ marginRight: 4 }} />
                      <Text style={styles.replyHeaderLabel}>SUPPORT TEAM RESPONSE</Text>
                    </View>
                    <Text style={styles.replyText}>{item.adminReply}</Text>
                  </View>
                ) : (
                  <View style={styles.waitingResponseBox}>
                    <Feather name="clock" size={13} color="#F59E0B" style={{ marginRight: 6 }} />
                    <Text style={styles.waitingResponseText}>Our team is reviewing your query.</Text>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="chat-question-outline" size={54} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No queries submitted yet</Text>
              <Text style={styles.emptySubtitle}>
                Have a question regarding any law section or provision? Tap 'Ask Question' above to submit.
              </Text>
              <TouchableOpacity
                style={styles.emptyAskBtn}
                onPress={() => setActiveTab('ask')}
                activeOpacity={0.85}
              >
                <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.emptyAskBtnText}>Ask New Question</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF7FC' },
  darkHeader: {
    backgroundColor: '#181A20',
    paddingTop: 45,
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  backBtnCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#25AAE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandTitle: { fontSize: 20, fontWeight: '900', color: '#25AAE2', letterSpacing: 0.8 },
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
  },
  headerSubtitleText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#252830',
    borderRadius: 14,
    padding: 4,
    marginTop: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#25AAE2',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  bodyScroll: { flex: 1 },
  bodyContent: { padding: 18, paddingBottom: 40 },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
  },
  userAvatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userNameText: { fontSize: 14, fontWeight: '800', color: '#111827' },
  userEmailText: { fontSize: 12, color: '#64748B' },
  connectedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  connectedBadgeText: { fontSize: 11, fontWeight: '800', color: '#059669' },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 6,
  },
  labelWithCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCountText: { fontSize: 11, color: '#94A3B8' },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
  },
  categoryChipSelected: {
    backgroundColor: '#25AAE2',
    borderColor: '#25AAE2',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
    marginBottom: 14,
  },
  textAreaBox: {
    minHeight: 120,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
  },
  submitBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#25AAE2',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#25AAE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  footerNoteText: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  queryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
    elevation: 2,
    shadowColor: '#A8BED6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  queryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  querySubject: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeAnswered: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusTextPending: {
    color: '#D97706',
  },
  statusTextAnswered: {
    color: '#059669',
  },
  queryTimestamp: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginBottom: 12,
  },
  questionBubble: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  questionBubbleLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 13.5,
    color: '#1E293B',
    lineHeight: 20,
  },
  replyBubble: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyHeaderLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.8,
  },
  replyText: {
    fontSize: 13.5,
    color: '#064E3B',
    lineHeight: 20,
  },
  waitingResponseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  waitingResponseText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyAskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25AAE2',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAskBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
