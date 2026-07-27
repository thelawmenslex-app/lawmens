"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Send, CheckCircle, AlertTriangle, Clock, Edit2, Trash2 } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetGroup, setTargetGroup] = useState('all');
  const [notificationType, setNotificationType] = useState('general');
  const [loading, setLoading] = useState(false);

  const [isPopup, setIsPopup] = useState(false);
  const [buttonText, setButtonText] = useState('Dismiss');
  const [actionUrl, setActionUrl] = useState('');
  const [editId, setEditId] = useState(null);
  
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

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

  const formatDatetimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) return;

    setLoading(true);
    try {
      let response;
      const payload = {
        title,
        message,
        targetGroup,
        notificationType,
        isPopup,
        buttonText,
        actionUrl,
        scheduledAt: isScheduled ? new Date(scheduledAt).toISOString() : null
      };

      if (editId) {
        // Edit Mode
        response = await axios.put(`/api/v1/admin/notifications/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create Mode
        response = await axios.post('/api/v1/admin/notifications/send', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (response.data.status) {
        alert(editId ? 'Notification updated successfully!' : 'Notification scheduled/broadcast triggered successfully!');
        resetForm();
        fetchNotificationLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save notification changes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification record?')) return;
    try {
      const response = await axios.delete(`/api/v1/admin/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        alert('Notification deleted successfully.');
        fetchNotificationLogs();
        if (editId === id) resetForm();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete notification.');
    }
  };

  const handleEditSelect = (not) => {
    setEditId(not._id);
    setTitle(not.title);
    setMessage(not.message);
    setTargetGroup(not.targetGroup || 'all');
    setNotificationType(not.notificationType || 'general');
    setIsPopup(not.isPopup || false);
    setButtonText(not.buttonText || 'Dismiss');
    setActionUrl(not.actionUrl || '');
    
    const isFuture = not.status === 'scheduled' || (not.scheduledAt && new Date(not.scheduledAt).getTime() > Date.now());
    setIsScheduled(isFuture);
    setScheduledAt(not.scheduledAt ? formatDatetimeLocal(not.scheduledAt) : '');
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setMessage('');
    setTargetGroup('all');
    setNotificationType('general');
    setIsPopup(false);
    setButtonText('Dismiss');
    setActionUrl('');
    setIsScheduled(false);
    setScheduledAt('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Broadcast Form */}
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4 h-fit">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          {editId ? 'Edit Notification' : 'Broadcast Panel'}
        </h3>
        <p className="text-xs text-slate-400">
          {editId ? 'Modify the selected notification parameters below.' : 'Trigger standard Firebase Cloud Messaging (FCM) notifications to specific devices or channels.'}
        </p>

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
              placeholder="New BNS chapter updates are live..."
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

          {/* In-app Popup Settings */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase">Trigger In-App Popup Alert</label>
              <input
                type="checkbox"
                checked={isPopup}
                onChange={(e) => setIsPopup(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
              />
            </div>

            {isPopup && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customize Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
                    placeholder="Dismiss"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Action Route / Screen (Optional)</label>
                  <input
                    type="text"
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
                    placeholder="E.g. Subscription or Index"
                  />
                </div>
              </div>
            )}
          </div>
          {/* Schedule Settings */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span>Schedule for Later</span>
              </label>
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
              />
            </div>

            {isScheduled && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Delivery Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                    required={isScheduled}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-2 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-400 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Saving...' : editId ? 'Update Notice' : 'Broadcast FCM Notice'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast History logs */}
      <div className="md:col-span-2 bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Trigger Logs</h3>
        
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-20rem)] pr-2">
          {notifications.map((not) => (
            <div key={not._id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex gap-4 items-start">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                not.status === 'scheduled' ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {not.status === 'scheduled' ? <Clock className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{not.title}</h4>
                    {not.status === 'scheduled' ? (
                      <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase tracking-wider">Scheduled</span>
                    ) : (
                      <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase tracking-wider">Sent</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {not.status === 'scheduled' 
                      ? `Scheduled: ${new Date(not.scheduledAt).toLocaleString()}`
                      : new Date(not.sentAt || not.createdAt).toLocaleDateString()
                    }
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pr-6">{not.message}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold text-slate-400">
                  <span>To: <span className="text-slate-600 uppercase">{not.targetGroup}</span></span>
                  <span>Category: <span className="text-slate-600 capitalize">{not.notificationType}</span></span>
                  <span>Recipients: <span className="text-slate-600">{not.deliveryCount} devices</span></span>
                  {not.isPopup && (
                    <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">In-App Popup</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 ml-2 flex-shrink-0">
                <button
                  onClick={() => handleEditSelect(not)}
                  className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-white border border-transparent hover:border-slate-100 transition-colors"
                  title="Edit Notification"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(not._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white border border-transparent hover:border-slate-100 transition-colors"
                  title="Delete Notification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
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
