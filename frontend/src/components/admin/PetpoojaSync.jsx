import React from 'react';
import { Share2, CheckCircle2, Zap, RefreshCw, Smartphone, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { playSound } from '../../lib/sound';

export default function PetpoojaSync({ petpoojaSync, onToggleAutoAccept }) {
  const totalAggregatorSales = petpoojaSync.reduce((sum, p) => sum + (p.today_sales || 0), 0);
  const totalPendingOrders = petpoojaSync.reduce((sum, p) => sum + (p.pending_orders || 0), 0);

  const handleSimulateSync = () => {
    playSound('order');
    alert('✅ Petpooja POS Sync: Real-time 2-way sync successfully executed with Zomato, Swiggy, and Magicpin APIs! Menu catalog & prices are 100% synchronized.');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Share2 className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-black text-slate-950 font-heading">
              Petpooja & Third-Party POS Aggregator Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Omnichannel synchronization for food delivery aggregators with automated KOT generation, menu inventory mapping, and billing.
          </p>
        </div>

        <button
          onClick={handleSimulateSync}
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-black text-xs hover:bg-amber-600 shadow-md transition flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Force Sync All Channels</span>
        </button>
      </div>

      {/* Aggregate Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Aggregator Sales Today</span>
          <div className="text-2xl font-black text-slate-950 mt-2 font-heading">${totalAggregatorSales.toFixed(2)}</div>
          <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">Direct API settlement</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Pending Delivery KOTs</span>
          <div className="text-2xl font-black text-amber-600 mt-2 font-heading">{totalPendingOrders} Orders</div>
          <span className="text-xs text-slate-500 font-bold mt-1 inline-block">Dispatched to kitchen display</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">API Sync Health</span>
          <div className="text-2xl font-black text-emerald-600 mt-2 font-heading flex items-center space-x-2">
            <span>99.98%</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-xs text-slate-500 font-bold mt-1 inline-block">Average latency: 14ms</span>
        </div>

      </div>

      {/* Aggregator Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {petpoojaSync.map(platform => (
          <div key={platform.id} className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4 hover:border-amber-400 transition">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-black flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950 font-heading">{platform.platform}</h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase">Live Webhook Connected</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-500 font-bold">Latency</span>
                <div className="text-xs font-black text-slate-900 font-mono">{platform.latency_ms} ms</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-500">Today's Revenue</span>
                <div className="text-base font-black text-slate-950 mt-1">${platform.today_sales?.toFixed(2)}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-500">Incoming KOT</span>
                <div className="text-base font-black text-amber-600 mt-1">{platform.pending_orders} Queued</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Auto-Accept KOT Orders:</span>
                <span className={`text-xs font-black uppercase ${platform.auto_accept ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {platform.auto_accept ? 'Enabled' : 'Manual'}
                </span>
              </div>

              <button
                onClick={() => onToggleAutoAccept(platform.id)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition border flex items-center space-x-1 ${
                  platform.auto_accept 
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' 
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <span>{platform.auto_accept ? 'Auto Mode Active' : 'Switch to Auto'}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
