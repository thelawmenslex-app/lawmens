import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../Services/apiService';

export default function SideDrawerModal({ visible, onClose, navigation }) {
  const [user, setUser] = useState({
    name: 'Advocate',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (visible) {
      loadUserProfile();
    }
  }, [visible]);

  const loadUserProfile = async () => {
    try {
      const stored = await ApiService.auth.getStoredUser();
      if (stored) {
        const displayName = stored.name || (stored.firstName ? `${stored.firstName} ${stored.lastName || ''}`.trim() : (stored.email ? stored.email.split('@')[0] : 'Advocate'));
        const displayPhone = stored.phone || stored.phoneNumber || stored.email || '';
        setUser({
          name: displayName,
          phone: displayPhone,
          email: stored.email || ''
        });
      }
    } catch (e) {}
  };

  const navigateTo = (screen) => {
    onClose();
    navigation.navigate(screen);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.drawerContainer}>
          {/* Dynamic User Profile Row */}
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Feather name="user" size={26} color="#FFFFFF" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
              <Text style={styles.userPhone} numberOfLines={1}>{user.phone}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Feather name="x" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuList}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('Subscription')}
            >
              <Feather name="tv" size={20} color="#FFFFFF" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>My Subscription</Text>
              <Feather name="arrow-right" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('Contact')}
            >
              <Feather name="users" size={20} color="#FFFFFF" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Contact us</Text>
              <Feather name="arrow-right" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('About')}
            >
              <Feather name="help-circle" size={20} color="#FFFFFF" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>About</Text>
              <Feather name="arrow-right" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('Disclaimer')}
            >
              <Feather name="alert-triangle" size={20} color="#FFFFFF" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Disclaimer</Text>
              <Feather name="arrow-right" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('PrivacyPolicy')}
            >
              <Feather name="info" size={20} color="#FFFFFF" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
              <Feather name="arrow-right" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Bottom Logout Button */}
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={() => {
              onClose();
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
            }}
          >
            <Feather name="log-out" size={20} color="#111827" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Backdrop touch to close */}
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawerContainer: {
    width: '78%',
    backgroundColor: '#22252D',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  backdrop: {
    width: '22%',
    height: '100%',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderColor: '#323744',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  userPhone: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuList: { flex: 1, paddingTop: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  menuItemIcon: { marginRight: 16 },
  menuItemText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  logoutBtn: {
    height: 52,
    backgroundColor: '#00A3FF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoutText: { fontSize: 16, fontWeight: '800', color: '#111827' },
});
