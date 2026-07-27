"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Save, User, Key, CheckCircle2, AlertCircle } from 'lucide-react';

const Settings = () => {
  // Global settings state
  const [supportEmail, setSupportEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [globalMsg, setGlobalMsg] = useState({ type: '', text: '' });

  // Self Profile state
  const [adminProfile, setAdminProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setAdminProfile((prev) => ({
          ...prev,
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || ''
        }));
      } catch (err) {}
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setSupportEmail(response.data.data.email || '');
        setPhoneNumber(response.data.data.phoneNumber || '');
        setIsActive(response.data.data.isActive ?? true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGlobal = async (e) => {
    e.preventDefault();
    setSavingGlobal(true);
    setGlobalMsg({ type: '', text: '' });
    try {
      const response = await axios.put('/api/v1/admin/settings', {
        email: supportEmail,
        phoneNumber,
        isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setGlobalMsg({ type: 'success', text: 'Global application configurations saved successfully!' });
      }
    } catch (err) {
      setGlobalMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save settings.' });
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleUpdateSelfProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });

    if (adminProfile.newPassword && adminProfile.newPassword !== adminProfile.confirmPassword) {
      setProfileMsg({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setSavingProfile(true);
    try {
      const res = await axios.put('/api/v1/admin/self-profile', {
        firstName: adminProfile.firstName,
        lastName: adminProfile.lastName,
        email: adminProfile.email,
        currentPassword: adminProfile.currentPassword,
        newPassword: adminProfile.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status) {
        setProfileMsg({ type: 'success', text: 'Your admin profile and credentials have been updated!' });
        const updated = res.data.data;
        localStorage.setItem('adminUser', JSON.stringify(updated));
        setAdminProfile((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#25AAE2] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="neu-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="neu-card p-3 rounded-2xl text-[#25AAE2]">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">Admin Account & App Settings</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Manage your credentials, change password, and configure global system variables.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: My Admin Profile & Credentials */}
        <div className="neu-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#c6deeb]">
            <User className="h-5 w-5 text-[#25AAE2]" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">My Admin Profile & Login Credentials</h2>
          </div>

          {profileMsg.text && (
            <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold border ${
              profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              {profileMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateSelfProfile} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={adminProfile.firstName}
                  onChange={(e) => setAdminProfile({ ...adminProfile, firstName: e.target.value })}
                  className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={adminProfile.lastName}
                  onChange={(e) => setAdminProfile({ ...adminProfile, lastName: e.target.value })}
                  className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email / Admin Username</label>
              <input
                type="email"
                required
                value={adminProfile.email}
                onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
              />
            </div>

            <div className="pt-2 border-t border-[#c6deeb] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <Key className="h-3.5 w-3.5 text-[#25AAE2]" />
                <span>Change Admin Password (Optional)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="Required only if changing password"
                  value={adminProfile.currentPassword}
                  onChange={(e) => setAdminProfile({ ...adminProfile, currentPassword: e.target.value })}
                  className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="New password"
                    value={adminProfile.newPassword}
                    onChange={(e) => setAdminProfile({ ...adminProfile, newPassword: e.target.value })}
                    className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={adminProfile.confirmPassword}
                    onChange={(e) => setAdminProfile({ ...adminProfile, confirmPassword: e.target.value })}
                    className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={savingProfile}
                className="neu-btn w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{savingProfile ? 'Updating Profile...' : 'Update Admin Credentials'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Global App Configurations */}
        <div className="neu-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#c6deeb]">
            <SettingsIcon className="h-5 w-5 text-[#25AAE2]" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Global App Configurations</h2>
          </div>

          {globalMsg.text && (
            <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold border ${
              globalMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              {globalMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
              <span>{globalMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveGlobal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Support Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
              />
            </div>

            <div className="neu-card p-4 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Application Status</h3>
                <p className="text-[11px] text-slate-500">Toggle operational availability for mobile clients.</p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 text-[#25AAE2] rounded border-slate-300 focus:ring-[#25AAE2]"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={savingGlobal}
                className="neu-btn w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{savingGlobal ? 'Saving Settings...' : 'Save Global Configurations'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
