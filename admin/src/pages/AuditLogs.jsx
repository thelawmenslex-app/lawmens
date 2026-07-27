import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Calendar, Info, Search } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('adminToken');

  const fetchAuditLogs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/admin/audit-logs', {
        params: { page, limit: 20 },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setLogs(response.data.data.logs);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(response.data.data.currentPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="flex items-center gap-4 bg-red-50 border border-red-150 p-5 rounded-xl text-red-950">
        <ShieldCheck className="h-10 w-10 text-red-600 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold">Administrative Security Audit Console</h4>
          <p className="text-xs text-red-700/80 mt-0.5">Strictly for Super Admin eyes only. Every backend write action, configuration override, and user deletion is immutable and logged below.</p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Administrator</th>
                <th className="px-6 py-4">Action Event</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{log.userId?.firstName} {log.userId?.lastName}</p>
                    <p className="text-xs text-slate-400 font-medium">{log.userId?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 border text-slate-700 font-mono uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-normal">
                    <pre className="bg-slate-50 p-2 border border-slate-100 rounded-lg max-w-sm overflow-x-auto font-mono text-[10px]">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    No administrative audit logs captured yet.
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
              disabled={currentPage === 1}
              onClick={() => fetchAuditLogs(currentPage - 1)}
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-slate-500">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => fetchAuditLogs(currentPage + 1)}
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
