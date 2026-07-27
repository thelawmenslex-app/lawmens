"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Shield, Search, RefreshCw } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const token = localStorage.getItem('adminToken');

  const fetchLogs = async (p = 1) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/admin/audit-logs', {
        params: { page: p, limit: 15, action: actionFilter },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setLogs(response.data.data.logs);
        setTotalPages(response.data.data.totalPages);
        setPage(response.data.data.currentPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter]);

  const getActionBadgeClass = (action) => {
    if (action.includes('delete') || action.includes('cancel')) return 'bg-red-50 text-red-700 border-red-100';
    if (action.includes('create') || action.includes('manual')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (action.includes('update') || action.includes('edit')) return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Filters toolbar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">Audit Actions Filter</span>
        </div>
        
        <div className="flex gap-4">
          <select 
            value={actionFilter} 
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm bg-white focus:outline-none"
          >
            <option value="">All Operations</option>
            <option value="create_promo_code">Create Promo Code</option>
            <option value="delete_promo_code">Delete Promo Code</option>
            <option value="create_category">Create Category</option>
            <option value="edit_category">Edit Category</option>
            <option value="delete_category">Delete Category</option>
            <option value="create_chapter">Create Chapter</option>
            <option value="edit_chapter">Edit Chapter</option>
            <option value="delete_chapter">Delete Chapter</option>
            <option value="create_section">Create Section</option>
            <option value="edit_section">Edit Section</option>
            <option value="delete_section">Delete Section</option>
            <option value="manual_grant_subscription">Manual Subscription Allocation</option>
            <option value="cancel_subscription">Revoke Subscription License</option>
            <option value="send_push_notification">Send Push Broadcast</option>
            <option value="save_settings">Update Global Settings</option>
          </select>

          <button 
            onClick={() => fetchLogs(page)} 
            className="flex items-center gap-1.5 px-4 py-2 border rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-600"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Log list table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Trigger Date / Time</th>
                <th className="px-6 py-4">Admin Operator</th>
                <th className="px-6 py-4">Security Role</th>
                <th className="px-6 py-4">Action Type</th>
                <th className="px-6 py-4">Action Details</th>
                <th className="px-6 py-4">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{log.userId?.firstName} {log.userId?.lastName}</p>
                    <p className="text-xs text-slate-400">{log.userId?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-500">{log.userId?.role || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 border rounded-full text-xs font-bold ${getActionBadgeClass(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-xs text-slate-500 font-mono" title={JSON.stringify(log.details)}>
                    {JSON.stringify(log.details)}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-semibold font-mono">
                    {log.ipAddress || 'Unknown'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No security audit logs match the criteria in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
            <button
              disabled={page === 1}
              onClick={() => fetchLogs(page - 1)}
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-slate-500">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => fetchLogs(page + 1)}
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
