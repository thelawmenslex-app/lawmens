import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { backendroutes, BASE_URL } from '../Actions/constant';
import { offlineQueueService } from './offlineQueueService';

class LiveSyncService {
  constructor() {
    this.listeners = new Set();
    this.status = 'INITIALIZING'; // 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNCED'
    this.lastSyncTimestamp = null;
    this.serverVersion = 0;
    this.pollInterval = null;
  }

  init = async () => {
    // 1. Monitor network connectivity
    NetInfo.addEventListener(state => {
      const isConnected = !!(state.isConnected && state.isInternetReachable !== false);
      this.status = isConnected ? 'ONLINE' : 'OFFLINE';
      this.notifyListeners({ type: 'NETWORK_STATUS', isConnected, status: this.status });
      
      if (isConnected) {
        this.performIncrementalSync();
        offlineQueueService.flush();
      }
    });

    // 2. Load last sync metadata
    try {
      const storedTs = await AsyncStorage.getItem('@last_sync_timestamp');
      if (storedTs) this.lastSyncTimestamp = storedTs;
      const storedVer = await AsyncStorage.getItem('@last_sync_version');
      if (storedVer) this.serverVersion = Number(storedVer);
    } catch (e) {}

    // 3. Initial sync
    await this.performIncrementalSync();

    // 4. Polling heartbeat for live sync updates
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      this.performIncrementalSync();
    }, 15000); // 15s live sync heartbeat
  };

  subscribe = (callback) => {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  };

  notifyListeners = (event) => {
    this.listeners.forEach(cb => {
      try {
        cb(event);
      } catch (err) {
        console.warn('Sync listener error:', err);
      }
    });
  };

  // Perform incremental pull sync
  performIncrementalSync = async () => {
    const net = await NetInfo.fetch();
    if (!net.isConnected) return;

    try {
      this.status = 'SYNCING';
      this.notifyListeners({ type: 'SYNC_STATUS', status: 'SYNCING' });

      const token = await AsyncStorage.getItem('@authtoken');
      const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      };
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }

      const syncUrl = `${BASE_URL}/sync/pull?lastSyncTime=${encodeURIComponent(this.lastSyncTimestamp || '1970-01-01T00:00:00.000Z')}`;
      const res = await fetch(syncUrl, { headers });
      const data = await res.json();

      if (data.status && data.data) {
        const { changes, userData, serverVersion, syncTimestamp } = data.data;

        // Apply changes to local cache
        if (changes) {
          if (changes.books && changes.books.length > 0) {
            this.notifyListeners({ type: 'BOOKS_UPDATED', books: changes.books });
          }
          if (changes.sections && changes.sections.length > 0) {
            this.notifyListeners({ type: 'SECTIONS_UPDATED', sections: changes.sections });
          }
          if (changes.minorActs && changes.minorActs.length > 0) {
            this.notifyListeners({ type: 'MINOR_ACTS_UPDATED', minorActs: changes.minorActs });
          }
          if (changes.firstSchedules || changes.secondSchedules) {
            this.notifyListeners({ type: 'SCHEDULES_UPDATED' });
          }
        }

        if (userData && userData.profile) {
          await AsyncStorage.setItem('@userprofile', JSON.stringify(userData.profile));
          this.notifyListeners({ type: 'PROFILE_UPDATED', profile: userData.profile });
        }

        this.lastSyncTimestamp = syncTimestamp;
        this.serverVersion = serverVersion;
        await AsyncStorage.setItem('@last_sync_timestamp', syncTimestamp);
        await AsyncStorage.setItem('@last_sync_version', String(serverVersion));

        this.status = 'SYNCED';
        this.notifyListeners({ type: 'SYNC_STATUS', status: 'SYNCED', timestamp: syncTimestamp });
      }
    } catch (err) {
      this.status = 'SYNC_ERROR';
      this.notifyListeners({ type: 'SYNC_STATUS', status: 'SYNC_ERROR', error: err.message });
    }
  };

  destroy = () => {
    if (this.pollInterval) clearInterval(this.pollInterval);
  };
}

export const liveSyncService = new LiveSyncService();
