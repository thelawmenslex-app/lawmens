"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BookOpen, 
  FileText, 
  Percent, 
  Bell, 
  Settings, 
  ShieldAlert,
  LogOut,
  Scale,
  X,
  ClipboardList,
  FormInput,
  MessageSquare,
  Tag
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  // Use client-safe JSON parsing
  let user = {};
  if (typeof window !== 'undefined') {
    user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.replace('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Signup Builder', path: '/signup-config', icon: FormInput },
    { name: 'User Queries', path: '/queries', icon: MessageSquare },
    { name: 'Subscription Plans', path: '/plans', icon: Tag },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Import Books', path: '/books', icon: BookOpen },
    { name: 'Content CRUD', path: '/content', icon: FileText },
    { name: 'Schedules CRUD', path: '/schedules', icon: ClipboardList },
    { name: 'Minor Acts CRUD', path: '/minor-acts', icon: FileText },
    { name: 'Offers & Promos', path: '/offers', icon: Percent },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'App Settings', path: '/settings', icon: Settings },
    { name: 'Audit Logs', path: '/logs', icon: ShieldAlert, roles: ['Super Admin'] },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#EBF8FE] border-r-2 border-white text-slate-700 shadow-[4px_0_15px_#a9c7d6] transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Brand logo & header */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-[#c6deeb]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#EBF8FE] border-2 border-white overflow-hidden flex items-center justify-center p-1 shadow-[3px_3px_6px_#a9c7d6,-3px_-3px_6px_#ffffff]">
            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <span className="font-sans font-extrabold text-base text-[#25AAE2] tracking-wider">THE-LAWMEN'S</span>
        </div>
        {/* Mobile close button */}
        <button onClick={onClose} className="md:hidden text-slate-500 hover:text-slate-800">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
        {navItems.map((item) => {
          if (item.roles && !item.roles.includes(user.role)) return null;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-[#25AAE2] text-white shadow-[3px_3px_8px_#a9c7d6,-3px_-3px_8px_#ffffff]' 
                  : 'text-slate-600 hover:bg-[#d5ebf7] hover:text-[#25AAE2]'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#25AAE2]'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin details footer */}
      <div className="p-4 border-t border-[#c6deeb] bg-[#EBF8FE]">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{user.firstName || 'Admin'} {user.lastName || 'System'}</p>
            <p className="text-xs font-medium text-[#25AAE2] truncate">{user.role || 'Super Admin'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EBF8FE] border border-[#c6deeb] px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-rose-500 hover:text-white transition-all shadow-[2px_2px_5px_#a9c7d6,-2px_-2px_5px_#ffffff]"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
