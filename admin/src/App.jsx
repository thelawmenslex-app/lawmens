import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Books from './pages/Books';
import Content from './pages/Content';
import PromoOffers from './pages/PromoOffers';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout Wrapper for Admin Portal
const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Navigation Sidebar */}
      <Sidebar />
      
      {/* Main Content Pane */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <AdminLayout>
              <Users />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute>
            <AdminLayout>
              <Payments />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/books" element={
          <ProtectedRoute>
            <AdminLayout>
              <Books />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/content" element={
          <ProtectedRoute>
            <AdminLayout>
              <Content />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/offers" element={
          <ProtectedRoute>
            <AdminLayout>
              <PromoOffers />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <AdminLayout>
              <Notifications />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AdminLayout>
              <Settings />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/logs" element={
          <ProtectedRoute>
            <AdminLayout>
              <AuditLogs />
            </AdminLayout>
          </ProtectedRoute>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
