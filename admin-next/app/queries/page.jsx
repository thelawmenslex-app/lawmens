"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Search, Filter, Send, Clock, CheckCircle2, User, Mail, Phone, RefreshCw } from 'lucide-react';

const QueriesPage = () => {
  const [queries, setQueries] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/admin/queries?status=${filterStatus}&search=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status) {
        setQueries(res.data.data.queries);
        setPendingCount(res.data.data.pendingCount);
        if (selectedQuery) {
          const updatedSelected = res.data.data.queries.find(q => q._id === selectedQuery._id);
          if (updatedSelected) setSelectedQuery(updatedSelected);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQueries();
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedQuery || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await axios.post(`/api/v1/admin/queries/${selectedQuery._id}/reply`, {
        adminReply: replyText.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status) {
        setReplyText('');
        fetchQueries();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="neu-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#25AAE2]/10 rounded-xl border border-[#25AAE2]/20 text-[#25AAE2]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">User Queries & Support Desk</h1>
          </div>
          <p className="text-sm text-slate-600 pl-11">
            View, filter, and reply to user questions and legal inquiries submitted from the mobile app.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-800 px-4 py-2 rounded-xl text-sm font-bold">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>{pendingCount} Pending Query{pendingCount > 1 ? 'ies' : ''}</span>
            </div>
          )}
          <button
            onClick={fetchQueries}
            className="neu-btn-secondary p-2.5 text-slate-700 hover:text-[#25AAE2] transition-all rounded-xl"
            title="Refresh Queries"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="neu-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search queries by subject, question, user email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full neu-input pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-600">Status:</span>
          <div className="flex items-center gap-1 bg-[#EBF8FE] p-1 rounded-xl border border-[#c6deeb]">
            {['All', 'Pending', 'Answered'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterStatus === status ? 'bg-[#25AAE2] text-white shadow' : 'text-slate-600 hover:text-[#25AAE2]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Queries List vs Selected Query Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* List Column */}
        <div className="lg:col-span-5 neu-card flex flex-col max-h-[650px] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#c6deeb] flex items-center justify-between">
            <h2 className="text-md font-bold text-slate-800">Submitted Queries</h2>
            <span className="text-xs font-bold text-slate-500">{queries.length} Queries</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#c6deeb] p-3 space-y-2">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading queries...</div>
            ) : queries.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm font-medium">No queries match your search filter.</div>
            ) : (
              queries.map((q) => {
                const isSelected = selectedQuery && selectedQuery._id === q._id;
                const isPending = q.status === 'Pending';
                return (
                  <div
                    key={q._id}
                    onClick={() => setSelectedQuery(q)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#d2ebf7] border-[#25AAE2] shadow-sm'
                        : 'neu-card hover:bg-[#e4f3fa] border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-1 flex-1 pr-2">{q.subject}</h3>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {q.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">{q.question}</p>
                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 pt-1 border-t border-[#c6deeb]/50">
                      <span className="font-bold text-[#25AAE2] truncate max-w-[150px]">{q.userName || 'App User'}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Query Detail Column */}
        <div className="lg:col-span-7 neu-card p-6 flex flex-col justify-between max-h-[650px] overflow-y-auto">
          {selectedQuery ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-[#c6deeb] gap-2">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-800">{selectedQuery.subject}</h2>
                    <span className="text-xs text-slate-500">Submitted on {new Date(selectedQuery.createdAt).toLocaleString()}</span>
                  </div>
                  <span className={`self-start sm:self-auto text-xs font-extrabold px-3 py-1 rounded-full border ${
                    selectedQuery.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {selectedQuery.status}
                  </span>
                </div>

                {/* User Context Card */}
                <div className="neu-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="h-4 w-4 text-[#25AAE2] flex-shrink-0" />
                    <span className="truncate">{selectedQuery.userName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="h-4 w-4 text-[#25AAE2] flex-shrink-0" />
                    <span className="truncate">{selectedQuery.userEmail || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="h-4 w-4 text-[#25AAE2] flex-shrink-0" />
                    <span className="truncate">{selectedQuery.phoneNumber || 'N/A'}</span>
                  </div>
                </div>

                {/* Question Content Box */}
                <div className="space-y-1.5">
                  <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">User Question</span>
                  <div className="neu-input p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {selectedQuery.question}
                  </div>
                </div>

                {/* Existing Admin Reply Box */}
                {selectedQuery.adminReply && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-emerald-700 tracking-wider">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Admin Response ({new Date(selectedQuery.repliedAt).toLocaleDateString()})</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap">
                      {selectedQuery.adminReply}
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-[#c6deeb] space-y-3">
                <label className="text-xs font-bold text-slate-700 block">Post Reply to User</label>
                <textarea
                  rows={3}
                  placeholder="Type your response to the user query..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full neu-input p-3.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="neu-btn flex items-center gap-2 px-5 py-2.5 disabled:opacity-50 text-sm"
                  >
                    <Send className="h-4 w-4" />
                    <span>{sendingReply ? 'Posting Reply...' : 'Send Response'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center py-20 space-y-2">
              <MessageSquare className="h-10 w-10 opacity-40 text-[#25AAE2]" />
              <p className="text-sm font-semibold">Select a user query from the list to view details and post a reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueriesPage;
