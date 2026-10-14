import React from 'react';
import { 
  DollarSign, 
  Users, 
  ShoppingBag, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  ChefHat, 
  Utensils, 
  QrCode, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function CommandCenter({ tables, orders, promotions, waiterCalls, onNavigate }) {
  const totalSales = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const occupiedTables = tables.filter(t => t.status !== 'available').length;
  const occupancyRate = tables.length > 0 ? Math.round((occupiedTables / tables.length) * 100) : 0;
  const kitchenQueue = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const pendingWaiterAlerts = waiterCalls.filter(w => w.status === 'pending').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">Available</span>;
      case 'occupied':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">Occupied</span>;
      case 'food_served':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-900 border border-purple-300">Food Served</span>;
      case 'billing':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-900 border border-rose-300">Billing</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Hero Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Command Center Live</span>
              <span>• Grand Palace Hotel & Dining POS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-heading">
              Executive POS & Petpooja Suite
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm font-medium">
              Real-time telemetry on dining table occupancy, digital waiter orders, aggregator sync, and kitchen KDS status.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('tables')}
              className="px-5 py-3 rounded-2xl bg-slate-950 text-white font-black text-xs hover:bg-slate-900 shadow-xl transition flex items-center space-x-2 border border-slate-800"
            >
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Manage Floor Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Total Sales */}
        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm hover:border-amber-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Total Sales Today</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950 font-heading">
              ${totalSales.toFixed(2)}
            </div>
            <div className="flex items-center space-x-1 mt-1 text-xs font-bold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.2% vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Occupancy Rate */}
        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm hover:border-amber-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Active Occupancy</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950 font-heading flex items-baseline space-x-2">
              <span>{occupiedTables}</span>
              <span className="text-sm font-bold text-slate-400">/ {tables.length}</span>
            </div>
            <div className="text-xs font-bold text-slate-600 mt-1">
              {occupancyRate}% Dining Capacity
            </div>
          </div>
        </div>

        {/* Metric 3: Kitchen Order Queue */}
        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm hover:border-amber-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Kitchen Order Queue</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950 font-heading">
              {kitchenQueue}
            </div>
            <div className="text-xs font-bold text-slate-600 mt-1">
              Est. Avg Cook Time: 18m
            </div>
          </div>
        </div>

        {/* Metric 4: Waiter Alerts */}
        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm hover:border-amber-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Waiter Service Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950 font-heading">
              {pendingWaiterAlerts}
            </div>
            <div className="text-xs font-bold text-rose-600 mt-1">
              {pendingWaiterAlerts > 0 ? 'Requires Staff Action' : 'All clear'}
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Live Floor Status & Live Orders Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table Floor Status (2 Columns on large) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-black text-slate-950 font-heading">Live Table Floor Status</h2>
            </div>
            <button
              onClick={() => onNavigate('tables')}
              className="text-xs font-black text-amber-700 hover:text-amber-800 flex items-center space-x-1"
            >
              <span>Open Full Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tables.map(table => (
              <div 
                key={table.id}
                onClick={() => onNavigate('tables')}
                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-amber-500 hover:shadow-md cursor-pointer transition bg-slate-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-slate-950 font-heading">{table.number}</span>
                  {getStatusBadge(table.status)}
                </div>
                <div className="text-[11px] font-bold text-slate-600">
                  Zone: {table.zone}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                  <span>Seats {table.capacity} Guests</span>
                  {table.timing && <span className="text-amber-700 font-mono font-bold">{table.timing}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Order Activity (1 Column) */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-black text-slate-950 font-heading">Live Order Activity</h2>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-black text-amber-700 hover:text-amber-800 flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {orders.map(order => (
              <div key={order.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-950 font-mono">{order.table_number}</span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">{order.id}</span>
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  {order.items.map(item => `${item.qty}x ${item.name}`).join(', ')}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-black text-slate-950">${order.total_amount?.toFixed(2)}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
