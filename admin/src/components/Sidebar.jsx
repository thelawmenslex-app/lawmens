import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Scale
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Import Books', path: '/books', icon: BookOpen },
    { name: 'Content CRUD', path: '/content', icon: FileText },
    { name: 'Offers & Promos', path: '/offers', icon: Percent },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'App Settings', path: '/settings', icon: Settings },
    { name: 'Audit Logs', path: '/logs', icon: ShieldAlert, roles: ['Super Admin'] },
  ];

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900 text-slate-300">
      {/* Brand logo & header */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-emerald-400" />
          <span className="font-sans font-bold text-lg text-white tracking-wider">THE-LAWMEN'S</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navItems.map((item) => {
          // Role checking
          if (item.roles && !item.roles.includes(user.role)) return null;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Admin details footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between mb-4">
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-slate-400 truncate">{user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
