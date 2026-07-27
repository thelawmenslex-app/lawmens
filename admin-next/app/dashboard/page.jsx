"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  Library, 
  Activity, 
  FileCode,
  ShieldCheck
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('/api/v1/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.status) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-sm text-red-500">
        {error}
      </div>
    );
  }

  const getNum = (val) => {
    if (!val) return 0;
    if (typeof val === 'object') {
      if (val.$numberLong) return Number(val.$numberLong);
      if (val.$numberInt) return Number(val.$numberInt);
      if (val.$numberDouble) return Number(val.$numberDouble);
    }
    return Number(val) || 0;
  };

  const stats = [
    { name: 'Total Users', value: getNum(data?.totalUsers), icon: Users, color: 'bg-blue-500' },
    { name: 'Active Users (7 Days)', value: getNum(data?.activeUsers7Days), icon: UserCheck, color: 'bg-emerald-500' },
    { name: 'Premium Subscribers', value: getNum(data?.premiumUsers), icon: DollarSign, color: 'bg-amber-500' },
    { name: 'Trial Accounts', value: getNum(data?.trialUsers), icon: Activity, color: 'bg-purple-500' },
    { name: 'Total Law Books', value: getNum(data?.totalBooks), icon: Library, color: 'bg-cyan-500' },
    { name: 'Total Sections/Laws', value: getNum(data?.totalLaws), icon: FileCode, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-slate-900 p-6 text-white border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-12 -translate-y-12">
          <ShieldCheck className="h-72 w-72" />
        </div>
        <h2 className="text-xl font-bold">Welcome Back to Administrative Operations</h2>
        <p className="text-sm text-slate-400 mt-1">Real-time status check: System is fully operational. Server responding within normal bounds.</p>
        
        <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-300">
          <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">API: {data?.system?.apiStatus}</span>
          <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">Host: LocalNodeJS</span>
          <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">Active Offers: {data?.activeOffers || 0}</span>
        </div>
      </div>

      {/* Grid of basic stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="flex items-center justify-between rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.name}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1.5">{stat.value.toLocaleString()}</h3>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown Details Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Profession Breakdown Grid */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">User Demographics by Profession</h3>
          <div className="space-y-4">
            {data?.professionBreakdown?.map((prof, i) => (
              <div key={prof.profession || i} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">{prof.profession || 'Default User'}</span>
                <div className="flex items-center gap-4 flex-1 justify-end ml-4">
                  <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (getNum(prof.count) / (getNum(data.totalUsers) || 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-slate-800 w-8 text-right">{getNum(prof.count)}</span>
                </div>
              </div>
            ))}
            {(!data?.professionBreakdown || data.professionBreakdown.length === 0) && (
              <p className="text-sm text-slate-400">No demographics registered yet.</p>
            )}
          </div>
        </div>

        {/* Server & Engine metrics */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">API Engine Operational Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-600">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Server Mode</span>
              <span className="font-bold text-slate-800">Production Mode</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Uptime Duration</span>
              <span className="font-bold text-slate-800">{(data?.system?.uptime / 3600 || 0).toFixed(2)} Hours</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Node CPU load</span>
              <span className="font-bold text-slate-800">{data?.system?.cpuLoad}%</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Memory Footprint</span>
              <span className="font-bold text-slate-800">{(data?.system?.memoryUsage?.rss / (1024 * 1024) || 0).toFixed(1)} MB</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
