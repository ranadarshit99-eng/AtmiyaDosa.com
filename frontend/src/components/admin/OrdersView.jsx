import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  CheckCircle2, 
  Printer, 
  Eye, 
  IndianRupee, 
  Filter,
  Plus,
  X
} from 'lucide-react';
import { getTranslation } from '../../lib/translations';

export default function OrdersView({ orders, onUpdateStatus, onAddNewOrder, currentLang }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const t = (key) => getTranslation(currentLang, key);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.table_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-slate-900 font-heading">
              {t('orders')} Management & KOT Tax Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track dining room KOT orders, live preparation workflow, and payment settlement.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onAddNewOrder}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addOrder')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Preparing', 'Cooking', 'Ready', 'Served', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order ID, table..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-black tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Table</th>
                <th className="p-4">Guest</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4">Total (₹)</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-mono font-bold text-slate-900">{order.id}</td>
                  <td className="p-4 font-black text-slate-900 font-heading text-sm">{order.table_number}</td>
                  <td className="p-4 text-slate-600 font-semibold">{order.customer_name || 'Walk-in Guest'}</td>
                  <td className="p-4 text-slate-700 font-semibold max-w-[200px] truncate">{order.items_summary}</td>
                  <td className="p-4 font-mono font-black text-slate-900 text-sm">₹ {order.total_amount?.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-50 text-blue-800 border border-blue-200">
                      {order.payment_mode || 'UPI'}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold border border-slate-300 bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="Preparing">Preparing</option>
                      <option value="Cooking">Cooking</option>
                      <option value="Ready">Ready</option>
                      <option value="Served">Served</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs"
                      title="View Bill Details"
                    >
                      <Eye className="w-3.5 h-3.5 inline mr-1" />
                      <span>{t('view')}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      title="Print KOT"
                    >
                      <Printer className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill View Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 font-heading">
                  Tax Invoice {selectedOrder.id}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">Table: {selectedOrder.table_number} • Time: {selectedOrder.time}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-bold py-1 border-b border-slate-50">
                  <span className="text-slate-800">{item.qty}x {item.name}</span>
                  <span className="font-mono text-slate-900">₹ {(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-200 pt-3 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-slate-600">
                <span>Subtotal:</span>
                <span>₹ {selectedOrder.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-600">
                <span>GST (5%):</span>
                <span>₹ {selectedOrder.tax?.toFixed(2)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Discount:</span>
                  <span>- ₹ {selectedOrder.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200 font-heading">
                <span>Total Amount:</span>
                <span className="text-orange-600">₹ {selectedOrder.total_amount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
