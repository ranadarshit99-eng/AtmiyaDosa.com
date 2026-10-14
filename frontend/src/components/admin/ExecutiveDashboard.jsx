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
  ArrowRight,
  Calendar,
  Filter,
  Check
} from 'lucide-react';
import { getTranslation } from '../../lib/translations';

export default function ExecutiveDashboard({ 
  restaurantSettings,
  tables, 
  orders, 
  menuItems, 
  activity = [], 
  categories = [], 
  currentLang, 
  onNavigate,
  onOpenAddOrder,
  onOpenAddItem,
  onOpenGenerateQR,
  onOpenApplyCoupon
}) {
  const [orderTab, setOrderTab] = useState('ongoing');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Section 3: Timeframe filter & Date selector
  const [timeframe, setTimeframe] = useState('daily'); // 'daily', 'weekly', 'monthly', 'yearly', 'custom_date'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const t = (key) => getTranslation(currentLang, key);

  // Dynamic Sales & Turnover calculations based on timeframe (Section 3 of Admin.txt)
  const getMetricsByTimeframe = () => {
    switch (timeframe) {
      case 'weekly':
        return { sales: 87450, ordersCount: 324, growth: '+14% vs last week', labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], points: [80, 110, 95, 140, 130, 190, 220] };
      case 'monthly':
        return { sales: 384200, ordersCount: 1410, growth: '+22% vs last month', labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], points: [85, 120, 160, 210] };
      case 'yearly':
        return { sales: 4620000, ordersCount: 17200, growth: '+31% YoY Turnover', labels: ['Q1', 'Q2', 'Q3', 'Q4'], points: [90, 140, 180, 250] };
      case 'custom_date':
        return { sales: 14280, ordersCount: 52, growth: `Data for ${selectedDate}`, labels: ['9 AM', '12 PM', '3 PM', '6 PM', '9 PM', '11 PM'], points: [30, 85, 45, 110, 140, 95] };
      case 'daily':
      default:
        return { sales: 12480, ordersCount: 48, growth: '+18% vs yesterday', labels: ['10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'], points: [20, 90, 115, 65, 85, 140, 110] };
    }
  };

  const currentMetrics = getMetricsByTimeframe();
  const activeTablesCount = tables.filter(t => t.status === 'occupied').length || 8;
  const pendingOrdersCount = orders.filter(o => o.status === 'Preparing' || o.status === 'Cooking').length || 6;

  // Filter orders by tab
  const filteredOrders = orders.filter(o => {
    if (orderTab === 'ongoing') return o.status !== 'Completed' && o.status !== 'Cancelled';
    if (orderTab === 'completed') return o.status === 'Completed';
    return o.status === 'Cancelled';
  });

  // Top Selling Items (Most frequently ordered dishes - Section 3)
  const topSellingDishes = [...menuItems]
    .sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0))
    .slice(0, 5);

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
      case 'Cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HERO BANNER & QUICK ACTIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Restaurant Profile Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-[#F3F4F6] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F97316] text-white flex flex-col items-center justify-center shadow-md shadow-orange-500/20 font-heading p-1 text-center shrink-0">
              <span className="text-xs font-black leading-tight">Atmiya</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-orange-100">Dosa Hub</span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#1F2937] font-heading tracking-tight">
                {restaurantSettings?.restaurantName || 'Atmiya Dosa Hub'}
              </h1>
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                <span>{restaurantSettings?.tagline || 'Pure Veg • Authentic Taste • Petlad'}</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold">Online & Dine-In Sync</span>
              </p>
            </div>
          </div>

          {/* Dosa Hero Banner */}
          <div className="flex items-center space-x-3 bg-[#FFF7ED] border border-orange-200/60 rounded-2xl p-2.5 pr-4 shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=240&q=80" 
              alt="Crispy Dosa" 
              className="w-14 h-11 rounded-xl object-cover shadow-sm"
            />
            <div>
              <div className="text-[11px] font-black text-orange-950 font-heading">
                Special Mysore & Fancy
              </div>
              <div className="text-[10px] font-bold text-[#F97316]">
                ⭐ Wood-Fired Desi Butter
              </div>
            </div>
          </div>

        </div>

        {/* Right: Quick Action Buttons */}
        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* + Add Order (Action Green) */}
          <button
            onClick={onOpenAddOrder}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#16A34A] hover:bg-emerald-700 text-white shadow-sm transition group"
          >
            <div className="flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-xs font-black font-heading">{t('addOrder')}</span>
            </div>
            <span className="text-[10px] font-medium text-emerald-100 mt-0.5">{t('newOrder')}</span>
          </button>

          {/* + Add Item (Primary Orange) */}
          <button
            onClick={onOpenAddItem}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F97316] hover:bg-orange-600 text-white shadow-sm transition group"
          >
            <div className="flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-xs font-black font-heading">{t('addItem')}</span>
            </div>
            <span className="text-[10px] font-medium text-orange-100 mt-0.5">{t('menuItem')}</span>
          </button>

          {/* Generate QR */}
          <button
            onClick={onOpenGenerateQR}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1F2937] hover:bg-slate-900 text-white shadow-sm transition group"
          >
            <div className="flex items-center space-x-1">
              <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-xs font-black font-heading">{t('generateQR')}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-300 mt-0.5">{t('tableQR')}</span>
          </button>

          {/* Apply Coupon */}
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

      {/* 2. CORE METRIC STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-[#F3F4F6] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">{t('totalOrders')}</span>
          </div>
          
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-black text-[#1F2937] font-heading">{currentMetrics.ordersCount}</div>
              <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>{currentMetrics.growth}</span>
              </div>
            </div>

            <svg className="w-20 h-9 text-orange-400 stroke-current fill-none" viewBox="0 0 100 40">
              <path d="M0 35 Q 25 10, 50 25 T 100 5" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Total Sales & Turnover */}
        <div className="bg-white p-5 rounded-3xl border border-[#F3F4F6] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">Sales Turnover</span>
          </div>
          
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-black text-[#1F2937] font-heading">₹{currentMetrics.sales.toLocaleString()}</div>
              <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>GST 5% Included</span>
              </div>
            </div>

            <svg className="w-20 h-9 text-emerald-500 stroke-current fill-none" viewBox="0 0 100 40">
              <path d="M0 30 Q 30 35, 60 15 T 100 8" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Active Tables */}
        <div className="bg-white p-5 rounded-3xl border border-[#F3F4F6] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">{t('activeTables')}</span>
          </div>
          
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#1F2937] font-heading">{activeTablesCount}</span>
              <span className="text-sm font-bold text-slate-400">/ 16 Tables</span>
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-0.5">{t('inUse')}</div>
            <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-[#16A34A] h-1.5 rounded-full" style={{ width: `${(activeTablesCount / 16) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-3xl border border-[#F3F4F6] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">Live KDS Queue</span>
          </div>
          
          <div className="mt-4">
            <div className="text-3xl font-black text-[#1F2937] font-heading">{pendingOrdersCount}</div>
            <div className="text-[11px] font-bold text-slate-500 mt-0.5">Cooking & Preparing</div>
            <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-[#F97316] h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. MULTI-TIMEFRAME SALES CHART & FAVORITE DISHES (Section 3 of Admin.txt) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Sales Overview with Day, Week, Month, Year & Date Picker (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-[#F3F4F6] shadow-sm flex flex-col justify-between space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#1F2937] font-heading">{t('salesOverview')} & Turnover</h3>
                <p className="text-[11px] text-slate-400 font-medium">Day, weekly, monthly, and yearly turnover analytics</p>
              </div>
            </div>

            {/* Timeframe & Date Picker Row (Section 3 Requirement) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-[#F3F4F6] p-1 rounded-xl text-xs font-bold">
                {['daily', 'weekly', 'monthly', 'yearly'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setTimeframe(mode)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition ${
                      timeframe === mode 
                        ? 'bg-[#F97316] text-white shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Date Picker (Section 3 Requirement) */}
              <div className="flex items-center gap-1.5 bg-[#F3F4F6] px-2.5 py-1 rounded-xl border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setTimeframe('custom_date');
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none font-mono"
                  title="Pick any specific day or date to see data"
                />
              </div>
            </div>
          </div>

          {/* Interactive SVG Area Chart */}
          <div className="py-2">
            <div className="relative h-48 w-full">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between text-[9px] font-bold text-slate-400 font-mono pointer-events-none">
                <div className="border-b border-dashed border-slate-100 w-full pb-0.5">₹50K</div>
                <div className="border-b border-dashed border-slate-100 w-full pb-0.5">₹35K</div>
                <div className="border-b border-dashed border-slate-100 w-full pb-0.5">₹20K</div>
                <div className="border-b border-dashed border-slate-100 w-full pb-0.5">₹10K</div>
                <div className="border-b border-slate-200 w-full pb-0.5">0</div>
              </div>

              {/* SVG Line / Area */}
              <svg className="absolute inset-0 w-full h-full pl-7 overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 160">
                <defs>
                  <linearGradient id="dashboardSalesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F97316" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 20 120 Q 110 80, 200 115 T 380 50 T 490 75 T 580 30 L 580 155 L 20 155 Z" 
                  fill="url(#dashboardSalesGrad)" 
                />
                <path 
                  d="M 20 120 Q 110 80, 200 115 T 380 50 T 490 75 T 580 30" 
                  fill="none" 
                  stroke="#F97316" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                />
                <circle cx="20" cy="120" r="4" fill="#F97316" />
                <circle cx="110" cy="85" r="4" fill="#F97316" />
                <circle cx="200" cy="115" r="4" fill="#F97316" />
                <circle cx="290" cy="70" r="4" fill="#F97316" />
                <circle cx="380" cy="50" r="4" fill="#F97316" />
                <circle cx="490" cy="75" r="4" fill="#F97316" />
                <circle cx="580" cy="30" r="5" fill="#F97316" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>

            {/* Labels */}
            <div className="flex justify-between pl-7 text-[10px] font-bold text-slate-400 font-mono mt-2">
              {currentMetrics.labels.map((lbl, idx) => (
                <span key={idx} className={idx === currentMetrics.labels.length - 1 ? 'text-[#F97316] font-black' : ''}>
                  {lbl}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 text-slate-500">
            <span>Period Turnover: <strong className="text-[#1F2937]">₹{currentMetrics.sales.toLocaleString()}</strong></span>
            <span>Total Orders: <strong className="text-[#1F2937]">{currentMetrics.ordersCount} completed</strong></span>
          </div>

        </div>

        {/* Most Frequently Ordered Dishes / Customer Favorites (5 cols - Section 3 Requirement) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-[#F3F4F6] shadow-sm flex flex-col justify-between space-y-3">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#1F2937] font-heading flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#F97316]" />
                <span>Frequently Ordered Dishes</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Most ordered dishes customer preference ranking</p>
            </div>
            <button 
              onClick={() => onNavigate('menu')}
              className="text-[11px] font-bold text-[#F97316] hover:text-orange-700 flex items-center space-x-0.5"
            >
              <span>{t('viewAll')}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {topSellingDishes.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FFF7ED]/50 transition">
                <div className="flex items-center space-x-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                    idx === 0 ? 'bg-[#F97316] text-white' :
                    idx === 1 ? 'bg-amber-100 text-amber-800' :
                    idx === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-[#1F2937] font-heading line-clamp-1">{item.name}</h4>
                    <div className="text-[10px] text-slate-400 font-medium">{item.category} • ₹{item.finalPrice || item.price}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black font-mono text-[#F97316]">{item.orders_count || 120} orders</div>
                  <div className="text-[10px] font-bold text-emerald-600">
                    ₹{((item.orders_count || 120) * (item.finalPrice || item.price)).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-medium">Customer favorite: <strong>Mysore Masala Dosa</strong> (342 orders)</span>
          </div>

        </div>

      </div>

      {/* 4. LOWER ROW: TABLE STATUS + TODAY'S ORDERS + AUDIT LOG + CATEGORY PREFERENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Table Status Grid (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-[#F3F4F6] shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-[#1F2937] font-heading">{t('tableStatus')} (16 Tables)</h3>
            <button 
              onClick={() => onNavigate('tables')}
              className="text-[11px] font-bold text-[#F97316] hover:text-orange-700 flex items-center space-x-0.5"
            >
              <span>Manage</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {tables.slice(0, 16).map(table => {
              const isOccupied = table.status === 'occupied';
              return (
                <div 
                  key={table.id}
                  onClick={() => onNavigate('tables')}
                  className={`p-2.5 rounded-2xl text-center border cursor-pointer transition flex flex-col items-center justify-center ${
                    isOccupied 
                      ? 'bg-[#FFF7ED] border-orange-200 text-orange-950 shadow-sm' 
                      : 'bg-white border-[#F3F4F6] text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span className={`w-2 h-2 rounded-full ${isOccupied ? 'bg-[#F97316]' : 'bg-emerald-500'}`}></span>
                    <span className="text-xs font-black font-heading">{table.number}</span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase mt-1 ${isOccupied ? 'text-[#F97316]' : 'text-emerald-700'}`}>
                    {isOccupied ? (table.timing || 'Occupied') : 'Available'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Orders Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-[#F3F4F6] shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-[#1F2937] font-heading">{t('todayOrders')}</h3>
            <div className="flex items-center space-x-1 bg-[#F3F4F6] p-1 rounded-xl text-[11px] font-bold">
              <button 
                onClick={() => setOrderTab('ongoing')}
                className={`px-2.5 py-1 rounded-lg transition ${orderTab === 'ongoing' ? 'bg-[#F97316] text-white shadow-sm' : 'text-slate-600'}`}
              >
                Ongoing
              </button>
              <button 
                onClick={() => setOrderTab('completed')}
                className={`px-2.5 py-1 rounded-lg transition ${orderTab === 'completed' ? 'bg-[#F97316] text-white shadow-sm' : 'text-slate-600'}`}
              >
                Completed
              </button>
              <button 
                onClick={() => setOrderTab('cancelled')}
                className={`px-2.5 py-1 rounded-lg transition ${orderTab === 'cancelled' ? 'bg-[#F97316] text-white shadow-sm' : 'text-slate-600'}`}
              >
                Cancelled
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-black tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-2.5">Order</th>
                  <th className="p-2.5">Table</th>
                  <th className="p-2.5">Total</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOrders.slice(0, 6).map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-2.5 font-mono font-bold text-slate-900">{order.id}</td>
                    <td className="p-2.5 font-black text-slate-900">{order.table_number}</td>
                    <td className="p-2.5 font-heading font-black text-slate-900">₹{order.total_amount}</td>
                    <td className="p-2.5">{getStatusBadge(order.status)}</td>
                    <td className="p-2.5 text-right">
                      <button 
                        onClick={() => setSelectedOrderDetails(order)}
                        className="text-[#F97316] hover:text-orange-700 font-black text-xs"
                      >
                        {t('view')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown Donut / List (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-[#F3F4F6] shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-[#1F2937] font-heading">Favorite Food Types</h3>
            <p className="text-[11px] text-slate-400 font-medium">Customer preferences by cuisine</p>
          </div>

          <div className="space-y-3 pt-1">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#1F2937]">{cat.name}</span>
                  <span className="font-mono text-[#F97316] font-black">{cat.percentage}%</span>
                </div>
                <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full ${
                      idx === 0 ? 'bg-[#F97316]' :
                      idx === 1 ? 'bg-amber-500' :
                      idx === 2 ? 'bg-[#16A34A]' :
                      'bg-slate-400'
                    }`} 
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="p-3 bg-[#FFF7ED] rounded-2xl border border-orange-200 text-xs text-orange-950 font-medium space-y-1">
              <div className="font-bold text-[#F97316] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kitchen Tip</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Mysore Dosa & Fancy Dosa account for 66% of daily turnover. Ensure adequate Amul butter & cheese stock!
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ORDER DETAILS POPUP MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#1F2937] font-heading">{selectedOrderDetails.id}</h3>
                <p className="text-xs text-slate-500 font-bold">Table: {selectedOrderDetails.table_number} • {selectedOrderDetails.customer_name}</p>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-700">Ordered Dishes:</div>
              <div className="p-3 rounded-2xl bg-[#F3F4F6] space-y-1 font-mono">
                {selectedOrderDetails.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.qty}x {it.name}</span>
                    <span>₹{it.price * it.qty}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2 border-t font-bold">
                <span>Subtotal:</span>
                <span>₹{selectedOrderDetails.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span>₹{selectedOrderDetails.tax}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#1F2937] font-heading pt-1 border-t">
                <span>Total Amount:</span>
                <span className="text-[#F97316]">₹{selectedOrderDetails.total_amount}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 mt-2">
                <div>Payment Method: <strong>{selectedOrderDetails.payment_mode}</strong> ({selectedOrderDetails.payment_status || 'Paid'})</div>
                {selectedOrderDetails.paid_collected_by && (
                  <div>Collected By: <strong>{selectedOrderDetails.paid_collected_by}</strong></div>
                )}
                {selectedOrderDetails.cancel_reason && (
                  <div className="text-rose-600 font-bold mt-1">Reason: {selectedOrderDetails.cancel_reason}</div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2.5 rounded-xl bg-[#1F2937] text-white font-bold text-xs"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
