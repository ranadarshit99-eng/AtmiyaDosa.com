import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle2, Flame, BellRing, Volume2 } from 'lucide-react';
import { getLocalStore, setLocalStore, INITIAL_ORDERS } from '../lib/appwrite';

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const loadOrders = () => {
    const all = getLocalStore('orders', INITIAL_ORDERS);
    setOrders(all.filter(o => o.status !== 'completed' && o.status !== 'cancelled'));
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('hotel_data_updated', loadOrders);
    return () => window.removeEventListener('hotel_data_updated', loadOrders);
  }, []);

  const handleUpdateStatus = (orderId, newStatus) => {
    const all = getLocalStore('orders', INITIAL_ORDERS);
    const updated = all.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setLocalStore('orders', updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Kitchen Display System (KDS)</h1>
            <p className="text-xs text-slate-400">Live cook ticket queue with elapsed timing badges.</p>
          </div>
        </div>

        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 ${
            audioEnabled ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Audio Alert: {audioEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(order => {
          const isPending = order.status === 'pending';
          const isPreparing = order.status === 'preparing';
          const isReady = order.status === 'ready';

          return (
            <div 
              key={order.id} 
              className={`glass-card p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
                isPending ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-slate-900' :
                isPreparing ? 'border-blue-500/50 bg-gradient-to-b from-blue-950/20 to-slate-900' :
                'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 to-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-2xl font-black text-white">{order.table_number}</span>
                    <span className="font-mono text-xs text-slate-400 block">{order.id}</span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                    isPending ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse' :
                    isPreparing ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="py-4 space-y-2 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="font-extrabold text-white text-sm">{item.qty}x {item.name}</span>
                        {item.notes && <p className="text-[11px] text-amber-400 italic">Note: {item.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex gap-2">
                {isPending && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'preparing')}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-4 h-4" />
                    Start Cooking
                  </button>
                )}

                {isPreparing && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'ready')}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Dish Ready
                  </button>
                )}

                {isReady && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'delivered')}
                    className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs rounded-xl shadow-lg"
                  >
                    Mark Served
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
