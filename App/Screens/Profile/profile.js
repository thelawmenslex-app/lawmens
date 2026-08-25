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
  ActivityIndicator
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../../Services/apiService';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState({
    name: '',
    phone: '',
    email: '',
    profession: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

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
      
      if (token && stored) {
        const parsed = JSON.parse(stored);
        setIsLoggedIn(true);
        const displayName = parsed.name || (parsed.firstName ? `${parsed.firstName} ${parsed.lastName || ''}`.trim() : (parsed.email ? parsed.email.split('@')[0] : 'User'));
        setUser({
          name: displayName,
          phone: parsed.phone || parsed.phoneNumber || '',
          email: parsed.email || '',
          profession: parsed.profession || 'Legal Professional'
        });
      } else {
        setIsLoggedIn(false);
        setUser({
          name: 'Guest User',
          phone: '',
          email: '',
          profession: 'Guest'
        });
      }
    } catch (e) {
      console.warn('Load user error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsEditing(false);
    await AsyncStorage.setItem('@userprofile', JSON.stringify(user));
    Alert.alert('Success', 'Profile details updated successfully');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('@authtoken');
          await AsyncStorage.removeItem('@userprofile');
          setIsLoggedIn(false);
          setUser({ name: 'Guest User', phone: '', email: '', profession: 'Guest' });
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
      >
        {/* Profile Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>{user.name || 'Guest User'}</Text>
          <Text style={styles.userProfession}>{user.profession || 'Guest'}</Text>
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
              editable={isEditing && isLoggedIn}
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
              editable={isEditing && isLoggedIn}
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
              editable={isEditing && isLoggedIn}
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
              editable={isEditing && isLoggedIn}
              onChangeText={(text) => setUser({ ...user, profession: text })}
            />
          </View>

          {isLoggedIn ? (
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.85}
              onPress={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              <Text style={styles.editBtnText}>
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.editBtnText}>Login / Sign Up</Text>
            </TouchableOpacity>
          )}
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

        {/* Logout / Login Action */}
        {isLoggedIn ? (
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={18} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        ) : null}
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
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  userProfession: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00A3FF',
    marginTop: 2,
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
