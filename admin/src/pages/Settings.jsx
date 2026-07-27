import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Save, HelpCircle, ShieldCheck } from 'lucide-react';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('adminToken');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setEmail(response.data.data.email);
        setPhoneNumber(response.data.data.phoneNumber);
        setIsActive(response.data.data.isActive);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.put('/api/v1/admin/settings', {
        email,
        phoneNumber,
        isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        alert('Configurations saved successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-slate-400" />
          <span>Global Settings</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">Configure global application variables, customer support details, and maintenance toggles.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Customer Support Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Support Helpline Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none"
            required
          />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-slate-700 block">App Online Mode</span>
            <span className="text-xs text-slate-400">If disabled, mobile users will see a maintenance message.</span>
          </div>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-5 w-5 text-emerald-500 rounded border-slate-200 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-400 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving Settings...' : 'Save System Configuration'}</span>
        </button>
      </form>
    </div>
  );
};

export default Settings;
