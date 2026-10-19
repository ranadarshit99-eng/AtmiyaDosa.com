import React, { useState, useEffect } from 'react';
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
  X,
  AlertTriangle,
  Check,
  Ban,
  ArrowRight,
  Globe,
  Utensils
} from 'lucide-react';
import { getTranslation } from '../../lib/translations';

export default function OrdersView({ 
  orders, 
  onUpdateStatus, 
  onMarkCashPaymentDone,
  onCancelOrderWithReason,
  onAddNewOrder, 
  currentStaff = { name: 'Darshit Rana', role: 'Admin' },
  currentLang 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [channelTab, setChannelTab] = useState('all'); // 'all', 'dine_in', 'online_queue', 'completed'
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Cancel Order Modal State (Section 7)
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Dish ingredients / Batter out of stock');
  const [customReasonNote, setCustomReasonNote] = useState('');

  // Cash Collection Modal State (Section 2 & 1.2)
  const [cashCollectingOrder, setCashCollectingOrder] = useState(null);
  const [collectorName, setCollectorName] = useState(currentStaff?.name || 'Anjali Patel');

  const t = (key) => getTranslation(currentLang, key);

  // Helper to calculate wait time elapsed
  const getElapsedWaitMinutes = (placedTimeStr) => {
    if (!placedTimeStr) return '12m';
    try {
      const placedDate = new Date(placedTimeStr);
      if (isNaN(placedDate.getTime())) return '15m';
      const diffMs = Date.now() - placedDate.getTime();
      const mins = Math.max(1, Math.floor(diffMs / 60000));
      return `${mins}m`;
    } catch {
      return '15m';
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    // Channel filter (Section 8: Online Orders Queue)
    if (channelTab === 'dine_in' && o.order_source && o.order_source !== 'Dine-In') return false;
    if (channelTab === 'online_queue' && o.order_source === 'Dine-In') return false;
    if (channelTab === 'completed' && o.status !== 'Completed') return false;

    // Search filter
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.table_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (o.customer_phone && o.customer_phone.includes(searchTerm));
    // Status filter
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmCashPayment = () => {
    if (!cashCollectingOrder) return;
    onMarkCashPaymentDone(cashCollectingOrder.id, collectorName || currentStaff?.name || 'Anjali Patel');
    setCashCollectingOrder(null);
  };

  const handleConfirmCancelOrder = () => {
    if (!cancellingOrder) return;
    const finalReason = customReasonNote ? `${cancelReason}: ${customReasonNote}` : cancelReason;
    onCancelOrderWithReason(cancellingOrder.id, finalReason, currentStaff?.name || 'Darshit Rana');
    setCancellingOrder(null);
    setCustomReasonNote('');
  };

  const handlePrintKOT = (order) => {
    setSelectedOrder(order);
    setTimeout(() => window.print(), 200);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#F3F4F6] shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1F2937] font-heading">
                Orders Management & Online Order Queue
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Track table wait times, enforce cash payment verification, manage cancellations, and dispatch KDS orders.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onAddNewOrder}
            className="px-4 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* Channel Queue Tabs (Section 8 of Admin.txt) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#F3F4F6] shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setChannelTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              channelTab === 'all' 
                ? 'bg-[#1F2937] text-white shadow-sm' 
                : 'bg-[#F3F4F6] text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Orders</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded text-[10px] font-mono">{orders.length}</span>
          </button>

          <button
            onClick={() => setChannelTab('dine_in')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              channelTab === 'dine_in' 
                ? 'bg-[#F97316] text-white shadow-sm shadow-orange-500/20' 
                : 'bg-[#F3F4F6] text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Dine-In Tables</span>
          </button>

          <button
            onClick={() => setChannelTab('online_queue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              channelTab === 'online_queue' 
                ? 'bg-[#F97316] text-white shadow-sm shadow-orange-500/20' 
                : 'bg-[#F3F4F6] text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Online Queue (Zomato / Swiggy)</span>
          </button>

          <button
            onClick={() => setChannelTab('completed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              channelTab === 'completed' 
                ? 'bg-[#16A34A] text-white shadow-sm' 
                : 'bg-[#F3F4F6] text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed & Paid</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order ID, table..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F3F4F6] border border-transparent focus:border-[#F97316] text-xs font-semibold focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#F3F4F6] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Order ID & Source</th>
                <th className="p-4">Table / Destination</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Wait Time</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4 text-right">Total (₹)</th>
                <th className="p-4">Payment Method & Verification</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400 font-medium">
                    No orders matching the active criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const isOnlinePayment = order.payment_verified_online || order.payment_mode === 'UPI' || order.payment_mode?.includes('Online');
                  const isCashPending = order.payment_mode === 'Cash' && order.payment_status !== 'Paid';
                  const isCancelled = order.status === 'Cancelled';

                  return (
                    <tr key={order.id} className={`hover:bg-slate-50/70 transition ${isCancelled ? 'bg-rose-50/30 opacity-70' : ''}`}>
                      
                      {/* Order ID & Source */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-mono font-black text-slate-900">{order.id}</div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                          order.order_source === 'Zomato' ? 'bg-red-100 text-red-700' :
                          order.order_source === 'Swiggy' ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {order.order_source || 'Dine-In'}
                        </span>
                      </td>

                      {/* Table Number */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-[#FFF7ED] text-[#F97316] font-mono font-black rounded-lg border border-orange-200 text-xs">
                          {order.table_number}
                        </span>
                      </td>

                      {/* Customer Name & Mobile */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-[#1F2937]">{order.customer_name}</div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          {order.customer_phone ? (
                            <span className="text-[10px] text-slate-600 font-mono font-bold bg-slate-100 px-1.5 py-0.2 rounded">
                              📞 +91 {order.customer_phone}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">Placed {order.time}</span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">• {order.time}</span>
                        </div>
                      </td>

                      {/* Wait Time (Section 7) */}
                      <td className="p-4 whitespace-nowrap">
                        {!isCancelled && order.status !== 'Completed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>{getElapsedWaitMinutes(order.placed_at)} wait</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-mono">—</span>
                        )}
                      </td>

                      {/* Items Summary */}
                      <td className="p-4 max-w-xs font-medium text-slate-700">
                        <div className="line-clamp-2">{order.items_summary}</div>
                        {order.cancel_reason && (
                          <div className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Cancelled: {order.cancel_reason}</span>
                          </div>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="p-4 text-right whitespace-nowrap font-heading font-black text-sm text-[#1F2937]">
                        ₹{order.total_amount}
                      </td>

                      {/* Payment Method & Verification Logic (Section 2 of Admin.txt) */}
                      <td className="p-4 whitespace-nowrap">
                        {isOnlinePayment ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{order.payment_mode} Verified (Online)</span>
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Auto-settled via Gateway
                            </div>
                          </div>
                        ) : isCashPending ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Cash Pending
                            </span>
                            {/* Action Button for Cash Payment (Section 2 & 1.2) */}
                            <button
                              onClick={() => { setCashCollectingOrder(order); setCollectorName(currentStaff?.name || 'Anjali Patel'); }}
                              className="block px-2.5 py-1 bg-[#16A34A] hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow-sm transition"
                            >
                              Cash Received (Payment Done)
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" />
                              Paid in Cash
                            </span>
                            {order.paid_collected_by && (
                              <div className="text-[10px] text-slate-500 font-mono">
                                Collected by: <strong>{order.paid_collected_by}</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Order Status Dropdown (Section 8) */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <select
                          value={order.status}
                          disabled={isCancelled || order.status === 'Completed'}
                          onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold border focus:outline-none ${
                            order.status === 'Preparing' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            order.status === 'Ready' ? 'bg-green-100 text-green-800 border-green-300' :
                            order.status === 'Cooking' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                            order.status === 'Served' ? 'bg-cyan-100 text-cyan-800 border-cyan-300' :
                            order.status === 'Completed' ? 'bg-slate-900 text-white border-slate-900' :
                            order.status === 'Cancelled' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                            'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <option value="Placed">Placed</option>
                          <option value="Cooking">Cooking</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                          <option value="Served">Served</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Print Bill */}
                          <button
                            onClick={() => handlePrintKOT(order)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="Print KOT Tax Bill"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Cancel Order with Reason (Section 7) */}
                          {!isCancelled && order.status !== 'Completed' && (
                            <button
                              onClick={() => { setCancellingOrder(order); setCancelReason('Dish ingredients / Batter out of stock'); }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                              title="Cancel Order with Reason"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CASH PAYMENT COLLECTION WITH STAFF ATTRIBUTION (Section 2 & 1.2) */}
      {cashCollectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#1F2937] font-heading">Confirm Cash Collection</h3>
                <p className="text-xs text-slate-500 font-mono">Order {cashCollectingOrder.id} • Table {cashCollectingOrder.table_number}</p>
              </div>
              <button onClick={() => setCashCollectingOrder(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-orange-200 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Exact Cash to Collect</span>
                <div className="text-3xl font-black text-[#1F2937] font-heading mt-1">₹{cashCollectingOrder.total_amount}</div>
                <div className="text-xs text-slate-500 mt-1">Guest: {cashCollectingOrder.customer_name}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Collecting Staff Member Name</label>
                <input
                  type="text"
                  required
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#F97316]"
                  placeholder="e.g. Anjali Patel"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  This action will be logged in the immutable employee audit trail under Section 1.2!
                </p>
              </div>

              <button
                onClick={handleConfirmCashPayment}
                className="w-full py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Cash Received & Settle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CANCEL ORDER WITH SPECIFIC REASON (Section 7 of Admin.txt) */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-rose-600 font-heading flex items-center gap-1.5">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Cancel Customer Order</span>
                </h3>
                <p className="text-xs text-slate-500">Order {cancellingOrder.id} • Table {cancellingOrder.table_number}</p>
              </div>
              <button onClick={() => setCancellingOrder(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                Customer will receive a real-time notification that this order was cancelled due to the following reason:
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Cancellation Reason</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#F97316]"
                >
                  <option value="Dish ingredients / Batter out of stock">Dish ingredients / Batter out of stock</option>
                  <option value="Chef overload / Kitchen equipment rush delay">Chef overload / Kitchen rush delay</option>
                  <option value="Customer requested cancellation at counter">Customer requested cancellation at counter</option>
                  <option value="Table relocated or guest left">Table relocated or guest left</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional Staff Notes (Optional)</label>
                <textarea
                  rows="2"
                  value={customReasonNote}
                  onChange={(e) => setCustomReasonNote(e.target.value)}
                  placeholder="e.g. Dosa batter exhausted for Mysore Masala. Offered Paper Dosa as alternative."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <button
                onClick={handleConfirmCancelOrder}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-500/20 transition flex items-center justify-center gap-1.5"
              >
                <Ban className="w-4 h-4" />
                <span>Confirm Order Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE KOT BILL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 print:border-none print:shadow-none print:p-0">
            <div className="flex items-center justify-between border-b pb-2 print:hidden">
              <span className="font-heading font-black text-sm">Thermal KOT Tax Receipt</span>
              <button onClick={() => setSelectedOrder(null)} className="p-1"><X className="w-4 h-4" /></button>
            </div>

            <div className="text-center font-mono space-y-1">
              <div className="font-bold text-base">ATMIYA DOSA HUB</div>
              <div className="text-[10px] text-slate-500">Petlad - Anand Road, Gujarat</div>
              <div className="text-[10px] text-slate-500">GSTIN: 24AAACA1234A1Z5</div>
              <div className="border-b border-dashed my-2"></div>
              <div className="flex justify-between text-xs font-bold">
                <span>{selectedOrder.id}</span>
                <span>Table: {selectedOrder.table_number}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Time: {selectedOrder.time}</span>
                <span>Source: {selectedOrder.order_source || 'Dine-In'}</span>
              </div>
              <div className="border-b border-dashed my-2"></div>
              
              <div className="space-y-1 text-left text-xs">
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.qty}x {it.name}</span>
                    <span>₹{it.price * it.qty}</span>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed my-2"></div>
              <div className="flex justify-between text-xs">
                <span>Subtotal:</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>GST (5%):</span>
                <span>₹{selectedOrder.tax}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Discount:</span>
                  <span>-₹{selectedOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black border-t border-dashed pt-1">
                <span>TOTAL:</span>
                <span>₹{selectedOrder.total_amount}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                Payment: {selectedOrder.payment_mode} ({selectedOrder.payment_status || 'Paid'})
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl print:hidden flex items-center justify-center gap-1"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tax Receipt</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
