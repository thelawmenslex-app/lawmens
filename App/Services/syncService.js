import { BASE_URL } from '../Actions/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SyncService = {
  syncCategories: async () => {
    try {
      const res = await fetch(`${BASE_URL}/category`);
      const json = await res.json();
      if (json.status && json.data) {
        await AsyncStorage.setItem('cached_categories', JSON.stringify(json.data));
        return { success: true, count: json.data.length };
      }
    } catch (e) {}
    return { success: false };
  },

  syncMinorActs: async (token) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${BASE_URL}/minoract`, { headers });
      const json = await res.json();
      if (json.status && json.data) {
        await AsyncStorage.setItem('cached_minoracts', JSON.stringify(json.data));
        return { success: true, count: json.data.length };
      }
    } catch (e) {}
    return { success: false };
  },

  syncSchedules: async () => {
    try {
      const res = await fetch(`${BASE_URL}/secondschedule/getLegalEntries`);
      const json = await res.json();
      if (json.status && json.data) {
        await AsyncStorage.setItem('cached_secondschedule', JSON.stringify(json.data));
        return { success: true, count: json.data.length };
      }
    } catch (e) {}
    return { success: false };
  }
};
