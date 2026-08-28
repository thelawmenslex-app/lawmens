import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../Actions/constant';

class FcmNotificationService {
  constructor() {
    this.popupListeners = new Set();
    this.deviceTokenKey = '@device_fcm_token';
  }

  // 1. Request / Verify Android 13+ Runtime Notification Permissions
  checkAndRequestPermission = async (showPromptIfDenied = false) => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (hasPermission) {
          await this.registerDeviceToken();
          return true;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: "Enable Law Notifications",
            message: "Allow THE-LAWMEN'S to send you legal amendments, new section updates, and important broadcasts.",
            buttonPositive: "Allow",
            buttonNegative: "Not Now"
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          await this.registerDeviceToken();
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN && showPromptIfDenied) {
          Alert.alert(
            "Notifications are Disabled",
            "To receive real-time legal updates, section amendments, and subscription notices, please enable notifications in app settings.",
            [
              { text: "Not Now", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() }
            ]
          );
          return false;
        }
      } else {
        await this.registerDeviceToken();
        return true;
      }
    } catch (err) {
      console.warn('[FCM Service] Permission check error:', err);
    }
    return false;
  };

  // 2. Generate and Register Active Device Token with Backend
  registerDeviceToken = async () => {
    try {
      let token = null;
      try {
        const { NativeModules } = require('react-native');
        if (NativeModules.FirebaseTokenModule && typeof NativeModules.FirebaseTokenModule.getFcmToken === 'function') {
          token = await NativeModules.FirebaseTokenModule.getFcmToken();
        }
      } catch (err) {
        console.log('[FCM Service] Native token fetch note:', err?.message);
      }

      if (!token) {
        token = await AsyncStorage.getItem(this.deviceTokenKey);
      }
      if (!token) {
        token = `fcm_device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      await AsyncStorage.setItem(this.deviceTokenKey, token);

      const authToken = await AsyncStorage.getItem('@authtoken');
      const headers = { 'Content-Type': 'application/json' };
      if (authToken && authToken !== 'offline_authenticated_token') {
        headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      }

      await fetch(`${BASE_URL}/user/fcm-token`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fcmToken: token,
          platform: 'android'
        })
      });
      console.log('[FCM Service] Active device token registered with backend:', token.slice(0, 20) + '...');
    } catch (e) {
      console.warn('[FCM Service] Token registration skipped:', e.message);
    }
  };

  // 3. In-App Popup Alert Listeners
  onInAppPopup = (callback) => {
    this.popupListeners.add(callback);
    return () => this.popupListeners.delete(callback);
  };

  triggerInAppPopup = (notification) => {
    this.popupListeners.forEach(cb => {
      try {
        cb(notification);
      } catch (err) {}
    });
  };

  // 4. Post System Notification Tray Banner via Native Bridge
  postSystemNotificationBanner = async (notification) => {
    try {
      if (!notification || !notification.title) return;
      const notifId = notification.id || notification._id;
      if (notifId) {
        const alreadyPosted = await AsyncStorage.getItem('@posted_tray_banner_' + String(notifId));
        if (alreadyPosted) return;
        await AsyncStorage.setItem('@posted_tray_banner_' + String(notifId), 'true');
      }

      const { NativeModules } = require('react-native');
      if (NativeModules.FirebaseTokenModule && typeof NativeModules.FirebaseTokenModule.displaySystemNotification === 'function') {
        NativeModules.FirebaseTokenModule.displaySystemNotification(
          notification.title,
          notification.desc || notification.message || '',
          notification.actionUrl || ''
        );
        console.log('[FCM Service] System notification tray banner posted successfully for:', notification.title);
      }
    } catch (e) {
      console.warn('[FCM Service] Error posting tray banner:', e);
    }
  };
}

export const fcmNotificationService = new FcmNotificationService();
