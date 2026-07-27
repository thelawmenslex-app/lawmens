import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Percent, Ticket, PlusCircle, Trash2, Calendar, CheckCircle2, AlertTriangle, X, Save } from 'lucide-react';

const PromoOffers = () => {
  const [offers, setOffers] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [activeTab, setActiveTab] = useState('offers');

  // Form State - Offer
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDesc, setOfferDesc] = useState('');
  const [offerType, setOfferType] = useState('general');
  const [offerDiscountType, setOfferDiscountType] = useState('flat');
  const [offerDiscountVal, setOfferDiscountVal] = useState('');
  const [offerStart, setOfferStart] = useState('');
  const [offerEnd, setOfferEnd] = useState('');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Form State - Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState('percentage');
  const [promoDiscountVal, setPromoDiscountVal] = useState('');
  const [promoExpiry, setPromoExpiry] = useState('');
  const [promoUsageLimit, setPromoUsageLimit] = useState(0);
  const [promoMinPurchase, setPromoMinPurchase] = useState(0);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const token = localStorage.getItem('adminToken');

  const fetchOffers = async () => {
    try {
      const response = await axios.get('/api/v1/admin/offers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setOffers(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const response = await axios.get('/api/v1/admin/promo-codes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setPromoCodes(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchPromoCodes();
  }, []);

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/v1/admin/offers', {
        title: offerTitle,
        description: offerDesc,
        offerType,
        discountType: offerDiscountType,
        discountValue: Number(offerDiscountVal),
        startDate: offerStart,
        endDate: offerEnd
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status) {
        setIsOfferModalOpen(false);
        setOfferTitle('');
        setOfferDesc('');
        setOfferDiscountVal('');
        fetchOffers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Delete this campaign offer?')) return;
    try {
      const response = await axios.delete(`/api/v1/admin/offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        fetchOffers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/v1/admin/promo-codes', {
        code: promoCode,
        discountType: promoDiscountType,
        discountValue: Number(promoDiscountVal),
        expiryDate: promoExpiry,
        usageLimit: Number(promoUsageLimit),
        minPurchaseAmount: Number(promoMinPurchase)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status) {
        setIsPromoModalOpen(false);
        setPromoCode('');
        setPromoDiscountVal('');
        setPromoExpiry('');
        fetchPromoCodes();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create promo code.');
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    try {
      const response = await axios.delete(`/api/v1/admin/promo-codes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        fetchPromoCodes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs selector */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('offers')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-150 focus:outline-none ${
            activeTab === 'offers' 
              ? 'border-emerald-500 text-emerald-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Percent className="h-5 w-5" />
          <span>Offers & Campaigns</span>
        </button>

        <button
          onClick={() => setActiveTab('promos')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-150 focus:outline-none ${
            activeTab === 'promos' 
              ? 'border-emerald-500 text-emerald-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Ticket className="h-5 w-5" />
          <span>Promo Coupons</span>
        </button>
      </div>

      {/* 1. OFFERS TAB CONTENT */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Promotional Banners & Deals</h3>
              <p className="text-xs text-slate-400 mt-1">Create banner ads and discount campaigns for mobile home views.</p>
            </div>
            <button
              onClick={() => setIsOfferModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/10"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Create Campaign Offer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((off) => (
              <div key={off._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{off.offerType} Offer</span>
                    <button onClick={() => handleDeleteOffer(off._id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mt-1">{off.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1.5">{off.description}</p>
                </div>
                
                <div className="border-t pt-4 flex justify-between items-center text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 border rounded-lg">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{new Date(off.startDate).toLocaleDateString()} - {new Date(off.endDate).toLocaleDateString()}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 border border-emerald-100 rounded-lg">
                    {off.discountType === 'flat' ? `₹${off.discountValue} OFF` : `${off.discountValue}% OFF`}
                  </span>
                </div>
              </div>
            ))}
            {offers.length === 0 && (
              <p className="text-sm text-slate-400 py-8">No marketing campaigns or offers currently running.</p>
            )}
          </div>
        </div>
      )}

      {/* 2. PROMO COUPONS TAB CONTENT */}
      {activeTab === 'promos' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Coupons & Promo Codes</h3>
              <p className="text-xs text-slate-400 mt-1">Manage coupon discount values and redemption limits.</p>
            </div>
            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/10"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Generate Coupon Code</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Coupon Code</th>
                    <th className="px-6 py-4">Discount Applied</th>
                    <th className="px-6 py-4">Min. Purchase</th>
                    <th className="px-6 py-4">Redemptions</th>
                    <th className="px-6 py-4">Expires On</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                  {promoCodes.map((promo) => (
                    <tr key={promo._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 border px-2.5 py-1 rounded">
                          {promo.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {promo.discountType === 'percentage' ? `${promo.discountValue}% Discount` : `₹${promo.discountValue} Flat Discount`}
                      </td>
                      <td className="px-6 py-4">
                        ₹{promo.minPurchaseAmount || 0}
                      </td>
                      <td className="px-6 py-4">
                        {promo.usedCount} / {promo.usageLimit === 0 ? 'Unlimited' : promo.usageLimit}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {new Date(promo.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeletePromo(promo._id)} className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-slate-50">
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {promoCodes.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                        No coupon codes currently registered in system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <form onSubmit={handleCreateOffer} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative border border-slate-100 space-y-4">
            <button type="button" onClick={() => setIsOfferModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Create Campaign Offer</h3>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Campaign Title</label>
              <input
                type="text"
                placeholder="Festival Season offer!"
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Short Description</label>
              <textarea
                placeholder="Get 50% discount on BNS and detailed IPC books reference..."
                value={offerDesc}
                onChange={(e) => setOfferDesc(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                rows="3"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Discount Type</label>
                <select
                  value={offerDiscountType}
                  onChange={(e) => setOfferDiscountType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none"
                >
                  <option value="flat">Flat Cash (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Discount Value</label>
                <input
                  type="number"
                  placeholder="50"
                  value={offerDiscountVal}
                  onChange={(e) => setOfferDiscountVal(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Start Date</label>
                <input
                  type="date"
                  value={offerStart}
                  onChange={(e) => setOfferStart(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">End Date</label>
                <input
                  type="date"
                  value={offerEnd}
                  onChange={(e) => setOfferEnd(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-400"
            >
              <Save className="h-4 w-4" />
              <span>Save Campaign Offer</span>
            </button>
          </form>
        </div>
      )}

      {/* Promo Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <form onSubmit={handleCreatePromo} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative border border-slate-100 space-y-4">
            <button type="button" onClick={() => setIsPromoModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Generate Coupon Code</h3>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Coupon Code (Uppercase)</label>
              <input
                type="text"
                placeholder="LAW50"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Discount Type</label>
                <select
                  value={promoDiscountType}
                  onChange={(e) => setPromoDiscountType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Cash (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Discount Value</label>
                <input
                  type="number"
                  placeholder="50"
                  value={promoDiscountVal}
                  onChange={(e) => setPromoDiscountVal(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Min Purchase Amt.</label>
                <input
                  type="number"
                  value={promoMinPurchase}
                  onChange={(e) => setPromoMinPurchase(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Max Uses Limit</label>
                <input
                  type="number"
                  value={promoUsageLimit}
                  onChange={(e) => setPromoUsageLimit(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                  placeholder="0 = unlimited"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Expiry Date</label>
              <input
                type="date"
                value={promoExpiry}
                onChange={(e) => setPromoExpiry(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-400"
            >
              <Save className="h-4 w-4" />
              <span>Generate Coupon</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PromoOffers;
