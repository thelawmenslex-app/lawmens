import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from '../Actions/constant';

class OfflineQueueService {
  constructor() {
    this.isFlushing = false;
    this.queueKey = '@offline_operation_queue';
  }

  // Add user mutation operation to queue
  enqueue = async (type, payload) => {
    try {
      const op = {
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type, // 'BOOKMARK_ADD' | 'BOOKMARK_REMOVE' | 'RECORD_HISTORY' | 'NOTE_SAVE' | 'PROFILE_UPDATE'
        payload,
        timestamp: new Date().toISOString()
      };

      const existing = await this.getQueue();
      existing.push(op);
      await AsyncStorage.setItem(this.queueKey, JSON.stringify(existing));

      // Attempt flush if online
      const net = await NetInfo.fetch();
      if (net.isConnected) {
        this.flush();
      }
      return op;
    } catch (e) {
      console.warn('Enqueue error:', e);
    }
  };

  getQueue = async () => {
    try {
      const data = await AsyncStorage.getItem(this.queueKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  };

  // Push pending queue to backend /api/v1/sync/push
  flush = async () => {
    if (this.isFlushing) return;
    const net = await NetInfo.fetch();
    if (!net.isConnected) return;

    const queue = await this.getQueue();
    if (queue.length === 0) return;

    this.isFlushing = true;
    try {
      const token = await AsyncStorage.getItem('@authtoken');
      if (!token) {
        this.isFlushing = false;
        return;
      }

      const res = await fetch(`${BASE_URL}/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
        },
        body: JSON.stringify({ operations: queue })
      });

      const data = await res.json();
      if (data.status) {
        // Clear processed queue
        await AsyncStorage.setItem(this.queueKey, JSON.stringify([]));
        console.log(`[Offline Queue] Successfully flushed ${queue.length} operation(s) to MongoDB.`);
      }
    } catch (err) {
      console.warn('[Offline Queue] Flush retry scheduled:', err.message);
    } finally {
      this.isFlushing = false;
    }
  };
}

export const offlineQueueService = new OfflineQueueService();
