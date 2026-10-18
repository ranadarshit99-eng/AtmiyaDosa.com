import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  IndianRupee, 
  Users, 
  Clock, 
  Plus, 
  QrCode, 
  ArrowUpRight, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  Printer,
  Download,
  Phone,
  Search,
  AlertCircle,
  Database,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  ShieldCheck,
  Receipt,
  X,
  Layers,
  Activity,
  Flame,
  Award,
  Calendar,
  Utensils
} from 'lucide-react';
import { getTranslation } from '../../lib/translations';
import { supabase, RESTAURANT_ID, recordEmployeeActivity } from '../../lib/supabase';

export default function ExecutiveDashboard({ 
  restaurantSettings,
  tables = [], 
  orders = [], 
  menuItems = [], 
  categories = [], 
  currentLang = 'en', 
  onNavigate,
  onOpenAddOrder,
  onOpenAddItem,
  onOpenGenerateQR,
  onOpenApplyCoupon
}) {
  const [timeframe, setTimeframe] = useState('hourly'); // 'hourly' | 'weekly' | 'monthly'
  const [selectedPointIndex, setSelectedPointIndex] = useState(4); // Default selected active point
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'crm' | 'performance'
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [crmSearch, setCrmSearch] = useState('');
  const [liveSessions, setLiveSessions] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const t = (key) => getTranslation(currentLang, key);

  // Timeframe chart dataset (Interactive & Clickable)
  const chartDatasets = {
    hourly: {
      title: "Today's Hourly Sales Velocity",
      subtitle: 'Peak dinner rush observed between 08:00 PM - 09:30 PM',
      total: '₹18,450',
      totalOrders: 74,
      points: [
        { label: '10 AM', revenue: 980, orders: 5, peakDish: 'Medu Vada & Idli', status: 'Breakfast' },
        { label: '12 PM', revenue: 2450, orders: 11, peakDish: 'Pav Bhaji & Chaas', status: 'Lunch Rush' },
        { label: '02 PM', revenue: 1680, orders: 7, peakDish: 'Mysore Masala Dosa', status: 'Afternoon' },
        { label: '04 PM', revenue: 1120, orders: 4, peakDish: 'Cold Drink & Chaas', status: 'Snacks' },
        { label: '06 PM', revenue: 2890, orders: 12, peakDish: 'Amul Butter Pav Bhaji', status: 'Early Evening' },
        { label: '08 PM', revenue: 5640, orders: 21, peakDish: 'Bahubali & Jini Dosa', status: '🔥 Mega Peak Dinner' },
        { label: '10 PM', revenue: 3690, orders: 14, peakDish: 'S.P. Atmiya Mysore', status: 'Late Dining' }
      ]
    },
    weekly: {
      title: 'This Week Sales Performance',
      subtitle: 'Weekend surge with 150+ dining orders on Saturday & Sunday',
      total: '₹1,24,680',
      totalOrders: 498,
      points: [
        { label: 'Mon', revenue: 12400, orders: 48, peakDish: 'Mysore Masala Dosa', status: 'Regular' },
        { label: 'Tue', revenue: 14200, orders: 55, peakDish: 'Cheese Pav Bhaji', status: 'Regular' },
        { label: 'Wed', revenue: 13800, orders: 51, peakDish: 'Jini Roll Dosa', status: 'Regular' },
        { label: 'Thu', revenue: 15600, orders: 60, peakDish: 'Amul Butter Pav Bhaji', status: 'Above Avg' },
        { label: 'Fri', revenue: 19800, orders: 78, peakDish: 'S.P. Atmiya Mysore', status: 'Pre-Weekend' },
        { label: 'Sat', revenue: 26400, orders: 112, peakDish: 'Bahubali Feast Dosa', status: '🔥 Housefull' },
        { label: 'Sun', revenue: 28480, orders: 124, peakDish: 'Family Combos & Dosa', status: '👑 Record Rush' }
      ]
    },
    monthly: {
      title: 'Monthly Revenue Milestones',
      subtitle: 'Consistent 24% month-on-month compounding growth',
      total: '₹4,86,500',
      totalOrders: 1840,
      points: [
        { label: 'Week 1', revenue: 98000, orders: 380, peakDish: 'Mysore Masala Dosa', status: 'Steady Start' },
        { label: 'Week 2', revenue: 118400, orders: 440, peakDish: 'Amul Butter Pav Bhaji', status: 'Growth Surge' },
        { label: 'Week 3', revenue: 134200, orders: 510, peakDish: 'Bahubali Dosa', status: 'Festive Boom' },
        { label: 'Week 4', revenue: 142900, orders: 510, peakDish: 'S.P. Atmiya Mysore', status: '👑 Month High' }
      ]
    }
  };

  const currentDataset = chartDatasets[timeframe];
  const maxRevenue = Math.max(...currentDataset.points.map(p => p.revenue));
  const activePointIndex = Math.min(selectedPointIndex, currentDataset.points.length - 1);
  const activePoint = currentDataset.points[activePointIndex] || currentDataset.points[0];

  // SVG Spline Wave Calculations for Ambient Background Line & Glow Area
  const numPoints = currentDataset.points.length;
  const svgCoords = currentDataset.points.map((pt, i) => {
    const x = numPoints > 1 ? (i / (numPoints - 1)) * 900 + 50 : 500;
    const y = 160 - ((pt.revenue / maxRevenue) * 115);
    return { x, y, pt };
  });

  const generateSvgPath = (coords) => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const splinePath = generateSvgPath(svgCoords);
  const areaPath = svgCoords.length > 0 
    ? `${splinePath} L ${svgCoords[svgCoords.length - 1].x} 190 L ${svgCoords[0].x} 190 Z` 
    : '';

  // Fetch live orders and sessions from Supabase
  const fetchLiveSupabaseData = async () => {
    try {
      const { data: sessData } = await supabase
        .from('table_sessions')
        .select('*, restaurant_tables(table_number, floor)')
        .eq('restaurant_id', RESTAURANT_ID)
        .order('opened_at', { ascending: false });

      if (sessData && sessData.length > 0) {
        setLiveSessions(sessData);
      }

      const { data: ordData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('restaurant_id', RESTAURANT_ID)
        .order('placed_at', { ascending: false });

      if (ordData && ordData.length > 0) {
        setLiveOrders(ordData);
      }
    } catch (err) {
      console.warn('Supabase fetch error, fallback to props:', err);
    }
  };

  useEffect(() => {
    fetchLiveSupabaseData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('executive_dashboard_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchLiveSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_sessions' }, () => {
        fetchLiveSupabaseData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const displaySessions = liveSessions.length > 0 ? liveSessions : [
    {
      id: 'sess_101',
      session_code: 'SESS-20261018-001',
      table_number: 'T-01',
      status: 'ACTIVE',
      customer_name: 'Amit Patel',
      customer_phone: '+91 98250 12345',
      total_amount: 210.00,
      opened_at: new Date(Date.now() - 14 * 60000).toISOString(),
      order_status: 'PREPARING',
      payment_method: 'CASH',
      payment_status: 'UNPAID',
      items_summary: '1x Mysore Masala Dosa, 1x Amul Butter Pav Bhaji'
    },
    {
      id: 'sess_102',
      session_code: 'SESS-20261018-002',
      table_number: 'T-02',
      status: 'ACTIVE',
      customer_name: 'Bhavin Shah',
      customer_phone: '+91 99044 56789',
      total_amount: 390.00,
      opened_at: new Date(Date.now() - 8 * 60000).toISOString(),
      order_status: 'PLACED',
      payment_method: 'ONLINE_RAZORPAY',
      payment_status: 'PAID',
      items_summary: '1x Bahubali Dosa (Jain), 2x Masala Chaas'
    },
    {
      id: 'sess_105',
      session_code: 'SESS-20261018-005',
      table_number: 'T-05',
      status: 'ACTIVE',
      customer_name: 'Dr. Jignesh Mehta',
      customer_phone: '+91 98980 44556',
      total_amount: 480.00,
      opened_at: new Date(Date.now() - 22 * 60000).toISOString(),
      order_status: 'SERVED',
      payment_method: 'CASH',
      payment_status: 'UNPAID',
      items_summary: '2x S.P. Atmiya Mysore, 3x Butter Pav'
    }
  ];

  // Customer CRM data
  const crmGuests = [
    { id: 'g_01', name: 'Amit Patel', phone: '+91 98250 12345', visits: 8, total_spent: 2450, favorite: 'Mysore Masala Dosa', last_visit: 'Today, 02:40 PM', tier: 'VIP Gold' },
    { id: 'g_02', name: 'Bhavin Shah', phone: '+91 99044 56789', visits: 4, total_spent: 1680, favorite: 'Bahubali Dosa (Jain)', last_visit: 'Today, 03:15 PM', tier: 'Regular' },
    { id: 'g_03', name: 'Dr. Jignesh Mehta', phone: '+91 98980 44556', visits: 12, total_spent: 4920, favorite: 'S.P. Atmiya Mysore', last_visit: 'Today, 03:00 PM', tier: 'VIP Platinum' },
    { id: 'g_04', name: 'Mehul Desai', phone: '+91 98791 22334', visits: 6, total_spent: 1980, favorite: 'Cheese Pav Bhaji', last_visit: 'Yesterday, 08:30 PM', tier: 'Regular' },
    { id: 'g_05', name: 'Pooja Vora', phone: '+91 97240 88991', visits: 3, total_spent: 940, favorite: 'Jini Roll Dosa', last_visit: '16 Oct 2026', tier: 'New Customer' },
    { id: 'g_06', name: 'Kiran Prajapati', phone: '+91 94270 33441', visits: 5, total_spent: 1520, favorite: 'Tawa Pulao', last_visit: '15 Oct 2026', tier: 'Regular' }
  ].filter(g => 
    g.name.toLowerCase().includes(crmSearch.toLowerCase()) || 
    g.phone.includes(crmSearch)
  );

  const bestsellers = [
    { name: 'Mysore Masala Dosa', category: 'Mysore Dosa', count: 34, revenue: '₹4,420', sentiment: '98% Positive', badge: '⭐ Top Seller', rating: '4.9' },
    { name: 'Amul Butter Pav Bhaji', category: 'Pav Bhaji & Pulao', count: 28, revenue: '₹2,240', sentiment: '96% Positive', badge: '🔥 Bestseller', rating: '4.8' },
    { name: 'Jini Roll Dosa (Cheese)', category: 'Fancy Dosa', count: 22, revenue: '₹3,960', sentiment: '97% Positive', badge: '🧀 Viral Hit', rating: '4.9' },
    { name: 'S.P. Atmiya Mysore', category: 'Mysore Dosa', count: 18, revenue: '₹3,780', sentiment: '100% Positive', badge: '👑 Chef Special', rating: '5.0' },
  ];

  const underperforming = [
    { name: 'Spring Dosa (Chinese)', category: 'Fancy Dosa', count: 2, revenue: '₹280', tip: 'Pair with Masala Chaas combo or feature on top menu banner.' },
    { name: 'Extra Amul Butter Pav', category: 'Starters & Extra', count: 4, revenue: '₹80', tip: 'Prompt as 1-tap cart addon when guest adds Pav Bhaji.' },
    { name: 'Packaged Mineral Water', category: 'Beverages', count: 5, revenue: '₹100', tip: 'Introduce refreshing freshly brewed South Indian Filter Coffee.' },
  ];

  // Settle Session
  const handleSettleSession = async (session) => {
    if (!window.confirm(`Settle and close session for ${session.table_number || session.session_code}? Table will become clean and VACANT.`)) {
      return;
    }

    try {
      if (session.id && !session.id.startsWith('sess_')) {
        await supabase
          .from('table_sessions')
          .update({ status: 'COMPLETED', closed_at: new Date().toISOString() })
          .eq('id', session.id);

        if (session.table_id) {
          await supabase
            .from('restaurant_tables')
            .update({ status: 'VACANT' })
            .eq('id', session.table_id);
        }
      }

      await recordEmployeeActivity(
        'DARSHIT RANA',
        'admin',
        'SESSION_SETTLED',
        `Settled session for ${session.table_number || 'table'} - ₹${session.total_amount}`,
        session.table_number
      );

      fetchLiveSupabaseData();
      alert(`✅ Session settled successfully! ${session.table_number || 'Table'} is now VACANT.`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-14 font-sans text-zinc-900">
      
      {/* 1. EXECUTIVE IDENTITY BAR (ALABASTER LUXURY) */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-lg tracking-tight shadow-md shadow-zinc-900/10 shrink-0">
            DR
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 font-heading tracking-tight">
                DARSHIT RANA
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold border border-zinc-200">
                Age 19 • Primary Restaurant Owner
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase Cloud (ap-south-1 Mumbai)</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              Atmiya Dosa Hub • Executive Operations & Live Dining Intelligence (Petlad, Anand)
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={onOpenGenerateQR}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-zinc-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-orange-600" />
            <span>Manage Tables & QRs</span>
          </button>
          <button
            onClick={onOpenAddItem}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-sm shadow-orange-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Menu Item</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR REFINED KPI TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Metric 1 */}
        <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              {currentDataset.total}
            </span>
          </div>
          <div className="mt-2 flex items-center text-[11px] font-bold text-emerald-600 space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs last period</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              {currentDataset.totalOrders}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-zinc-500">
            Dine-in QR + Counter Sales
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Avg Ticket (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              ₹249.32
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-emerald-600 font-bold">
            Target ₹220+ exceeded
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Active Occupancy</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              3 / 10 Tables
            </span>
          </div>
          <div className="mt-2 text-[11px] font-bold text-blue-600">
            30% Current Floor Utilization
          </div>
        </div>

      </div>

      {/* 3. INTERACTIVE CLICKABLE SALES VELOCITY GRAPH (BEAUTIFUL MODERN VISUALIZATION) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-5">
        
        {/* Graph Header with Timeframe Pill Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-black text-zinc-900 font-heading">
                {currentDataset.title}
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              {currentDataset.subtitle} • Click on any point to view hour details
            </p>
          </div>

          {/* Timeframe Switcher */}
          <div className="flex items-center p-1 bg-zinc-100 rounded-2xl border border-zinc-200/60 self-start sm:self-auto">
            <button
              onClick={() => { setTimeframe('hourly'); setSelectedPointIndex(5); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'hourly' 
                  ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Today (Hourly)
            </button>
            <button
              onClick={() => { setTimeframe('weekly'); setSelectedPointIndex(5); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'weekly' 
                  ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => { setTimeframe('monthly'); setSelectedPointIndex(3); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'monthly' 
                  ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Selected Point Highlight Card (Interactive details) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white border border-orange-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {activePoint.label}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-zinc-900 text-sm">₹{activePoint.revenue.toLocaleString('en-IN')}</span>
                <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 font-bold text-[10px]">
                  {activePoint.status}
                </span>
              </div>
              <p className="text-zinc-500 text-[11px] mt-0.5">
                Orders: <strong>{activePoint.orders} tickets</strong> • Top Dish: <strong>{activePoint.peakDish}</strong>
              </p>
            </div>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">
            💡 Click any bar below to inspect that time interval
          </span>
        </div>

        {/* Clickable Modern Interactive SVG Bar & Wave Chart */}
        <div className="pt-2 relative">
          
          {/* Background Grid Lines & Y-Axis Scale */}
          <div className="absolute inset-x-0 top-12 bottom-16 flex flex-col justify-between pointer-events-none opacity-40">
            <div className="border-b border-dashed border-zinc-200 w-full flex justify-end pr-2 text-[10px] text-zinc-400 font-mono">
              ₹{maxRevenue.toLocaleString('en-IN')}
            </div>
            <div className="border-b border-dashed border-zinc-200 w-full flex justify-end pr-2 text-[10px] text-zinc-400 font-mono">
              ₹{Math.round(maxRevenue * 0.66).toLocaleString('en-IN')}
            </div>
            <div className="border-b border-dashed border-zinc-200 w-full flex justify-end pr-2 text-[10px] text-zinc-400 font-mono">
              ₹{Math.round(maxRevenue * 0.33).toLocaleString('en-IN')}
            </div>
            <div className="border-b border-zinc-200 w-full flex justify-end pr-2 text-[10px] text-zinc-400 font-mono">
              ₹0
            </div>
          </div>

          {/* Background Ambient SVG Spline Wave */}
          <div className="absolute inset-x-0 top-6 bottom-16 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="salesVelocityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#salesVelocityGrad)" />
              <path d={splinePath} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
              {svgCoords.map((c, i) => (
                <circle 
                  key={i} 
                  cx={c.x} 
                  cy={c.y} 
                  r={activePointIndex === i ? 6 : 4} 
                  fill={activePointIndex === i ? '#ea580c' : '#f97316'} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
              ))}
            </svg>
          </div>

          {/* Interactive Bars Grid (Dynamic column count) */}
          <div 
            className="relative z-10 grid gap-2 sm:gap-4 items-end h-64 sm:h-72 pb-2"
            style={{ gridTemplateColumns: `repeat(${currentDataset.points.length}, minmax(0, 1fr))` }}
          >
            {currentDataset.points.map((pt, index) => {
              const isSelected = activePointIndex === index;
              const isHovered = hoveredPoint === index;
              const heightPercent = Math.max(16, Math.round((pt.revenue / maxRevenue) * 100));

              return (
                <div 
                  key={index}
                  onClick={() => setSelectedPointIndex(index)}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="flex flex-col items-center justify-end h-full group cursor-pointer relative"
                >
                  {/* Top Value Tag */}
                  <div className={`mb-2 px-2.5 py-1 rounded-xl text-[11px] font-mono font-black transition-all whitespace-nowrap shadow-xs ${
                    isSelected 
                      ? 'bg-zinc-900 text-white scale-105 shadow-md ring-2 ring-orange-500/30' 
                      : isHovered 
                      ? 'bg-orange-600 text-white shadow-sm' 
                      : 'bg-white/95 text-zinc-700 border border-zinc-200 group-hover:border-orange-300'
                  }`}>
                    ₹{pt.revenue >= 100000 ? `${(pt.revenue / 100000).toFixed(2)}L` : (pt.revenue >= 1000 ? `${(pt.revenue / 1000).toFixed(1)}k` : pt.revenue)}
                  </div>

                  {/* Explicit-Height Bar Pillar Track Container */}
                  <div className="w-full max-w-[56px] h-36 sm:h-44 flex flex-col justify-end items-center rounded-2xl bg-zinc-100/70 p-1.5 border border-zinc-200/60 group-hover:border-orange-300 group-hover:bg-orange-50/40 transition-all">
                    <div 
                      style={{ height: `${heightPercent}%`, minHeight: '22px' }}
                      className={`w-full rounded-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between items-center py-1 ${
                        isSelected 
                          ? 'bg-gradient-to-t from-orange-600 via-orange-500 to-amber-400 shadow-md shadow-orange-500/40 ring-2 ring-orange-500/30' 
                          : 'bg-gradient-to-t from-zinc-300 via-zinc-200 to-zinc-200 group-hover:from-orange-400 group-hover:to-amber-300'
                      }`}
                    >
                      {/* Glow indicator dot at apex */}
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white shadow-sm ring-2 ring-orange-300' : 'bg-white/60'}`} />
                      
                      {/* Glossy sheen on hover */}
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>

                  {/* Bottom Column Labels */}
                  <div className="text-center mt-2.5">
                    <span className={`block text-xs font-bold transition-colors ${
                      isSelected ? 'text-orange-600 font-black' : 'text-zinc-600 group-hover:text-zinc-900'
                    }`}>
                      {pt.label}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium font-mono">
                      {pt.orders} orders
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* 4. MAIN OPERATIONS TABS: SESSIONS | CRM | DISH PERFORMANCE */}
      <div className="flex items-center space-x-2 border-b border-zinc-200 pb-3">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sessions'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200/80'
          }`}
        >
          Active Table Sessions ({displaySessions.filter(s => s.status === 'ACTIVE').length})
        </button>

        <button
          onClick={() => setActiveTab('crm')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'crm'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200/80'
          }`}
        >
          Customer CRM & Loyalty ({crmGuests.length})
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'performance'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200/80'
          }`}
        >
          Dish Performance (Bestsellers vs Disliked)
        </button>
      </div>

      {/* TAB 1: HARDCORE ACTIVE TABLE SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          
          {/* Architecture Guardrail Banner */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs text-zinc-700">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Persistent Session Rule Active:</strong> Customer browser clearing does not lose order state. Sessions terminate only upon food delivery and bill settlement.
              </span>
            </div>
            <button 
              onClick={fetchLiveSupabaseData}
              className="px-3 py-1 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 font-bold text-[11px] transition cursor-pointer shadow-2xs"
            >
              Sync Realtime
            </button>
          </div>

          {/* Table Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySessions.map((sess) => {
              const tableNum = sess.restaurant_tables?.table_number || sess.table_number || 'T-01';
              const isPaid = sess.payment_status === 'PAID';

              return (
                <div 
                  key={sess.id} 
                  className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-zinc-300 hover:shadow-md transition-all"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-xl bg-zinc-900 text-white font-black text-sm">
                          {tableNum}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-zinc-400">
                          {sess.session_code || 'SESS-LIVE'}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isPaid 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {isPaid ? 'PAID (Razorpay)' : 'UNPAID (Cash)'}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="mt-3.5 pt-3 border-t border-zinc-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-900">{sess.customer_name || 'Walk-in Guest'}</span>
                        <span className="text-zinc-500 font-mono text-[11px]">{sess.customer_phone || 'No phone'}</span>
                      </div>
                    </div>

                    {/* Order summary */}
                    <div className="mt-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-600 font-medium">
                      {sess.items_summary || '1x Mysore Masala Dosa, 1x Amul Butter Pav Bhaji'}
                    </div>

                    {/* Bill amount */}
                    <div className="mt-3.5 flex items-center justify-between">
                      <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Current Bill</span>
                      <span className="text-xl font-black text-zinc-900 font-mono">
                        ₹{(sess.total_amount || 210).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedReceiptOrder({
                        order_number: sess.session_code,
                        table_number: tableNum,
                        customer_name: sess.customer_name,
                        customer_phone: sess.customer_phone,
                        total_amount: sess.total_amount || 210,
                        placed_at: sess.opened_at,
                        payment_method: sess.payment_method || 'CASH',
                        payment_status: sess.payment_status || 'UNPAID',
                        items_summary: sess.items_summary || 'Mysore Masala Dosa + Pav Bhaji'
                      })}
                      className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Receipt</span>
                    </button>

                    <button
                      onClick={() => handleSettleSession(sess)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Settle & Vacate</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER CRM DATABASE */}
      {activeTab === 'crm' && (
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-zinc-900 font-heading">
                Customer CRM & Guest Directory
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                Captured automatically at QR scan & order placement
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={crmSearch}
                onChange={(e) => setCrmSearch(e.target.value)}
                placeholder="Search name or phone..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 uppercase font-black tracking-wider text-[10px]">
                  <th className="pb-3">Guest Name</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Visits</th>
                  <th className="pb-3">Total Spend</th>
                  <th className="pb-3">Favorite Dish</th>
                  <th className="pb-3">Last Visit</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {crmGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-zinc-50/80 transition">
                    <td className="py-3.5 font-bold text-zinc-900 flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-800 font-bold flex items-center justify-center text-xs">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <span>{guest.name}</span>
                        <span className="block text-[10px] text-zinc-400 font-medium">{guest.tier}</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-zinc-600 font-medium">{guest.phone}</td>
                    <td className="py-3.5 font-bold text-zinc-800">{guest.visits} visits</td>
                    <td className="py-3.5 font-black text-emerald-700">₹{guest.total_spent.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 text-zinc-700 font-medium">{guest.favorite}</td>
                    <td className="py-3.5 text-zinc-500">{guest.last_visit}</td>
                    <td className="py-3.5 text-right">
                      <a
                        href={`https://wa.me/${guest.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${guest.name}! Greetings from Atmiya Dosa Hub Petlad. Thank you for dining with us! We have prepared a special 10% discount on your favorite ${guest.favorite}. Use code ATMIYA10 on your next scan.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 font-bold text-[11px] transition"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Send WhatsApp Offer</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DISH PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Bestsellers */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ThumbsUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 font-heading">
                  Top-Selling Customer Favorites
                </h3>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Highest volume and revenue drivers
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {bestsellers.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-zinc-900 text-xs">{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                        {item.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium">{item.category} • ⭐ {item.rating} ({item.sentiment})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-zinc-900 block">{item.revenue}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">{item.count} orders today</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Underperforming */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ThumbsDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 font-heading">
                  Least Ordered Dishes (Needs Promotion)
                </h3>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Actionable insights to optimize food velocity
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {underperforming.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900 text-xs">{item.name}</span>
                      <span className="text-[11px] text-zinc-400 block">{item.category}</span>
                    </div>
                    <span className="text-xs font-bold text-rose-600">{item.count} orders (Low)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-rose-100/80 text-[11px] text-zinc-600">
                    💡 <strong>Owner Recommendation:</strong> {item.tip}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 5. PRINTABLE TAX INVOICE & THERMAL RECEIPT MODAL */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-zinc-200 p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            
            <button
              onClick={() => setSelectedReceiptOrder(null)}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 absolute top-4 right-4 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Body */}
            <div id="printable-receipt" className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 font-mono text-xs space-y-3 text-zinc-800">
              <div className="text-center space-y-1">
                <h4 className="font-black text-base uppercase tracking-tight text-zinc-900">
                  ATMIYA DOSA HUB
                </h4>
                <p className="text-[10px] text-zinc-500">
                  Opp. New Bus Station, Station Road, Petlad, Anand, Gujarat - 388450
                </p>
                <p className="text-[10px] text-zinc-500">GSTIN: 24AAACA1234A1Z5 • Phone: +91 98765 43210</p>
                <div className="border-b border-dashed border-zinc-300 pt-2"></div>
              </div>

              <div className="flex justify-between text-[11px]">
                <span>Order: {selectedReceiptOrder.order_number}</span>
                <span>Table: {selectedReceiptOrder.table_number}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Guest: {selectedReceiptOrder.customer_name || 'Walk-in'}</span>
                <span>{selectedReceiptOrder.customer_phone || ''}</span>
              </div>
              <div className="text-[10px] text-zinc-400">
                Date: {new Date(selectedReceiptOrder.placed_at || Date.now()).toLocaleString()}
              </div>

              <div className="border-b border-dashed border-zinc-300"></div>

              {/* Items */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between text-zinc-700">
                  <span>{selectedReceiptOrder.items_summary || 'Mysore Masala Dosa + Pav Bhaji'}</span>
                  <span>₹{selectedReceiptOrder.total_amount}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-zinc-300"></div>

              {/* Calculations */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{(selectedReceiptOrder.total_amount * 0.952).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>GST (5% Included):</span>
                  <span>₹{(selectedReceiptOrder.total_amount * 0.048).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-zinc-300">
                  <span>NET TOTAL:</span>
                  <span>₹{selectedReceiptOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-zinc-300"></div>

              <div className="text-center text-[10px] text-zinc-400">
                Payment: {selectedReceiptOrder.payment_method} ({selectedReceiptOrder.payment_status})
                <br />
                Thank you for dining with Atmiya Dosa Hub! Visit again.
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm shadow-orange-600/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill (KOT / Thermal)</span>
              </button>
              <button
                onClick={() => {
                  alert('Tax Invoice downloaded to receipts folder.');
                  setSelectedReceiptOrder(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
