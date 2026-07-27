"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Calendar, PlusCircle, CheckCircle, Ban, X, DollarSign } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Manual Grant Form State
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

  const token = localStorage.getItem('adminToken');

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/admin/payments`, {
        params: { page, limit: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setPayments(response.data.data.payments);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(response.data.data.currentPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/v1/subscription', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setPlans(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayments(1);
    fetchPlans();
  }, []);

  const handleManualGrant = async (e) => {
    e.preventDefault();
    if (!targetUserId) return;

    try {
      const response = await axios.post('/api/v1/admin/payments/manual', {
        userId: targetUserId,
        planId: selectedPlanId || null,
        validityDays: Number(validityDays)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status) {
        alert('Subscription granted successfully!');
        setIsGrantModalOpen(false);
        setTargetUserId('');
        setSelectedPlanId('');
        fetchPayments(currentPage);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grant subscription.');
    }
  };

  const handleCancelSubscription = async (userId) => {
    if (!window.confirm('Are you sure you want to revoke/cancel this subscription?')) return;
    try {
      const response = await axios.put('/api/v1/admin/payments/cancel', { userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        fetchPayments(currentPage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getNum = (val) => {
    if (!val) return 0;
    if (typeof val === 'object') {
      if (val.$numberLong) return Number(val.$numberLong);
      if (val.$numberInt) return Number(val.$numberInt);
    }
    return Number(val) || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header action panel */}
      <div className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Revenue Operations</h3>
          <p className="text-xs text-slate-400 mt-1">Manage active premium subscription licenses and payment allocations.</p>
        </div>
        <button
          onClick={() => setIsGrantModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/10"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Allocate Manual Plan</span>
        </button>
      </div>

      {/* Payments Logs List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Plan Selected</th>
                <th className="px-6 py-4">Allocated Validity</th>
                <th className="px-6 py-4">Purchased On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{payment._id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700">{payment.userId?.firstName} {payment.userId?.lastName}</p>
                    <p className="text-xs text-slate-400">{payment.userId?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-800 font-semibold">{payment.plan?.name || 'Manual License'}</p>
                    <p className="text-xs text-emerald-500">₹{getNum(payment.plan?.price)}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getNum(payment.plan?.validity)} Days
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    {new Date(payment.purchasedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {payment.isActive ? (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Active</span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1"><Ban className="h-4 w-4" /> Expired</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payment.isActive && (
                      <button 
                        onClick={() => handleCancelSubscription(payment.userId?._id)} 
                        className="text-red-500 hover:text-red-700 text-xs font-bold focus:outline-none"
                      >
                        Cancel Plan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                    No transactions or payment logs registered in the database.
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
              onClick={() => fetchPayments(currentPage - 1)}
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-slate-500">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => fetchPayments(currentPage + 1)}
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Manual Allocation Dialog */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <form onSubmit={handleManualGrant} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative border border-slate-100 space-y-4">
            <button type="button" onClick={() => setIsGrantModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Allocate Premium Plan Manually</h3>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Target User ID</label>
              <input
                type="text"
                placeholder="668448a2aef3cbe00ef77b16"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Reference Plan</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none"
              >
                <option value="">Custom License (No reference plan)</option>
                {plans.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (₹{getNum(p.price)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">License Validity (Days)</label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                min="1"
                required
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-400"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Grant Subscription License</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Payments;
