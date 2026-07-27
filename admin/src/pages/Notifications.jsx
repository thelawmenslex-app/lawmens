import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Send, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetGroup, setTargetGroup] = useState('all');
  const [notificationType, setNotificationType] = useState('general');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('adminToken');

  const fetchNotificationLogs = async () => {
    try {
      const response = await axios.get('/api/v1/admin/notifications/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setNotifications(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotificationLogs();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/v1/admin/notifications/send', {
        title,
        message,
        targetGroup,
        notificationType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status) {
        alert('Notification broadcast triggered successfully!');
        setTitle('');
        setMessage('');
        fetchNotificationLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to trigger push notification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Broadcast Form */}
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4 h-fit">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Broadcast Panel</h3>
        <p className="text-xs text-slate-400">Trigger standard Firebase Cloud Messaging (FCM) notifications to specific devices or channels.</p>

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Notification Title</label>
            <input
              type="text"
              placeholder="Important Update!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Notification Message</label>
            <textarea
              placeholder="New legal book BNS chapter updates are live..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
              rows="4"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Target Group</label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none"
              >
                <option value="all">All Members</option>
                <option value="premium">Premium Only</option>
                <option value="trial">Trial Users</option>
                <option value="expired">Expired Plans</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Notice Category</label>
              <select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none"
              >
                <option value="general">General Broadcast</option>
                <option value="legal-update">Legal Updates</option>
                <option value="promo">Promo campaign</option>
                <option value="trial-expiry">Trial End notice</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-400 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>{loading ? 'Sending...' : 'Broadcast FCM Notice'}</span>
          </button>
        </form>
      </div>

      {/* Broadcast History logs */}
      <div className="md:col-span-2 bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Trigger Logs</h3>
        
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-20rem)] pr-2">
          {notifications.map((not) => (
            <div key={not._id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex gap-4 items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
                <Bell className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{not.title}</h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(not.sentAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pr-6">{not.message}</p>
                <div className="flex gap-3 text-[10px] font-bold text-slate-400">
                  <span>To: <span className="text-slate-600 uppercase">{not.targetGroup}</span></span>
                  <span>Category: <span className="text-slate-600 capitalize">{not.notificationType}</span></span>
                  <span>Recipients: <span className="text-slate-600">{not.deliveryCount} devices</span></span>
                </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No previous broadcasts or push records logged.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
