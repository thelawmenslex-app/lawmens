"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Server, Menu } from 'lucide-react';

const Header = ({ onOpenSidebar }) => {
  const pathname = usePathname();
  
  let user = {};
  if (typeof window !== 'undefined') {
    user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  }

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Overview Dashboard';
    if (pathname === '/users') return 'User Directory';
    if (pathname === '/payments') return 'Subscriptions & Bills';
    if (pathname === '/books') return 'Import Legal Books';
    if (pathname === '/content') return 'Legal Content Editor';
    if (pathname === '/offers') return 'Campaigns & Coupons';
    if (pathname === '/notifications') return 'Notification Broadcasts';
    if (pathname === '/settings') return 'Global System Configurations';
    if (pathname === '/logs') return 'Audit & Security Logs';
    return 'Admin Console';
  };

  return (
    <header className="flex h-20 items-center justify-between px-6 md:px-8 border-b-2 border-white bg-[#EBF8FE] shadow-[0_4px_10px_#a9c7d6]">
      {/* Mobile hamburger & Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenSidebar}
          className="md:hidden text-slate-600 hover:text-[#25AAE2] focus:outline-none p-1 rounded-lg hover:bg-[#d5ebf7]"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight leading-none">{getPageTitle()}</h1>
          <p className="text-[10px] md:text-xs font-medium text-[#25AAE2] mt-1">THE-LAWMEN'S Enterprise Console</p>
        </div>
      </div>

      {/* System status metrics & info */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* System Health Badge */}
        <div className="hidden items-center gap-2 rounded-xl bg-[#EBF8FE] border-2 border-white px-3.5 py-1.5 md:flex shadow-[2px_2px_5px_#a9c7d6,-2px_-2px_5px_#ffffff]">
          <Server className="h-4 w-4 text-[#25AAE2] animate-pulse" />
          <span className="text-xs font-bold text-slate-700">API Status: Operational</span>
        </div>

        {/* User Role Badge */}
        <div className="flex items-center gap-2 border-l-2 pl-4 md:pl-6 border-[#c6deeb]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF8FE] border-2 border-white text-[#25AAE2] shadow-[2px_2px_5px_#a9c7d6,-2px_-2px_5px_#ffffff]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-extrabold text-slate-800 leading-none">{user.firstName || 'Admin'} {user.lastName || 'System'}</p>
            <span className="text-[10px] font-semibold text-[#25AAE2] capitalize">{user.role || 'Super Admin'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
