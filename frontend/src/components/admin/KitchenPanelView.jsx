import React, { useState } from 'react';
import { ChefHat, Clock, CheckCircle2, Flame, BellRing, Volume2, Check } from 'lucide-react';
import { playSound } from '../../lib/sound';
import { getTranslation } from '../../lib/translations';

export default function KitchenPanelView({ orders, onUpdateStatus, currentLang }) {
  const [audioEnabled, setAudioEnabled] = useState(true);

  const t = (key) => getTranslation(currentLang, key);

  const activeOrders = orders.filter(o => o.status === 'Preparing' || o.status === 'Cooking');
  const readyOrders = orders.filter(o => o.status === 'Ready');

  const handleMarkReady = (orderId) => {
    if (audioEnabled) playSound('success');
    onUpdateStatus(orderId, 'Ready');
  };

  const handleMarkServed = (orderId) => {
    onUpdateStatus(orderId, 'Served');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <ChefHat className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-slate-900 font-heading">
              {t('kitchenPanel')} & KDS Display
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time digital kitchen order tickets with audio notification cues for chefs and line cooks.
          </p>
        </div>

        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
            audioEnabled 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{audioEnabled ? 'Kitchen Chime On' : 'Chime Muted'}</span>
        </button>
      </div>

      {/* Grid of Active Kitchen Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeOrders.map(order => (
          <div key={order.id} className="bg-white rounded-3xl border-2 border-orange-200/90 shadow-md p-5 space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                <span className="text-xl font-black text-slate-900 font-heading">{order.table_number}</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">{order.id}</span>
            </div>

            <div className="space-y-2.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-orange-50/60 border border-orange-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                      {item.qty}x
                    </span>
                    <span className="text-sm font-black text-slate-900 font-heading">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{order.time}</span>
              </div>

              <button
                onClick={() => handleMarkReady(order.id)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-sm flex items-center space-x-1.5 transition"
              >
                <Check className="w-4 h-4" />
                <span>{t('markReady')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeOrders.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <ChefHat className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">All Kitchen Orders Cleared!</h3>
          <p className="text-xs text-slate-400">Waiting for incoming table QR orders.</p>
        </div>
      )}

      {/* Ready to Serve Orders */}
      {readyOrders.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-black text-slate-900 font-heading uppercase tracking-wider flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ready for Waiter Pickup ({readyOrders.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {readyOrders.map(order => (
              <div key={order.id} className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-emerald-950 font-heading">{order.table_number}</span>
                  <p className="text-xs text-emerald-800 font-semibold">{order.items_summary}</p>
                </div>

                <button
                  onClick={() => handleMarkServed(order.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm"
                >
                  {t('serve')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
