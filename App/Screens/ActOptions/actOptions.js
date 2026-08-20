import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';

export default function ActOptionsScreen({ route, navigation }) {
  const act = route?.params?.act || {
    id: 'bns',
    code: 'BNS',
    fullName: 'Bharatiya Nyaya Sanhita , 2023',
    equivalentCode: 'IPC',
    equivalentName: 'Indian Penal Code (IPC)'
  };

  const code = act.code || 'BNS';
  const fullName = act.fullName || 'Bharatiya Nyaya Sanhita , 2023';

  // Config based on Act
  let options = [];
  if (code === 'BNS') {
    options = [
      { id: '1', title: 'Index', icon: '☰', action: 'Chapterlist' },
      { id: '2', title: 'Corresponding Section Table of BNS with Indian Penal Code (IPC)', icon: '⇄', action: 'MappingTable', params: { type: 'BNS_TO_IPC' } },
      { id: '3', title: 'Corresponding Section Table of IPC with BNS', icon: '⇄', action: 'MappingTable', params: { type: 'IPC_TO_BNS' } },
      { id: '4', title: 'Chapters and Sections', icon: '📖', action: 'Chapterlist' },
    ];
  } else if (code === 'BNSS') {
    options = [
      { id: '1', title: 'Index', icon: '☰', action: 'Chapterlist' },
      { id: '2', title: 'Corresponding Section Table of BNSS with Code of Criminal Procedure', icon: '⇄', action: 'MappingTable', params: { type: 'BNSS_TO_CRPC' } },
      { id: '3', title: 'Corresponding Section Table of CrPC with BNSS', icon: '⇄', action: 'MappingTable', params: { type: 'CRPC_TO_BNSS' } },
      { id: '4', title: 'Chapters and Sections', icon: '📖', action: 'Chapterlist' },
      { id: '5', title: 'Schedule', icon: '📅', action: 'Schedules' },
    ];
  } else if (code === 'BSA') {
    options = [
      { id: '1', title: 'Index', icon: '☰', action: 'Chapterlist' },
      { id: '2', title: 'Corresponding Section Table of BSA with Indian Evidence Act', icon: '⇄', action: 'MappingTable', params: { type: 'BSA_TO_IEA' } },
      { id: '3', title: 'Corresponding Section Table of IEA with BSA', icon: '⇄', action: 'MappingTable', params: { type: 'IEA_TO_BSA' } },
      { id: '4', title: 'Chapters and Sections', icon: '📖', action: 'Chapterlist' },
    ];
  } else if (code === 'IPC') {
    options = [
      { id: '1', title: 'Index', icon: '☰', action: 'Chapterlist' },
      { id: '2', title: 'Corresponding Section Table of IPC with BNS', icon: '⇄', action: 'MappingTable', params: { type: 'IPC_TO_BNS' } },
      { id: '3', title: 'Corresponding Section Table of BNS with IPC', icon: '⇄', action: 'MappingTable', params: { type: 'BNS_TO_IPC' } },
      { id: '4', title: 'Chapters and Sections', icon: '📖', action: 'Chapterlist' },
    ];
  } else if (code === 'CrPC' || code === 'CRPC') {
    options = [
      { id: '1', title: 'Index', icon: '☰', action: 'Chapterlist' },
      { id: '2', title: 'Corresponding Section Table of CrPC with BNSS', icon: '⇄', action: 'MappingTable', params: { type: 'CRPC_TO_BNSS' } },
      { id: '3', title: 'Corresponding Section Table of BNSS with CrPC', icon: '⇄', action: 'MappingTable', params: { type: 'BNSS_TO_CRPC' } },
      { id: '4', title: 'Chapters and Sections', icon: '📖', action: 'Chapterlist' },
      { id: '5', title: 'Schedule', icon: '📅', action: 'Schedules' },
    ];
  } else {
    options = [
      { id: '1', title: 'Index', icon: '☰', action: 'Chapterlist' },
      { id: '2', title: 'Corresponding Section Table of IEA with BSA', icon: '⇄', action: 'MappingTable', params: { type: 'IEA_TO_BSA' } },
      { id: '3', title: 'Corresponding Section Table of BSA with IEA', icon: '⇄', action: 'MappingTable', params: { type: 'BSA_TO_IEA' } },
      { id: '4', title: 'Chapters and Sections', icon: '📖', action: 'Chapterlist' },
    ];
  }

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
          <Text style={styles.headerTitle}>{code} Options</Text>
        </View>
        <Text style={styles.headerSubtitle}>{fullName}</Text>
      </View>

      {/* Options List */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {options.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.optionCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(item.action, { act, ...item.params })}
          >
            <View style={styles.iconBox}>
              <Text style={styles.optionIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.optionTitle}>{item.title}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  backArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00A3FF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
    marginLeft: 50,
  },
  contentContainer: {
    padding: 16,
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionIcon: {
    fontSize: 20,
    color: '#00A3FF',
  },
  optionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
  },
  chevron: {
    fontSize: 22,
    color: '#94A3B8',
    marginLeft: 8,
  },
});
