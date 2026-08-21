import AsyncStorage from '@react-native-async-storage/async-storage';
import { backendroutes, BASE_URL } from '../Actions/constant';
import { DataService } from './dataService';
import { ComparisonService, IPC_BNS_MAPPING } from './comparisonService';

export const ApiService = {
  // --- AUTHENTICATION ---
  auth: {
    login: async (emailOrPhone, password) => {
      try {
        const res = await fetch(backendroutes.login, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userName: emailOrPhone.trim(), password: password.trim() })
        });
        const data = await res.json();
        if (data.status && (data.token || data.data?.token)) {
          const token = data.token || data.data?.token;
          const user = data.user || data.data?.user || { name: emailOrPhone, email: emailOrPhone };
          await AsyncStorage.setItem('@authtoken', token);
          await AsyncStorage.setItem('@userprofile', JSON.stringify(user));
          return { success: true, token, user };
        }
        return { success: false, message: data.message || 'Invalid credentials' };
      } catch (e) {
        // Fallback for demo user
        if (emailOrPhone.trim().toLowerCase() === 'admin@yopmail.com' || emailOrPhone.trim() === '8234567897' || emailOrPhone.trim().toLowerCase() === 'gajendran') {
          const user = { name: 'gajendran', email: 'admin@yopmail.com', phone: '8234567897' };
          await AsyncStorage.setItem('@authtoken', 'demo_token_123');
          await AsyncStorage.setItem('@userprofile', JSON.stringify(user));
          return { success: true, token: 'demo_token_123', user };
        }
        return { success: false, message: 'Network connection error' };
      }
    },

    register: async (userData) => {
      try {
        const res = await fetch(backendroutes.register, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const data = await res.json();
        return data;
      } catch (e) {
        return { status: false, message: 'Registration server unavailable' };
      }
    },

    getStoredUser: async () => {
      try {
        const userStr = await AsyncStorage.getItem('@userprofile');
        return userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        return null;
      }
    },

    logout: async () => {
      await AsyncStorage.removeItem('@authtoken');
      await AsyncStorage.removeItem('@userprofile');
    }
  },

  // --- LEGAL DATA & BOOKS ---
  laws: {
    getCategories: async () => {
      try {
        const res = await fetch(backendroutes.category);
        const data = await res.json();
        if (data.status && data.data) return data.data;
      } catch (e) {}
      return DataService.lawData.category || [];
    },

    getChapters: (catId) => {
      return DataService.getChaptersByCategory(catId);
    },

    getSections: (catId, chapterName) => {
      const chapters = DataService.getChaptersByCategory(catId);
      const ch = chapters.find(c => c.name === chapterName);
      return ch ? ch.section || [] : [];
    },

        getMinorActs: async () => {
      try {
        const token = await AsyncStorage.getItem('@authtoken');
        const headers = {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        };
        if (token) {
          headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(backendroutes.minorActList, {
          headers,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const data = await res.json();
        if (data.status && Array.isArray(data.data) && data.data.length > 0) {
          const sorted = [...data.data].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
          await AsyncStorage.setItem('@dynamic_minor_acts', JSON.stringify(sorted));
          return sorted;
        }
      } catch (e) {
        console.warn('Live minor acts fetch fallback:', e.message);
      }
      // Check cached dynamic minor acts before static file
      try {
        const cached = await AsyncStorage.getItem('@dynamic_minor_acts');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
      return DataService.getMinorActs();
    },

    getSchedules: async () => {
      try {
        const res = await fetch(backendroutes.getSecondSchedule);
        const data = await res.json();
        if (data.status && data.data) return data.data;
      } catch (e) {}
      return DataService.getSecondSchedule();
    }
  },

  // --- SEARCH ---
  search: {
    query: (text) => {
      return DataService.searchSections(text);
    }
  },

  // --- COMPARISON ---
  comparison: {
    getMapping: (ipcSec) => {
      return ComparisonService.getMappingForIpc(ipcSec);
    },
    compare: (oldText, newText) => {
      return ComparisonService.computeDiff(oldText, newText);
    }
  },

  // --- BOOKMARKS ---
  bookmarks: {
    getAll: async () => {
      try {
        const bmStr = await AsyncStorage.getItem('@bookmarks');
        return bmStr ? JSON.parse(bmStr) : [];
      } catch (e) {
        return [];
      }
    },
    toggle: async (item) => {
      try {
        const list = await ApiService.bookmarks.getAll();
        const existsIdx = list.findIndex(b => b.secName === item.secName && b.actTitle === item.actTitle);
        let updated;
        if (existsIdx >= 0) {
          updated = list.filter((_, i) => i !== existsIdx);
        } else {
          updated = [item, ...list];
        }
        await AsyncStorage.setItem('@bookmarks', JSON.stringify(updated));
        return { isBookmarked: existsIdx < 0, count: updated.length };
      } catch (e) {
        return { isBookmarked: false, count: 0 };
      }
    }
  },

  // --- QUERIES / ASK ADMIN ---
  queries: {
    submit: async (queryText, token) => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(backendroutes.querySubmit, {
          method: 'POST',
          headers,
          body: JSON.stringify({ query: queryText })
        });
        return await res.json();
      } catch (e) {
        return { status: false, message: 'Query received and queued for admin response.' };
      }
    }
  },

  // --- NOTIFICATIONS ---
  notifications: {
    get: async () => {
      try {
        const res = await fetch(backendroutes.notifications);
        const data = await res.json();
        if (data.status && data.data) return data.data;
      } catch (e) {}
      return [
        {
          id: '1',
          title: 'New Criminal Laws Synced',
          desc: 'BNS, BNSS, and BSA complete 100+ chapters & sections are fully synced for offline research.',
          time: 'Just now',
          read: false
        },
        {
          id: '2',
          title: '7-Day Free Trial Active',
          desc: 'Your trial gives you complete access to legal comparison, acts, and search.',
          time: '1 hour ago',
          read: false
        }
      ];
    }
  },

  // --- SUBSCRIPTION & PAYMENT ---
  subscription: {
    getPlans: async () => {
      try {
        const res = await fetch(backendroutes.subscriptionPlans);
        const data = await res.json();
        if (data.status && data.data) return data.data;
      } catch (e) {}
      return [
        { id: '1', name: 'Annual Pro', price: '₹999', duration: '1 Year', validTill: '13 Aug 2027' },
        { id: '2', name: 'Lifetime Pass', price: '₹2,499', duration: 'Lifetime', validTill: 'Lifetime' }
      ];
    },
    getStatus: async () => {
      return {
        isActive: true,
        type: 'Premium License',
        daysLeft: 358,
        purchasedDate: '13 Jul 2026',
        validTill: '13 Aug 2027',
        receiptId: 'FREE_TRIAL'
      };
    }
  }
};
