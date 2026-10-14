import React from 'react';
import { ShoppingBag, Clock, CheckCircle, RefreshCw } from 'lucide-react';

export default function OrderAudit({ orders, onUpdateStatus }) {
  return (
    <div className="space-y-6 glass-panel p-6 rounded-3xl border border-slate-800 animate-slide-up">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            Order Audit Log & Lifecycle Override
          </h2>
          <p className="text-xs text-slate-400">Complete audit trail of all dining room table orders.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Table</th>
              <th className="p-3">Items Summary</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-slate-900/50">
                <td className="p-3 font-mono font-bold text-amber-400">{order.id}</td>
                <td className="p-3 font-extrabold text-white text-sm">{order.table_number}</td>
                <td className="p-3">
                  {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                </td>
                <td className="p-3 font-mono font-bold text-white">${order.total_amount?.toFixed(2)}</td>
                <td className="p-3">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {order.status}
                  </span>
                </td>
                <td className="p-3 text-right space-x-1">
                  <button
                    onClick={() => onUpdateStatus(order.id, 'preparing')}
                    className="px-2 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 rounded text-[10px] font-bold"
                  >
                    Preparing
                  </button>
                  <button
                    onClick={() => onUpdateStatus(order.id, 'ready')}
                    className="px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 rounded text-[10px] font-bold"
                  >
                    Ready
                  </button>
                  <button
                    onClick={() => onUpdateStatus(order.id, 'delivered')}
                    className="px-2 py-1 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-slate-950 rounded text-[10px] font-bold"
                  >
                    Delivered
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
