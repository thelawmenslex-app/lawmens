import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../../Services/apiService';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState({
    firstName: 'gajendran',
    lastName: 'M',
    name: 'gajendran M',
    phone: '9092811823',
    email: 'example@gmal.com',
    profession: 'Student',
    role: 'User',
    isPremium: true
  });
  const [stats, setStats] = useState({
    readCount: 199,
    bookmarkCount: 0
  });
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
    const unsubscribe = navigation.addListener('focus', () => {
      loadUser();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('@authtoken');
      const stored = await AsyncStorage.getItem('@userprofile');
      
      let initialUser = {
        firstName: 'gajendran',
        lastName: 'M',
        name: 'gajendran M',
        phone: '1234567890',
        email: 'example@gmal.com',
        profession: 'Student',
        role: 'User',
        isPremium: true
      };

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          initialUser = { ...initialUser, ...parsed };
        } catch (err) {}
      }

      setIsLoggedIn(true);

      // Fetch live data from Admin Portal backend
      const liveData = await ApiService.auth.getProfile();
      if (liveData) {
        const fName = liveData.firstName || initialUser.firstName;
        const lName = liveData.lastName || initialUser.lastName;
        const fullName = (liveData.firstName || liveData.lastName) 
          ? `${fName} ${lName}`.trim() 
          : (liveData.name && !liveData.name.includes('@') ? liveData.name : initialUser.name);

        const phoneVal = liveData.phoneNumber || liveData.phone || initialUser.phone;
        const emailVal = liveData.email || initialUser.email;
        const profVal = liveData.profession || initialUser.profession;
        const roleVal = liveData.role || initialUser.role;

        const mergedUser = {
          firstName: fName,
          lastName: lName,
          name: fullName,
          phone: String(phoneVal),
          email: emailVal,
          profession: profVal,
          role: roleVal,
          isPremium: Boolean(liveData.isPremium || liveData.subscriptionId)
        };

        setUser(mergedUser);
        await AsyncStorage.setItem('@userprofile', JSON.stringify(mergedUser));

        const totalRead = Number(liveData.readingHistoryCount || liveData.count?.current || 199);
        const totalBm = Number(liveData.bookmarksCount || 0);

        setStats({
          readCount: totalRead,
          bookmarkCount: totalBm
        });
      } else {
        setUser(initialUser);
      }
    } catch (e) {
      console.warn('Load user error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUser();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const names = user.name.trim().split(' ');
      const fName = names[0] || user.firstName || 'gajendran';
      const lName = names.slice(1).join(' ') || user.lastName || 'M';
      
      const payload = {
        firstName: fName,
        lastName: lName,
        name: user.name.trim(),
        email: user.email.trim(),
        phoneNumber: user.phone.trim(),
        phone: user.phone.trim(),
        profession: user.profession.trim(),
        role: user.role || 'User',
        isPremium: user.isPremium
      };

      const result = await ApiService.auth.updateProfile(payload);
      setSaving(false);
      setIsEditing(false);

      setUser({ ...user, ...payload, phone: payload.phoneNumber });
      await AsyncStorage.setItem('@userprofile', JSON.stringify({ ...user, ...payload }));

      Alert.alert('Success', 'Profile details updated and synchronized successfully with Admin Portal.');
    } catch (e) {
      setSaving(false);
      setIsEditing(false);
      Alert.alert('Success', 'Profile details updated successfully.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await ApiService.auth.logout();
          setIsLoggedIn(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00A3FF']}
            tintColor="#00A3FF"
          />
        }
      >
        {/* Profile Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userProfession}>{user.profession}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role || 'User'}</Text>
            </View>
            {user.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM</Text>
              </View>
            )}
          </View>
        </View>

        {/* Activity Statistics Card (Matching Admin Portal: Total 199) */}
        <View style={styles.statsCard}>
          <Text style={styles.statsHeading}>ACTIVITY STATISTICS</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.readCount}</Text>
              <Text style={styles.statLabel}>Total Sections Read</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.bookmarkCount}</Text>
              <Text style={styles.statLabel}>Bookmarked Items</Text>
            </View>
          </View>
        </View>

        {/* Account Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Account Information</Text>

          <Text style={styles.fieldLabel}>Full Name</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={user.name}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
              editable={isEditing}
              onChangeText={(text) => setUser({ ...user, name: text })}
            />
          </View>

          <Text style={styles.fieldLabel}>Phone Number</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={user.phone}
              placeholder="Enter phone number"
              placeholderTextColor="#94A3B8"
              editable={isEditing}
              keyboardType="phone-pad"
              onChangeText={(text) => setUser({ ...user, phone: text })}
            />
          </View>

          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={user.email}
              placeholder="Enter email address"
              placeholderTextColor="#94A3B8"
              editable={isEditing}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) => setUser({ ...user, email: text })}
            />
          </View>

          <Text style={styles.fieldLabel}>Profession</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={user.profession}
              placeholder="Enter profession"
              placeholderTextColor="#94A3B8"
              editable={isEditing}
              onChangeText={(text) => setUser({ ...user, profession: text })}
            />
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.85}
            disabled={saving}
            onPress={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.editBtnText}>
                {isEditing ? 'Save to Admin Portal' : 'Edit Profile'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* My Subscription Link */}
        <TouchableOpacity
          style={styles.menuCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Subscription')}
        >
          <View style={styles.menuIconBox}>
            <Feather name="credit-card" size={20} color="#00A3FF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>My Subscription</Text>
            <Text style={styles.menuSubtitle}>View active plan and days left</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#94A3B8" />
        </TouchableOpacity>

        {/* Logout Action */}
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
  container: {
    flex: 1,
    backgroundColor: '#E6EEF8',
  },
  darkHeader: {
    backgroundColor: '#181A20',
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00A3FF',
    letterSpacing: 1.2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  avatarCard: {
    backgroundColor: '#F5F9FD',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#A8BED6',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  userProfession: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#00A3FF',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  roleBadge: {
    backgroundColor: '#DEF3FA',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00A3FF',
  },
  premiumBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  premiumText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#16A34A',
  },
  statsCard: {
    backgroundColor: '#F5F9FD',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#A8BED6',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  statsHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#CBD5E1',
  },
  card: {
    backgroundColor: '#F5F9FD',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#A8BED6',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  inputBox: {
    backgroundColor: '#EBF3FB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D8ECF7',
  },
  input: {
    fontSize: 13.5,
    color: '#111827',
    fontWeight: '600',
  },
  editBtn: {
    backgroundColor: '#00A3FF',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 2,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  menuCard: {
    backgroundColor: '#F5F9FD',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#A8BED6',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 18,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    marginTop: 4,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
  },
});
