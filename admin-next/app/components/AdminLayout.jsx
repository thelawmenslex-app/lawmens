"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from 'axios';

// Recursive helper to clean Extended JSON format
function sanitizeData(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'object') {
    if ('$numberLong' in obj) {
      return Number(obj.$numberLong);
    }
    if ('$numberInt' in obj) {
      return Number(obj.$numberInt);
    }
    if ('$numberDouble' in obj) {
      return Number(obj.$numberDouble);
    }
    if ('$numberDecimal' in obj) {
      return Number(obj.$numberDecimal);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeData);
    } else {
      const result = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result[key] = sanitizeData(obj[key]);
        }
      }
      return result;
    }
  }
  return obj;
}

// Global Axios Interceptor to prevent Extended JSON child rendering crashes
if (typeof window !== 'undefined') {
  axios.interceptors.response.use((response) => {
    if (response.data) {
      response.data = sanitizeData(response.data);
    }
    return response;
  }, (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  });
}

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('adminToken');
    if (!token && pathname !== '/login') {
      router.replace('/login');
    }
  }, [pathname, router]);

  // Close sidebar drawer on route changes (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (!isClient) return null;

  if (pathname === '/login') {
    return <div className="h-screen w-screen">{children}</div>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Sidebar Nav Drawer */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Overlay background for mobile sidebar drawer */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main pane */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
