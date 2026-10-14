import React, { useState } from 'react';
import { Sparkles, Plus, Tag, Calendar, Check, Pause } from 'lucide-react';

export default function FestiveEngine({ promotions, onTogglePromo, onAddPromo }) {
  const [showModal, setShowModal] = useState(false);
  const [newPromo, setNewPromo] = useState({
    title: '',
    subtitle: '',
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    banner_url: '',
    is_active: true,
    valid_until: '2026-12-31'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPromo.title || !newPromo.code || !newPromo.discount_value) return;
    onAddPromo(newPromo);
    setShowModal(false);
    setNewPromo({
      title: '',
      subtitle: '',
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      banner_url: '',
      is_active: true,
      valid_until: '2026-12-31'
    });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Festive & Weekend Sales Promotion Engine
          </h2>
          <p className="text-xs text-slate-400">Launch festive discounts, weekend combos, and dynamic promo code campaigns.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Festive Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotions.map(promo => (
          <div key={promo.id} className="glass-card rounded-3xl overflow-hidden border border-slate-800 space-y-4">
            
            <div className="relative h-48 w-full">
              <img src={promo.banner_url} alt={promo.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6 flex flex-col justify-end">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs w-max mb-1">
                  CODE: {promo.code}
                </span>
                <h3 className="text-xl font-black text-white">{promo.title}</h3>
                <p className="text-xs text-slate-300">{promo.subtitle}</p>
              </div>
            </div>

            <div className="px-6 pb-6 flex items-center justify-between">
              <div className="text-xs text-slate-400 space-y-1">
                <p>Discount Value: <span className="text-amber-400 font-bold font-mono">{promo.discount_value}{promo.discount_type === 'percentage' ? '%' : '$'} OFF</span></p>
                <p>Valid Until: <span className="text-slate-300 font-mono">{promo.valid_until}</span></p>
              </div>

              <button
                onClick={() => onTogglePromo(promo.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  promo.is_active
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {promo.is_active ? 'Campaign Active' : 'Paused'}
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="glass-panel max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold text-white">Create Festive Promo Campaign</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Title</label>
                <input 
                  type="text" 
                  value={newPromo.title} 
                  onChange={e => setNewPromo({...newPromo, title: e.target.value})} 
                  placeholder="🎉 DIWALI DHAMAKA 25% OFF"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Subtitle Description</label>
                <input 
                  type="text" 
                  value={newPromo.subtitle} 
                  onChange={e => setNewPromo({...newPromo, subtitle: e.target.value})} 
                  placeholder="Flat discount on orders above $50"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Promo Code</label>
                  <input 
                    type="text" 
                    value={newPromo.code} 
                    onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} 
                    placeholder="DIWALI25"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Value</label>
                  <input 
                    type="number" 
                    value={newPromo.discount_value} 
                    onChange={e => setNewPromo({...newPromo, discount_value: e.target.value})} 
                    placeholder="25"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Banner Image URL</label>
                <input 
                  type="url" 
                  value={newPromo.banner_url} 
                  onChange={e => setNewPromo({...newPromo, banner_url: e.target.value})} 
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button 
                type="submit"
                className="flex-1 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Launch Campaign
              </button>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-4 py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
