import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './apiService';
import { BASE_URL } from '../Actions/constant';

const SYNC_TIMESTAMP_KEY = '@last_sync_timestamp';
const DYNAMIC_UPDATES_KEY = '@dynamic_casebook_updates';

export const SyncService = {
  // Pull latest changes from Admin Portal (https://www.the-lawmens.com/content)
  pullLatestChanges: async () => {
    try {
      const lastSync = await AsyncStorage.getItem(SYNC_TIMESTAMP_KEY);
      const timestamp = lastSync ? parseInt(lastSync, 10) : 0;

      // 1. First attempt sync API
      const res = await ApiService.sync.pull(timestamp);
      if (res && res.status && res.data) {
        const { newSyncTimestamp, changes } = res.data;

        if (changes && changes.casebooks && changes.casebooks.length > 0) {
          const existingStr = await AsyncStorage.getItem(DYNAMIC_UPDATES_KEY);
          const existing = existingStr ? JSON.parse(existingStr) : {};

          changes.casebooks.forEach(cb => {
            const cbId = cb._id?.$oid || cb._id;
            existing[cbId] = cb;
          });

          await AsyncStorage.setItem(DYNAMIC_UPDATES_KEY, JSON.stringify(existing));
        }

        if (newSyncTimestamp) {
          await AsyncStorage.setItem(SYNC_TIMESTAMP_KEY, String(newSyncTimestamp));
        }
        return { success: true, updatedCount: (changes?.casebooks || []).length };
      }

      // 2. Direct fetch from www.the-lawmens.com API category
      try {
        const catRes = await fetch(`${BASE_URL}/category`);
        const catJson = await catRes.json();
        if (catJson && catJson.status && catJson.data) {
          await AsyncStorage.setItem('@live_categories', JSON.stringify(catJson.data));
        }
      } catch (err) {}

      return { success: true, updatedCount: 0 };
    } catch (e) {
      console.log('Sync error:', e.message);
      return { success: false, error: e.message };
    }
  },

  // Get dynamic section content if updated from admin portal
  getDynamicSection: async (secNum) => {
    try {
      const dynamicStr = await AsyncStorage.getItem(DYNAMIC_UPDATES_KEY);
      if (!dynamicStr) return null;
      const dynamicMap = JSON.parse(dynamicStr);

      for (const cbId of Object.keys(dynamicMap)) {
        const cb = dynamicMap[cbId];
        const sec = (cb.section || []).find(s => String(s.name).trim() === String(secNum).trim());
        if (sec && sec.content && sec.content.length > 0) {
          return sec;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
};
