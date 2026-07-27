import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Server } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  // Convert current path to page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview Dashboard';
    if (path === '/users') return 'User Directory';
    if (path === '/payments') return 'Subscriptions & Bills';
    if (path === '/books') return 'Import Legal Books';
    if (path === '/content') return 'Legal Content Editor';
    if (path === '/offers') return 'Campaigns & Coupons';
    if (path === '/notifications') return 'Notification Broadcasts';
    if (path === '/settings') return 'Global System Configurations';
    if (path === '/logs') return 'Audit & Security Logs';
    return 'Admin Console';
  };

  return (
    <header className="flex h-20 items-center justify-between px-8 border-b border-slate-200 bg-white">
      {/* Dynamic page title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">{getPageTitle()}</h1>
        <p className="text-xs text-slate-400 mt-1">Enterprise Admin Panel</p>
      </div>

      {/* System status metrics & info */}
      <div className="flex items-center gap-6">
        {/* System Health Badge */}
        <div className="hidden items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 md:flex">
          <Server className="h-4 w-4 text-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">API Status: Operational</span>
        </div>

        {/* User Role Badge */}
        <div className="flex items-center gap-2 border-l pl-6 border-slate-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-700 leading-none">{user.firstName} {user.lastName}</p>
            <span className="text-[10px] font-medium text-slate-400 capitalize">{user.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
