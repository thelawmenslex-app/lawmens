"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, PlusCircle, CheckCircle, Ban, X, Edit, Save, Zap } from 'lucide-react';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    planType: 'monthly',
    productId: 'com.thelawmens.monthly',
    googlePlaySku: 'com.thelawmens.monthly',
    validity: 30,
    price: 199,
    strikePrice: 399,
    offerText: 'SPECIAL OFFER • 50% OFF',
    discount: 50,
    description: '',
    features: ['Access all 125+ Law Books', 'Side-by-Side BNS vs IPC', 'Full Offline Reading'],
    isActive: true
  });

  const [token, setToken] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('adminToken');
      setToken(storedToken || '');
    }
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('adminToken');
      const response = await axios.get('/api/v1/admin/subscriptions', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.data.status) {
        setPlans(response.data.data);
      }
    } catch (err) {
      console.error('Fetch plans error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPlans();
    }
  }, [token]);

  const handleOpenCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      planType: 'monthly',
      productId: 'com.thelawmens.monthly',
      googlePlaySku: 'com.thelawmens.monthly',
      validity: 30,
      price: 199,
      strikePrice: 399,
      offerText: 'SPECIAL OFFER • 50% OFF',
      discount: 50,
      description: '',
      features: ['Access all 125+ Law Books', 'Side-by-Side BNS vs IPC', 'Full Offline Reading'],
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      planType: plan.planType || 'monthly',
      productId: plan.productId || '',
      googlePlaySku: plan.googlePlaySku || '',
      validity: plan.validity || 30,
      price: plan.price || 0,
      strikePrice: plan.strikePrice || 0,
      offerText: plan.offerText || '',
      discount: plan.discount || 0,
      description: plan.description || '',
      features: plan.features && plan.features.length > 0 ? plan.features : [],
      isActive: plan.isActive ?? true
    });
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      const authToken = localStorage.getItem('adminToken');
      if (editingPlan) {
        // Update existing plan
        const response = await axios.put(`/api/v1/admin/subscriptions/${editingPlan._id}`, formData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (response.data.status) {
          alert('Subscription plan updated successfully!');
        }
      } else {
        // Create new plan
        const response = await axios.post('/api/v1/admin/subscriptions', formData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (response.data.status) {
          alert('Subscription plan created successfully!');
        }
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save subscription plan.');
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      const authToken = localStorage.getItem('adminToken');
      await axios.put(`/api/v1/admin/subscriptions/${plan._id}`, { isActive: !plan.isActive }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex justify-between items-center bg-[#EBF8FE] border border-[#c6deeb] p-6 rounded-2xl shadow-[4px_4px_10px_#a9c7d6,-4px_-4px_10px_#ffffff]">
        <div>
          <h3 className="text-base font-extrabold text-[#25AAE2] uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#25AAE2]" />
            <span>Subscription Plans Module</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Configure monthly & yearly subscription packages, selling prices, strikethrough prices, and exclusive offer badges.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 rounded-xl bg-[#25AAE2] hover:bg-[#1d93c7] px-5 py-3 text-sm font-bold text-white shadow-[3px_3px_8px_#a9c7d6,-3px_-3px_8px_#ffffff]"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add New Package</span>
        </button>
      </div>

      {/* Plans List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isYearly = plan.planType === 'yearly' || plan.validity > 100;

          return (
            <div 
              key={plan._id} 
              className={`rounded-2xl border bg-[#EBF8FE] p-6 flex flex-col justify-between relative shadow-[4px_4px_10px_#a9c7d6,-4px_-4px_10px_#ffffff] transition-all ${
                plan.isActive ? 'border-[#c6deeb]' : 'border-slate-300 opacity-60'
              }`}
            >
              <div>
                {/* Offer Badge Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full ${
                    isYearly ? 'bg-cyan-500 text-white' : 'bg-[#25AAE2] text-white'
                  }`}>
                    {isYearly ? 'Yearly Pass' : 'Monthly Pass'}
                  </span>

                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                      plan.isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {plan.isActive ? <CheckCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                    <span>{plan.isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>

                {/* Offer Text Badge */}
                {plan.offerText && (
                  <div className="bg-[#25AAE2]/10 border border-[#25AAE2]/30 text-[#25AAE2] text-xs font-bold px-3 py-1.5 rounded-lg mb-3">
                    {plan.offerText}
                  </div>
                )}

                {/* Plan Name & Pricing */}
                <h4 className="text-lg font-bold text-slate-800">{plan.name}</h4>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-extrabold text-[#25AAE2]">₹{plan.price}</span>
                  {plan.strikePrice > 0 && (
                    <span className="text-sm font-medium text-slate-400 line-through">₹{plan.strikePrice}</span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">/ {isYearly ? 'year' : 'month'}</span>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{plan.description}</p>

                {/* Features List */}
                {plan.features && plan.features.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#c6deeb] space-y-2">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center text-xs font-medium text-slate-700 gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-[#c6deeb] flex items-center gap-3">
                <button
                  onClick={() => handleOpenEditModal(plan)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-[#c6deeb] py-2.5 text-xs font-bold text-slate-700 hover:bg-[#d5ebf7] shadow-[2px_2px_5px_#a9c7d6]"
                >
                  <Edit className="h-4 w-4 text-[#25AAE2]" />
                  <span>Edit Package</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 overflow-y-auto">
          <form onSubmit={handleSavePlan} className="w-full max-w-lg rounded-2xl bg-[#EBF8FE] p-6 shadow-2xl relative border-2 border-white space-y-4 my-8">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-extrabold text-[#25AAE2] mb-2">
              {editingPlan ? 'Edit Subscription Package' : 'Create Subscription Package'}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Package Title</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Monthly Premium Pass"
                className="w-full rounded-xl border border-[#c6deeb] bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Plan Type</label>
                <select
                  value={formData.planType}
                  onChange={(e) => setFormData({ ...formData, planType: e.target.value, validity: e.target.value === 'yearly' ? 365 : 30 })}
                  className="w-full rounded-xl border border-[#c6deeb] bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="monthly">Monthly Pass (30 Days)</option>
                  <option value="yearly">Yearly Pass (365 Days)</option>
                  <option value="lifetime">Lifetime</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Validity (Days)</label>
                <input
                  type="number"
                  value={formData.validity}
                  onChange={(e) => setFormData({ ...formData, validity: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#c6deeb] bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#c6deeb] bg-white px-3 py-2 text-sm font-bold text-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Strike Price (~~₹~~)</label>
                <input
                  type="number"
                  value={formData.strikePrice}
                  onChange={(e) => setFormData({ ...formData, strikePrice: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#c6deeb] bg-white px-3 py-2 text-sm font-bold text-slate-400 focus:outline-none"
                  placeholder="Original Price"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Exclusive Offer Text Badge</label>
              <input
                type="text"
                value={formData.offerText}
                onChange={(e) => setFormData({ ...formData, offerText: e.target.value })}
                placeholder="e.g. 🔥 MOST POPULAR • SAVE 50%"
                className="w-full rounded-xl border border-[#c6deeb] bg-white px-3 py-2 text-sm font-semibold text-[#25AAE2] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Google Play SKU / Product ID</label>
              <input
                type="text"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value, googlePlaySku: e.target.value })}
                placeholder="com.thelawmens.monthly"
                className="w-full rounded-xl border border-[#c6deeb] bg-white px-3 py-2 text-xs text-slate-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Package Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                placeholder="Brief summary of plan benefits"
                className="w-full rounded-xl border border-[#c6deeb] bg-white px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Features (One per line)</label>
              <textarea
                value={Array.isArray(formData.features) ? formData.features.join('\n') : ''}
                onChange={(e) => setFormData({ ...formData, features: e.target.value.split('\n').filter(Boolean) })}
                rows="3"
                placeholder="Access all 125+ Law Books&#10;Side-by-Side BNS vs IPC&#10;Full Offline Reading"
                className="w-full rounded-xl border border-[#c6deeb] bg-white px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25AAE2] py-3 text-sm font-bold text-white shadow-md shadow-[#25AAE2]/20 hover:bg-[#1d93c7]"
            >
              <Save className="h-4 w-4" />
              <span>Save Subscription Package</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
