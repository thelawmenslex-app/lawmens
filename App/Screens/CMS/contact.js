import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function ContactScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />
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
        <Text style={styles.subHeaderTitle}>Contact Us</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconCircle}>
          <Feather name="info" size={48} color="#FFFFFF" />
        </View>

        <Text style={styles.contactLabel}>Contact Email</Text>
        <Text style={styles.contactEmail}>admin@yopmail.com</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF7FC' },
  darkHeader: {
    backgroundColor: '#181A20',
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  brandTitle: { fontSize: 22, fontWeight: '900', color: '#00A3FF' },
  subHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00A3FF',
    textAlign: 'center',
    marginTop: 8,
  },
  content: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  contactLabel: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 6 },
  contactEmail: { fontSize: 15, fontWeight: '600', color: '#475569' },
});
