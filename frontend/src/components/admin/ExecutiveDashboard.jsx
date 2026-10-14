import React, { useState } from 'react';
import { 
  ShoppingBag, 
  IndianRupee, 
  Users, 
  Clock, 
  Plus, 
  QrCode, 
  Tag, 
  ArrowUpRight, 
  ChevronRight, 
  CheckCircle2, 
  ChefHat, 
  Sparkles,
  ExternalLink,
  Flame,
  Leaf,
  Coffee,
  X,
  Eye,
  ArrowRight
} from 'lucide-react';
import { getTranslation } from '../../lib/translations';

export default function ExecutiveDashboard({ 
  restaurantSettings,
  tables, 
  orders, 
  menuItems, 
  activity, 
  categories, 
  currentLang, 
  onNavigate,
  onOpenAddOrder,
  onOpenAddItem,
  onOpenGenerateQR,
  onOpenApplyCoupon
}) {
  const [orderTab, setOrderTab] = useState('ongoing');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const t = (key) => getTranslation(currentLang, key);

  const totalOrdersCount = 48; // as in reference image
  const totalSalesAmount = 12480; // as in reference image ₹ 12,480
  const activeTablesCount = tables.filter(t => t.status === 'occupied').length || 8;
  const pendingOrdersCount = orders.filter(o => o.status === 'Preparing' || o.status === 'Cooking').length || 6;

  // Filter orders by tab
  const filteredOrders = orders.filter(o => {
    if (orderTab === 'ongoing') return o.tab_type === 'ongoing';
    if (orderTab === 'completed') return o.tab_type === 'completed';
    return o.tab_type === 'cancelled';
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Preparing':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Preparing</span>;
      case 'Ready':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Ready</span>;
      case 'Cooking':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300">Cooking</span>;
      case 'Served':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">Served</span>;
      case 'Completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Completed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HERO BANNER & QUICK ACTIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Restaurant Profile Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex flex-col items-center justify-center shadow-md font-heading p-1 text-center shrink-0">
              <span className="text-[11px] font-black leading-tight">Atmiya</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-100">Dosa</span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
                {restaurantSettings?.restaurantName || 'Atmiya Dosa'}
              </h1>
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                <span>{restaurantSettings?.tagline || 'Pure Veg • Authentic Taste • Since 2010'}</span>
              </p>
            </div>
          </div>

          {/* Delicious Dosa Hero Illustration with Banner */}
          <div className="flex items-center space-x-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl p-2.5 pr-4 shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=240&q=80" 
              alt="Crispy Dosa with Sambar" 
              className="w-16 h-12 rounded-xl object-cover shadow-sm"
            />
            <div>
              <div className="text-[11px] font-black text-amber-900 font-heading">
                {t('smallBites')}
              </div>
              <div className="text-[10px] font-bold text-amber-700">
                ⭐ Authentic South Indian Spices
              </div>
            </div>
          </div>

        </div>

        {/* Right: 4 Colorful Quick Action Buttons */}
        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* + Add Order (Green) */}
          <button
            onClick={onOpenAddOrder}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition group"
          >
            <div className="flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-xs font-black font-heading">{t('addOrder')}</span>
            </div>
            <span className="text-[10px] font-medium text-emerald-100 mt-0.5">{t('newOrder')}</span>
          </button>

          {/* + Add Item (Amber) */}
          <button
            onClick={onOpenAddItem}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition group"
          >
            <div className="flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-xs font-black font-heading">{t('addItem')}</span>
            </div>
            <span className="text-[10px] font-medium text-amber-100 mt-0.5">{t('menuItem')}</span>
          </button>

          {/* Generate QR (Blue) */}
          <button
            onClick={onOpenGenerateQR}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition group"
          >
            <div className="flex items-center space-x-1">
              <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-xs font-black font-heading">{t('generateQR')}</span>
            </div>
            <span className="text-[10px] font-medium text-blue-100 mt-0.5">{t('tableQR')}</span>
          </button>

          {/* Apply Coupon (Purple) */}
          <button
            onClick={onOpenApplyCoupon}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition group"
          >
            <div className="flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-xs font-black font-heading">{t('applyCoupon')}</span>
            </div>
            <span className="text-[10px] font-medium text-purple-100 mt-0.5">{t('discount')}</span>
          </button>

        </div>

      </div>

      {/* 2. 4 CORE METRIC STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Orders (Orange) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">{t('totalOrders')}</span>
          </div>
          
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900 font-heading">{totalOrdersCount}</div>
              <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>12% {t('vsYesterday')}</span>
              </div>
            </div>

            {/* Sparkline wave visual */}
            <svg className="w-20 h-9 text-orange-400 stroke-current fill-none" viewBox="0 0 100 40">
              <path d="M0 35 Q 25 10, 50 25 T 100 5" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Sales (Green) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">{t('totalSales')}</span>
          </div>
          
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900 font-heading">₹ {totalSalesAmount.toLocaleString()}</div>
              <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>18% {t('vsYesterday')}</span>
              </div>
            </div>

            {/* Sparkline wave visual */}
            <svg className="w-20 h-9 text-emerald-500 stroke-current fill-none" viewBox="0 0 100 40">
              <path d="M0 30 Q 30 35, 60 15 T 100 8" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Active Tables (Blue) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">{t('activeTables')}</span>
          </div>
          
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900 font-heading">{activeTablesCount}</span>
              <span className="text-sm font-bold text-slate-400">/ 20</span>
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-0.5">{t('inUse')}</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(activeTablesCount / 20) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 4: Pending Orders (Purple) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">{t('pendingOrders')}</span>
          </div>
          
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 font-heading">{pendingOrdersCount}</div>
            <div className="text-[11px] font-bold text-slate-500 mt-0.5">{t('inKitchen')}</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. MIDDLE ROW: SALES OVERVIEW + TOP SELLING ITEMS + TABLE STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Sales Overview Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900 font-heading">{t('salesOverview')}</h3>
            </div>

            <select className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 focus:outline-none cursor-pointer">
              <option>{t('last7Days')}</option>
              <option>Last 30 days</option>
              <option>This Year</option>
            </select>
          </div>

          {/* Interactive SVG Area Chart */}
          <div className="py-4">
            <div className="relative h-44 w-full">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between text-[9px] font-bold text-slate-400 font-mono pointer-events-none">
                <div className="border-b border-dashed border-slate-200 w-full pb-0.5">20K</div>
                <div className="border-b border-dashed border-slate-200 w-full pb-0.5">15K</div>
                <div className="border-b border-dashed border-slate-200 w-full pb-0.5">10K</div>
                <div className="border-b border-dashed border-slate-200 w-full pb-0.5">5K</div>
                <div className="border-b border-slate-300 w-full pb-0.5">0</div>
              </div>

              {/* Area SVG curve */}
              <svg className="absolute inset-0 w-full h-full pl-6 overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 160">
                <defs>
                  <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 20 120 Q 110 90, 200 115 T 380 65 T 490 85 T 580 40 L 580 155 L 20 155 Z" 
                  fill="url(#salesGrad)" 
                />
                <path 
                  d="M 20 120 Q 110 90, 200 115 T 380 65 T 490 85 T 580 40" 
                  fill="none" 
                  stroke="#ea580c" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                />
                {/* Points */}
                <circle cx="20" cy="120" r="4" fill="#ea580c" />
                <circle cx="110" cy="98" r="4" fill="#ea580c" />
                <circle cx="200" cy="115" r="4" fill="#ea580c" />
                <circle cx="290" cy="80" r="4" fill="#ea580c" />
                <circle cx="380" cy="65" r="4" fill="#ea580c" />
                <circle cx="490" cy="85" r="4" fill="#ea580c" />
                <circle cx="580" cy="40" r="5" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>

            {/* Date labels */}
            <div className="flex justify-between pl-6 text-[10px] font-bold text-slate-400 font-mono mt-2">
              <span>09 Oct</span>
              <span>10 Oct</span>
              <span>11 Oct</span>
              <span>12 Oct</span>
              <span>13 Oct</span>
              <span>14 Oct</span>
              <span className="text-orange-600 font-black">15 Oct</span>
            </div>
          </div>

        </div>

        {/* Top Selling Items (3.5 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 font-heading">{t('topSellingItems')}</h3>
            <button 
              onClick={() => onNavigate('menu')}
              className="text-[11px] font-bold text-slate-500 hover:text-orange-600 flex items-center space-x-0.5"
            >
              <span>{t('viewAll')}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 pt-3">
            {[
              { id: 1, name: 'Masala Dosa', count: '142 orders', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=120&q=80' },
              { id: 2, name: 'Cheese Dosa', count: '98 orders', img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=120&q=80' },
              { id: 3, name: 'Idli Sambar', count: '76 orders', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=120&q=80' },
              { id: 4, name: 'Filter Coffee', count: '61 orders', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=120&q=80' },
              { id: 5, name: 'Paneer Dosa', count: '58 orders', img: 'https://images.unsplash.com/photo-1567184109411-b28f21ee097a?auto=format&fit=crop&w=120&q=80' }
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-black text-slate-400 w-3">{item.id}</span>
                  <img src={item.img} alt={item.name} className="w-8 h-8 rounded-xl object-cover shadow-sm" />
                  <span className="text-xs font-bold text-slate-900 font-heading">{item.name}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 font-mono">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table Status Grid (3.5 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 font-heading">{t('tableStatus')}</h3>
            <button 
              onClick={() => onNavigate('tables')}
              className="text-[11px] font-bold text-slate-500 hover:text-orange-600 flex items-center space-x-0.5"
            >
              <span>{t('viewAll')}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3">
            {tables.slice(0, 16).map(table => {
              const isOccupied = table.status === 'occupied';
              return (
                <div 
                  key={table.id}
                  onClick={() => onNavigate('tables')}
                  className={`p-2 rounded-xl text-center border cursor-pointer transition flex flex-col items-center justify-center ${
                    isOccupied 
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
                      : 'bg-slate-50/80 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    <span className="text-[11px] font-black font-heading">{table.number}</span>
                  </div>
                  <span className={`text-[8px] font-bold uppercase mt-0.5 ${isOccupied ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {isOccupied ? 'Occupied' : 'Available'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Actions Footer inside Table Status */}
          <div className="pt-3 border-t border-slate-100 mt-2">
            <div className="text-[11px] font-black text-slate-900 mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>{t('quickActions')}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
              <button 
                onClick={() => onNavigate('menu')}
                className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200/80 flex flex-col items-center"
              >
                <ShoppingBag className="w-4 h-4 text-orange-600 mb-1" />
                <span>{t('manageMenu')}</span>
              </button>

              <button 
                onClick={onOpenGenerateQR}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 flex flex-col items-center"
              >
                <QrCode className="w-4 h-4 text-emerald-600 mb-1" />
                <span>{t('generateQR')}</span>
              </button>

              <button 
                onClick={onOpenApplyCoupon}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 flex flex-col items-center"
              >
                <Tag className="w-4 h-4 text-amber-600 mb-1" />
                <span>{t('createCoupon')}</span>
              </button>

              <button 
                onClick={() => onNavigate('reports')}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 flex flex-col items-center"
              >
                <IndianRupee className="w-4 h-4 text-blue-600 mb-1" />
                <span>{t('viewReports')}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 4. LOWER ROW: TODAY'S ORDERS + RECENT ACTIVITY + TOP CATEGORIES & PROMO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Today's Orders (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900 font-heading">{t('todayOrders')}</h3>
            </div>

            {/* Filter Tabs: Ongoing (6), Completed (12), Cancelled (2) */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
              <button 
                onClick={() => setOrderTab('ongoing')}
                className={`px-3 py-1 rounded-lg transition ${orderTab === 'ongoing' ? 'bg-orange-500 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {t('ongoing')} (6)
              </button>
              <button 
                onClick={() => setOrderTab('completed')}
                className={`px-3 py-1 rounded-lg transition ${orderTab === 'completed' ? 'bg-orange-500 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {t('completed')} (12)
              </button>
              <button 
                onClick={() => setOrderTab('cancelled')}
                className={`px-3 py-1 rounded-lg transition ${orderTab === 'cancelled' ? 'bg-orange-500 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {t('cancelled')} (2)
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-black tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Table No.</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Time</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono font-bold text-slate-900">{order.id}</td>
                    <td className="p-3 font-black text-slate-900 font-heading">{order.table_number}</td>
                    <td className="p-3 text-slate-600 truncate max-w-[140px]">{order.items_summary}</td>
                    <td className="p-3">{getStatusBadge(order.status)}</td>
                    <td className="p-3 text-[11px] font-mono text-slate-400">{order.time}</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => setSelectedOrderDetails(order)}
                        className="text-orange-600 hover:text-orange-700 font-black text-xs inline-flex items-center space-x-0.5"
                      >
                        <span>{t('view')}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Recent Activity (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-black text-slate-900 font-heading">{t('recentActivity')}</h3>
            </div>
            <button 
              onClick={() => onNavigate('orders')}
              className="text-[11px] font-bold text-slate-500 hover:text-orange-600 flex items-center space-x-0.5"
            >
              <span>{t('viewAll')}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {activity.map(item => (
              <div key={item.id} className="flex items-start space-x-3 text-xs">
                <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0 pt-0.5">
                  {item.time}
                </span>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-700 leading-snug">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Food Categories & Smart Restaurant Management (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Top Food Categories Donut Ring */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-900 font-heading">{t('topFoodCategories')}</h3>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              {/* Donut representation */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background ring */}
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 1: Dosa 55% */}
                  <path
                    className="text-orange-500"
                    strokeDasharray="55, 100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 2: South Indian 20% */}
                  <path
                    className="text-amber-400"
                    strokeDasharray="20, 100"
                    strokeDashoffset="-55"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 3: Pizza 10% */}
                  <path
                    className="text-purple-500"
                    strokeDasharray="10, 100"
                    strokeDashoffset="-75"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute text-center">
                  <div className="text-sm font-black text-slate-900 font-heading">48</div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase">Orders</div>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 text-[11px] font-bold text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span>Dosa (55%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span>South Indian (20%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span>Pizza (10%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                  <span>Beverages (8%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Restaurant Management Banner */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-100/70 p-5 rounded-3xl border border-amber-200/80 shadow-sm relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-amber-950 font-heading">
                {t('smartRestaurantManagement')}
              </h4>
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>

            <div className="space-y-1 text-[11px] font-semibold text-amber-900/90">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('fasterOrders')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('betterCustomerExperience')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('higherSales')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('completeControl')}</span>
              </div>
            </div>

            <button 
              onClick={onOpenGenerateQR}
              className="w-full py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-sm transition flex items-center justify-center space-x-1"
            >
              <span>{t('upgradePlan')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 font-heading">
                  Order Details {selectedOrderDetails.id}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">Table: {selectedOrderDetails.table_number} • Time: {selectedOrderDetails.time}</p>
              </div>
              <button 
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedOrderDetails.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-bold py-1 border-b border-slate-50">
                  <span className="text-slate-800">{item.qty}x {item.name}</span>
                  <span className="font-mono text-slate-900">₹ {(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-200 pt-3 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-slate-600">
                <span>Subtotal:</span>
                <span>₹ {selectedOrderDetails.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-600">
                <span>GST (5%):</span>
                <span>₹ {selectedOrderDetails.tax?.toFixed(2)}</span>
              </div>
              {selectedOrderDetails.discount > 0 && (
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Discount:</span>
                  <span>- ₹ {selectedOrderDetails.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200 font-heading">
                <span>Total Amount:</span>
                <span className="text-orange-600">₹ {selectedOrderDetails.total_amount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Print KOT Bill
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
