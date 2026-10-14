import React, { useState } from 'react';
import { Tag, Plus, Check, Trash2, Calendar, Sparkles, Percent, IndianRupee } from 'lucide-react';
import { getTranslation } from '../../lib/translations';

export default function OffersView({ coupons, onAddCoupon, onToggleCoupon, currentLang }) {
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: '',
    type: 'percentage',
    min_order: 200
  });

  const t = (key) => getTranslation(currentLang, key);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) return;
    onAddCoupon({
      id: `c_${Date.now()}`,
      code: newCoupon.code.toUpperCase(),
      discount: parseFloat(newCoupon.discount),
      type: newCoupon.type,
      min_order: parseFloat(newCoupon.min_order),
      active: true
    });
    setShowModal(false);
    setNewCoupon({ code: '', discount: '', type: 'percentage', min_order: 200 });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Tag className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-slate-900 font-heading">
              {t('offersCoupons')} & Festive Deals
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Create promotional coupon codes that guests can apply during digital table checkout.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createCoupon')}</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map(coupon => (
          <div key={coupon.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-xl bg-orange-50 text-orange-700 font-mono font-black text-sm border border-orange-200 tracking-wider">
                {coupon.code}
              </span>
              <button
                onClick={() => onToggleCoupon(coupon.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  coupon.active 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {coupon.active ? 'Active' : 'Paused'}
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-black text-slate-900 font-heading">
                {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `₹ ${coupon.discount} OFF`}
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                Valid on minimum bill of ₹ {coupon.min_order}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant QR checkout discount</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 font-heading">Create Promo Code</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DOSALOVER25"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold uppercase focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Rupee (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={newCoupon.discount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={newCoupon.min_order}
                  onChange={(e) => setNewCoupon({ ...newCoupon, min_order: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md"
                >
                  Launch Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
