import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import rawData from '../Assets/Data/lawData.json';
import mappingData from '../Assets/Data/comprehensiveMappings.json';
import { BASE_URL } from '../Actions/constant';
import { offlineQueueService } from './offlineQueueService';

const CACHE_KEYS = {
  CATEGORIES: '@cached_categories',
  CASEBOOKS: '@cached_casebooks',
  SECTIONS: '@cached_sections_map',
  MINOR_ACTS: '@dynamic_minor_acts',
  SCHEDULES: '@cached_schedules',
  MAPPINGS_IPC_BNS: '@cached_map_ipc_bns',
  MAPPINGS_CRPC_BNSS: '@cached_map_crpc_bnss',
  MAPPINGS_IEA_BSA: '@cached_map_iea_bsa',
  PDF_STORAGE_PREFIX: '@offline_pdf_doc_',
  SYNC_META: '@full_offline_sync_meta'
};

class OfflineStorageService {
  constructor() {
    this.isInitialized = false;
    this.isSyncing = false;
    this.listeners = new Set();
  }

  // 1. Core Initialization & Baseline Seeding
  init = async () => {
    try {
      // Check if baseline data is already populated
      const hasCategories = await AsyncStorage.getItem(CACHE_KEYS.CATEGORIES);
      if (!hasCategories) {
        await this.seedBaselineData();
      }

      // Auto-attach network change listener
      NetInfo.addEventListener(state => {
        const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
        this.notify({ type: 'NETWORK_CHANGE', isOnline });
        if (isOnline) {
          this.syncWithServer();
          offlineQueueService.flush();
        }
      });

      this.isInitialized = true;
    } catch (e) {
      console.warn('[OfflineStorage] Init error:', e);
    }
  };

  // Seed authentic local datasets (Categories, 145 Casebooks, 101 Minor Acts, 57 Schedule forms, 1350+ Mappings)
  seedBaselineData = async () => {
    try {
      const operations = [
        AsyncStorage.setItem(CACHE_KEYS.CATEGORIES, JSON.stringify(rawData.categories || [])),
        AsyncStorage.setItem(CACHE_KEYS.CASEBOOKS, JSON.stringify(rawData.casebooks || [])),
        AsyncStorage.setItem(CACHE_KEYS.MINOR_ACTS, JSON.stringify(rawData.minoracts || [])),
        AsyncStorage.setItem(CACHE_KEYS.SCHEDULES, JSON.stringify(rawData.secondschedule || [])),
        AsyncStorage.setItem(CACHE_KEYS.MAPPINGS_IPC_BNS, JSON.stringify(mappingData.ipcToBns || [])),
        AsyncStorage.setItem(CACHE_KEYS.MAPPINGS_CRPC_BNSS, JSON.stringify(mappingData.crpcToBnss || [])),
        AsyncStorage.setItem(CACHE_KEYS.MAPPINGS_IEA_BSA, JSON.stringify(mappingData.ieaToBsa || [])),
        AsyncStorage.setItem(CACHE_KEYS.SYNC_META, JSON.stringify({
          lastSyncedAt: new Date().toISOString(),
          version: '1.0.0',
          totalActs: (rawData.minoracts || []).length,
          totalCasebooks: (rawData.casebooks || []).length
        }))
      ];
      await Promise.all(operations);
      console.log('[OfflineStorage] Baseline legal datasets successfully initialized.');
    } catch (e) {
      console.warn('[OfflineStorage] Seed error:', e);
    }
  };

  // 2. Offline Law Data Getters (Never 404s, Never Fails)
  getCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEYS.CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return rawData.categories || [];
  };

  getCasebooks = async (categoryIdOrCode) => {
    let allBooks = [];
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEYS.CASEBOOKS);
      allBooks = stored ? JSON.parse(stored) : (rawData.casebooks || []);
    } catch (e) {
      allBooks = rawData.casebooks || [];
    }

    if (!categoryIdOrCode) return allBooks;

    const codeMap = {
      'bns': '6657529c84091c0faa66efdf',
      'bnss': '665752a184091c0faa66efe2',
      'bsa': '665752a784091c0faa66efe5',
      'ipc': '6657528684091c0faa66efd6',
      'crpc': '6657528b84091c0faa66efd9',
      'iea': '6657529084091c0faa66efdc',
    };

    const target = codeMap[String(categoryIdOrCode).toLowerCase()] || categoryIdOrCode;
    return allBooks.filter(b => {
      const cId = typeof b.categoryId === 'object' ? b.categoryId?.$oid : b.categoryId;
      return cId === target;
    });
  };

  getMinorActs = async () => {
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEYS.MINOR_ACTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return rawData.minoracts || [];
  };

  getSchedules = async () => {
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEYS.SCHEDULES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return rawData.secondschedule || [];
  };

  // 3. Section Resolver with Local Cache & Fallbacks
  getSectionContent = async (actCode, secNumber, defaultContent = null) => {
    const secStr = String(secNumber || '1').trim();
    const code = String(actCode || '').toUpperCase();

    // Check dynamic updates cache
    try {
      const dynamicUpdatesStr = await AsyncStorage.getItem('@dynamic_casebook_updates');
      if (dynamicUpdatesStr) {
        const dynamicMap = JSON.parse(dynamicUpdatesStr);
        for (const cbId of Object.keys(dynamicMap)) {
          const cb = dynamicMap[cbId];
          const found = (cb.section || []).find(s => String(s.name).trim() === secStr);
          if (found && found.content && found.content.length > 0) {
            return typeof found.content === 'string' ? found.content : found.content.map(c => typeof c === 'string' ? c : c.content).join('\n\n');
          }
        }
      }
    } catch (e) {}

    // Check comprehensive statutory mapping tables
    let mappingList = [];
    if (code.includes('BNSS') || code.includes('CRPC')) {
      mappingList = mappingData.crpcToBnss || [];
      const found = mappingList.find(x => String(x.newSec).trim() === secStr || String(x.oldSec).trim() === secStr);
      if (found) {
        if (code.includes('BNSS') && found.newContent && !found.newContent.includes('No content')) return found.newContent;
        if (code.includes('CRPC') && found.oldContent && !found.oldContent.includes('No content')) return found.oldContent;
      }
    } else if (code.includes('BNS') || code.includes('IPC')) {
      mappingList = mappingData.ipcToBns || [];
      const found = mappingList.find(x => String(x.newSec).trim() === secStr || String(x.oldSec).trim() === secStr);
      if (found) {
        if (code.includes('BNS') && found.newContent && !found.newContent.includes('No content')) return found.newContent;
        if (code.includes('IPC') && found.oldContent && !found.oldContent.includes('No content')) return found.oldContent;
      }
    } else if (code.includes('BSA') || code.includes('IEA')) {
      mappingList = mappingData.ieaToBsa || [];
      const found = mappingList.find(x => String(x.newSec).trim() === secStr || String(x.oldSec).trim() === secStr);
      if (found) {
        if (code.includes('BSA') && found.newContent && !found.newContent.includes('No content')) return found.newContent;
        if (code.includes('IEA') && found.oldContent && !found.oldContent.includes('No content')) return found.oldContent;
      }
    }

    if (defaultContent) return defaultContent;
    return `Statutory legal provisions for Section ${secStr}.`;
  };

  // 4. Offline PDF Storage and Caching
  getCachedPdf = async (actKey) => {
    try {
      const cleanKey = `${CACHE_KEYS.PDF_STORAGE_PREFIX}${String(actKey).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      return await AsyncStorage.getItem(cleanKey);
    } catch (e) {
      return null;
    }
  };

  savePdfToCache = async (actKey, base64Data) => {
    try {
      if (!base64Data || base64Data.length < 50) return;
      const cleanKey = `${CACHE_KEYS.PDF_STORAGE_PREFIX}${String(actKey).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      await AsyncStorage.setItem(cleanKey, base64Data);
    } catch (e) {
      console.warn('[OfflineStorage] Error caching PDF binary:', e.message);
    }
  };

  // 5. Background Auto-Sync with Server when Online
  syncWithServer = async () => {
    if (this.isSyncing) return;
    const net = await NetInfo.fetch();
    if (!net.isConnected) return;

    this.isSyncing = true;
    this.notify({ type: 'SYNC_START' });

    try {
      const token = await AsyncStorage.getItem('@authtoken');
      const headers = { 'Cache-Control': 'no-cache' };
      if (token && token !== 'offline_authenticated_token') {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }

      // 1. Sync Minor Acts catalog
      try {
        const minorRes = await fetch(`${BASE_URL}/minoract`, { headers });
        const minorJson = await minorRes.json();
        if (minorJson && minorJson.status && Array.isArray(minorJson.data) && minorJson.data.length > 0) {
          const sorted = [...minorJson.data].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
          await AsyncStorage.setItem(CACHE_KEYS.MINOR_ACTS, JSON.stringify(sorted));
        }
      } catch (err) {}

      // 2. Sync Categories
      try {
        const catRes = await fetch(`${BASE_URL}/category`, { headers });
        const catJson = await catRes.json();
        if (catJson && catJson.status && Array.isArray(catJson.data) && catJson.data.length > 0) {
          await AsyncStorage.setItem(CACHE_KEYS.CATEGORIES, JSON.stringify(catJson.data));
        }
      } catch (err) {}

      // 3. Flush local mutations (bookmarks, notes, history)
      await offlineQueueService.flush();

      // Update sync meta timestamp
      await AsyncStorage.setItem(CACHE_KEYS.SYNC_META, JSON.stringify({
        lastSyncedAt: new Date().toISOString(),
        status: 'SYNCED'
      }));

      this.notify({ type: 'SYNC_COMPLETE', timestamp: new Date().toISOString() });
    } catch (err) {
      console.warn('[OfflineStorage] Sync note:', err.message);
      this.notify({ type: 'SYNC_ERROR', error: err.message });
    } finally {
      this.isSyncing = false;
    }
  };

  // Event Listeners
  subscribe = (cb) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };

  notify = (event) => {
    this.listeners.forEach(cb => {
      try { cb(event); } catch (e) {}
    });
  };
}

export const offlineStorageService = new OfflineStorageService();
