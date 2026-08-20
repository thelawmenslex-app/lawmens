import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../../Services/apiService';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState({
    name: 'Advocate',
    phone: '',
    email: '',
    profession: 'Advocate'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUser();
    const unsubscribe = navigation.addListener('focus', () => {
      loadUser();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUser = async () => {
    const stored = await ApiService.auth.getStoredUser();
    if (stored) {
      const displayName = stored.name || (stored.firstName ? `${stored.firstName} ${stored.lastName || ''}`.trim() : (stored.email ? stored.email.split('@')[0] : 'Advocate'));
      setUser({
        name: displayName,
        phone: stored.phone || stored.phoneNumber || '',
        email: stored.email || '',
        profession: stored.profession || 'Advocate'
      });
    }
  };

  const handleSave = async () => {
    setIsEditing(false);
    await AsyncStorage.setItem('@userprofile', JSON.stringify(user));
    Alert.alert('Success', 'Profile details updated successfully');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await ApiService.auth.logout();
          navigation.navigate('Welcome');
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />

      {/* Dark Curved Header */}
      <View style={styles.darkHeader}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userProfession}>{user.profession}</Text>
        </View>

        {/* User Details */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Account Information</Text>

          <Text style={styles.fieldLabel}>Full Name</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={user.name}
              editable={isEditing}
              onChangeText={(text) => setUser({ ...user, name: text })}
            />
          </View>

          <Text style={styles.fieldLabel}>Phone Number</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={user.phone}
              editable={isEditing}
              keyboardType="phone-pad"
              placeholder="Enter phone number"
              placeholderTextColor="#94A3B8"
              onChangeText={(text) => setUser({ ...user, phone: text })}
            />
          </View>

          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={user.email}
              editable={isEditing}
              keyboardType="email-address"
              placeholder="Enter email address"
              placeholderTextColor="#94A3B8"
              onChangeText={(text) => setUser({ ...user, email: text })}
            />
          </View>

          <Text style={styles.fieldLabel}>Profession</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={user.profession}
              editable={isEditing}
              placeholder="e.g. Advocate"
              placeholderTextColor="#94A3B8"
              onChangeText={(text) => setUser({ ...user, profession: text })}
            />
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            <Text style={styles.editBtnText}>
              {isEditing ? 'Save Profile' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Quick View */}
        <TouchableOpacity
          style={styles.subCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Subscription')}
        >
          <View style={styles.subIconBox}>
            <Feather name="tv" size={20} color="#00A3FF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subTitle}>My Subscription</Text>
            <Text style={styles.subStatus}>Active Premium Pass (358 Days Left)</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#94A3B8" />
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.85}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={18} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#00A3FF' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 110, gap: 14 },
  avatarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  userName: { fontSize: 18, fontWeight: '900', color: '#111827' },
  userProfession: { fontSize: 13, color: '#00A3FF', fontWeight: '700', marginTop: 2 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
  },
  cardHeading: { fontSize: 15, fontWeight: '900', color: '#111827', marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 4 },
  inputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
    marginBottom: 12,
  },
  input: { fontSize: 14, color: '#111827', fontWeight: '600' },
  editBtn: {
    backgroundColor: '#00A3FF',
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  editBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  subCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D8ECF7',
  },
  subIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  subStatus: { fontSize: 12, color: '#10B981', fontWeight: '600', marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: { fontSize: 14, fontWeight: '800', color: '#EF4444' },
});
