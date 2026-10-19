import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  IndianRupee, 
  Users, 
  Clock, 
  Plus, 
  QrCode, 
  ArrowUpRight, 
  ArrowDownRight,
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
  TrendingDown,
  ShieldCheck, 
  Receipt, 
  X, 
  Layers, 
  Activity, 
  Flame, 
  Award, 
  Calendar, 
  Utensils,
  PieChart as PieChartIcon,
  BarChart2,
  Filter,
  Zap,
  Sun,
  Moon,
  Tag,
  RefreshCw,
  Trophy,
  Coffee,
  ChefHat,
  Eye
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
  theme = 'obsidian',
  onThemeChange,
  onNavigate,
  onOpenAddOrder,
  onOpenAddItem,
  onOpenGenerateQR,
  onOpenApplyCoupon
}) {
  const [timeframe, setTimeframe] = useState('hourly'); // 'hourly' | 'weekly' | 'monthly'
  const [selectedPointIndex, setSelectedPointIndex] = useState(5); // Default selected active peak hour
  const [activeTab, setActiveTab] = useState('demand'); // 'demand' | 'pie_chart' | 'sessions' | 'crm' | 'rush_hours'
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'volume'
  const [pieMetric, setPieMetric] = useState('volume'); // 'volume' | 'revenue'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [demandTab, setDemandTab] = useState('bestsellers'); // 'bestsellers' | 'low_demand' | 'all'
  const [dishSearch, setDishSearch] = useState('');
  const [dishSortBy, setDishSortBy] = useState('volume'); // 'volume' | 'revenue' | 'margin'
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [selectedSlice, setSelectedSlice] = useState('cat_mysore');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [crmSearch, setCrmSearch] = useState('');
  const [liveSessions, setLiveSessions] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);

  const isDark = theme !== 'light';

  // Dynamic Theme Palette mapping
  const palette = useMemo(() => {
    if (theme === 'sapphire') {
      return {
        bg: 'bg-[#070D1E]',
        cardBg: 'bg-[#0D1836]',
        cardBorder: 'border-indigo-900/50',
        cardHover: 'hover:border-indigo-700/60',
        innerBox: 'bg-[#091228]/80 border-indigo-950/80',
        textPrimary: 'text-slate-100',
        textSecondary: 'text-slate-400',
        accentGrad: 'from-indigo-600 to-blue-600',
        activePill: 'bg-indigo-600 text-white shadow-indigo-600/30'
      };
    }
    if (theme === 'light') {
      return {
        bg: 'bg-[#F8FAFC]',
        cardBg: 'bg-white',
        cardBorder: 'border-slate-200/90',
        cardHover: 'hover:border-slate-300',
        innerBox: 'bg-slate-50 border-slate-200/80',
        textPrimary: 'text-zinc-900',
        textSecondary: 'text-zinc-500',
        accentGrad: 'from-orange-500 to-amber-500',
        activePill: 'bg-zinc-900 text-white shadow-zinc-900/20'
      };
    }
    // Default: 'obsidian' (Cyber Luxe)
    return {
      bg: 'bg-[#090D16]',
      cardBg: 'bg-[#111827]',
      cardBorder: 'border-slate-800/80',
      cardHover: 'hover:border-slate-700',
      innerBox: 'bg-[#0D1322] border-slate-800/90',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-400',
      accentGrad: 'from-orange-500 via-amber-500 to-amber-400',
      activePill: 'bg-orange-500 text-white shadow-orange-500/30'
    };
  }, [theme]);

  // Executive Timeframe Telemetry Dataset
  const chartDatasets = {
    hourly: {
      title: "Today's Hourly Sales & Volume Velocity",
      subtitle: 'Peak dinner rush recorded between 08:00 PM - 09:30 PM (21 Orders / 48 Plates)',
      total: '₹18,450',
      totalOrders: 74,
      totalVolume: 168,
      points: [
        { label: '10 AM', revenue: 980, orders: 5, volume: 9, peakDish: 'Medu Vada & Idli', status: 'Breakfast' },
        { label: '12 PM', revenue: 2450, orders: 11, volume: 24, peakDish: 'Pav Bhaji & Chaas', status: 'Lunch Rush' },
        { label: '02 PM', revenue: 1680, orders: 7, volume: 16, peakDish: 'Mysore Masala Dosa', status: 'Afternoon' },
        { label: '04 PM', revenue: 1120, orders: 4, volume: 8, peakDish: 'Cold Drink & Chaas', status: 'Snacks' },
        { label: '06 PM', revenue: 2890, orders: 12, volume: 27, peakDish: 'Amul Butter Pav Bhaji', status: 'Early Evening' },
        { label: '08 PM', revenue: 5640, orders: 21, volume: 48, peakDish: 'Bahubali & Jini Dosa', status: '🔥 Mega Peak Dinner' },
        { label: '10 PM', revenue: 3690, orders: 14, volume: 36, peakDish: 'S.P. Atmiya Mysore', status: 'Late Dining' }
      ]
    },
    weekly: {
      title: 'This Week Sales & Volume Trajectory',
      subtitle: 'Weekend surge with 236 dining tickets & ₹54,880 revenue on Sat + Sun',
      total: '₹1,24,680',
      totalOrders: 498,
      totalVolume: 1120,
      points: [
        { label: 'Mon', revenue: 12400, orders: 48, volume: 108, peakDish: 'Mysore Masala Dosa', status: 'Steady Start' },
        { label: 'Tue', revenue: 14200, orders: 55, volume: 124, peakDish: 'Cheese Pav Bhaji', status: 'Regular' },
        { label: 'Wed', revenue: 13800, orders: 51, volume: 116, peakDish: 'Jini Roll Dosa', status: 'Regular' },
        { label: 'Thu', revenue: 15600, orders: 60, volume: 135, peakDish: 'Amul Butter Pav Bhaji', status: 'Above Avg' },
        { label: 'Fri', revenue: 19800, orders: 78, volume: 178, peakDish: 'S.P. Atmiya Mysore', status: 'Pre-Weekend' },
        { label: 'Sat', revenue: 26400, orders: 112, volume: 256, peakDish: 'Bahubali Feast Dosa', status: '🔥 Housefull' },
        { label: 'Sun', revenue: 28480, orders: 124, volume: 283, peakDish: 'Family Combos & Dosa', status: '👑 Record Rush' }
      ]
    },
    monthly: {
      title: 'Monthly Revenue & Volume Milestones',
      subtitle: 'Consistent 24% month-on-month compounding growth with 1,840 dining tickets',
      total: '₹4,86,500',
      totalOrders: 1840,
      totalVolume: 4180,
      points: [
        { label: 'Week 1', revenue: 98000, orders: 380, volume: 860, peakDish: 'Mysore Masala Dosa', status: 'Steady Start' },
        { label: 'Week 2', revenue: 118400, orders: 440, volume: 1010, peakDish: 'Amul Butter Pav Bhaji', status: 'Growth Surge' },
        { label: 'Week 3', revenue: 134200, orders: 510, volume: 1150, peakDish: 'Bahubali Dosa', status: 'Festive Boom' },
        { label: 'Week 4', revenue: 142900, orders: 510, volume: 1160, peakDish: 'S.P. Atmiya Mysore', status: '👑 Month High' }
      ]
    }
  };

  const currentDataset = chartDatasets[timeframe];
  const maxRevenue = Math.max(...currentDataset.points.map(p => p.revenue));
  const maxVolume = Math.max(...currentDataset.points.map(p => p.volume || p.orders * 2.2));
  const activePointIndex = Math.min(selectedPointIndex, currentDataset.points.length - 1);
  const activePoint = currentDataset.points[activePointIndex] || currentDataset.points[0];

  // SVG Spline Wave Calculations
  const numPoints = currentDataset.points.length;
  const svgCoords = currentDataset.points.map((pt, i) => {
    const x = numPoints > 1 ? (i / (numPoints - 1)) * 900 + 50 : 500;
    const value = chartMetric === 'revenue' ? pt.revenue : (pt.volume || pt.orders * 2.2);
    const maxValue = chartMetric === 'revenue' ? maxRevenue : maxVolume;
    const y = 160 - ((value / maxValue) * 120);
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

  // 1. CATEGORY PIE / DONUT BREAKDOWN DATASET
  const categoryStats = useMemo(() => [
    { 
      id: 'cat_mysore', 
      name: 'Mysore Dosa', 
      guj: 'માયસોર ઢોસા', 
      percentage: 38, 
      volume: 486, 
      revenue: 63180, 
      color: '#F59E0B', 
      glow: 'shadow-amber-500/30',
      icon: 'Flame', 
      avgPlatePrice: '₹130',
      topDish: 'Mysore Masala Dosa' 
    },
    { 
      id: 'cat_fancy', 
      name: 'Fancy Dosa', 
      guj: 'ફેન્સી ઢોસા', 
      percentage: 28, 
      volume: 358, 
      revenue: 89500, 
      color: '#8B5CF6', 
      glow: 'shadow-purple-500/30',
      icon: 'Sparkles', 
      avgPlatePrice: '₹250',
      topDish: 'Bahubali Dosa' 
    },
    { 
      id: 'cat_pavbhaji', 
      name: 'Pav Bhaji & Pulao', 
      guj: 'પાંઉભાજી & પુલાવ', 
      percentage: 16, 
      volume: 205, 
      revenue: 18450, 
      color: '#EC4899', 
      glow: 'shadow-pink-500/30',
      icon: 'Utensils', 
      avgPlatePrice: '₹90',
      topDish: 'Amul Butter Pav Bhaji' 
    },
    { 
      id: 'cat_paper', 
      name: 'Plain Paper Dosa', 
      guj: 'પેપર ઢોસા', 
      percentage: 10, 
      volume: 128, 
      revenue: 10240, 
      color: '#10B981', 
      glow: 'shadow-emerald-500/30',
      icon: 'Award', 
      avgPlatePrice: '₹80',
      topDish: 'Cheese Paper Dosa' 
    },
    { 
      id: 'cat_chinese', 
      name: 'Chinese & Starters', 
      guj: 'ચાઈનીઝ & સ્ટાર્ટર્સ', 
      percentage: 8, 
      volume: 102, 
      revenue: 12240, 
      color: '#06B6D4', 
      glow: 'shadow-cyan-500/30',
      icon: 'ShoppingBag', 
      avgPlatePrice: '₹120',
      topDish: 'Veg Manchurian Dry' 
    }
  ], []);

  const totalCategoryVolume = categoryStats.reduce((sum, c) => sum + c.volume, 0);
  const totalCategoryRevenue = categoryStats.reduce((sum, c) => sum + c.revenue, 0);

  // SVG Donut Calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.82
  let accumulatedOffset = 0;
  const donutSegments = categoryStats.map((cat) => {
    const value = pieMetric === 'volume' ? cat.volume : cat.revenue;
    const total = pieMetric === 'volume' ? totalCategoryVolume : totalCategoryRevenue;
    const share = (value / total) * 100;
    const strokeLength = (share / 100) * circumference;
    const dashoffset = -accumulatedOffset;
    accumulatedOffset += strokeLength;

    return {
      ...cat,
      share: share.toFixed(1),
      strokeLength,
      dashoffset
    };
  });

  const activeCategoryData = categoryStats.find(c => c.id === selectedSlice) || categoryStats[0];

  // 2. DISH DEMAND & QUANTITY VOLUME MATRIX DATASET
  const allDishes = useMemo(() => [
    {
      id: 'd_01',
      rank: 1,
      name: 'Mysore Masala Dosa',
      guj: 'માયસોર મસાલા ઢોસા',
      category: 'Mysore Dosa',
      price: 130,
      volumeQty: 342,
      revenue: 44460,
      revenueShare: 23.0,
      prepTime: '10m',
      rating: 4.9,
      velocity: '🔥 High Velocity',
      velocityType: 'hot',
      margin: '68%',
      recommendation: 'Top cash cow. Maintain potato masala quality and promote Amul Cheese addon.'
    },
    {
      id: 'd_02',
      rank: 2,
      name: 'Bahubali Dosa',
      guj: 'બાહુબલી ઢોસા (જૈન ઉપલબ્ધ)',
      category: 'Fancy Dosa',
      price: 298,
      volumeQty: 275,
      revenue: 81950,
      revenueShare: 42.3,
      prepTime: '16m',
      rating: 4.9,
      velocity: '🔥 Mega Revenue King',
      velocityType: 'hot',
      margin: '62%',
      recommendation: 'Highest revenue contributor per table. Highlight on digital table menu standee.'
    },
    {
      id: 'd_03',
      rank: 3,
      name: 'Amul Butter Pav Bhaji',
      guj: 'અમૂલ બટર પાંઉભાજી',
      category: 'Pav Bhaji & Pulao',
      price: 80,
      volumeQty: 254,
      revenue: 20320,
      revenueShare: 10.5,
      prepTime: '8m',
      rating: 4.8,
      velocity: '⚡ Fast Mover',
      velocityType: 'fast',
      margin: '58%',
      recommendation: 'Fastest turn time (8m). Always suggest extra pav bun addon in POS.'
    },
    {
      id: 'd_04',
      rank: 4,
      name: 'Jini Roll Dosa (Cheese)',
      guj: 'જીની રોલ ઢોસા',
      category: 'Fancy Dosa',
      price: 200,
      volumeQty: 215,
      revenue: 43000,
      revenueShare: 22.2,
      prepTime: '12m',
      rating: 4.8,
      velocity: '⚡ High Demand',
      velocityType: 'fast',
      margin: '65%',
      recommendation: 'Viral favorite among youth. Excellent dinner peak volume.'
    },
    {
      id: 'd_05',
      rank: 5,
      name: 'S.P. Atmiya Mysore Dosa',
      guj: 'સ્પે. આત્મીય માયસોર ઢોસા',
      category: 'Mysore Dosa',
      price: 210,
      volumeQty: 185,
      revenue: 38850,
      revenueShare: 20.1,
      prepTime: '13m',
      rating: 5.0,
      velocity: '👑 Chef Signature',
      velocityType: 'signature',
      margin: '71%',
      recommendation: 'Highest profit margin (71%). Recommend to VIP family tables.'
    },
    {
      id: 'd_06',
      rank: 6,
      name: 'Surti Gotala Dosa',
      guj: 'સુરતી ગોટાલા ઢોસા',
      category: 'Fancy Dosa',
      price: 220,
      volumeQty: 148,
      revenue: 32560,
      revenueShare: 16.8,
      prepTime: '14m',
      rating: 4.7,
      velocity: '⚡ Fast Mover',
      velocityType: 'fast',
      margin: '64%',
      recommendation: 'Popular spicy dinner choice. Keep grated paneer prep ready by 7 PM.'
    },
    {
      id: 'd_07',
      rank: 7,
      name: 'Cheese Mysore Dosa',
      guj: 'ચીઝ માયસોર ઢોસા',
      category: 'Mysore Dosa',
      price: 160,
      volumeQty: 142,
      revenue: 22720,
      revenueShare: 11.7,
      prepTime: '11m',
      rating: 4.8,
      velocity: '⭐ Steady',
      velocityType: 'steady',
      margin: '61%',
      recommendation: 'Solid weekend orders. Ensure Amul cheese stock is replenished.'
    },
    {
      id: 'd_08',
      rank: 8,
      name: 'Sp. Atmiya Pulao',
      guj: 'સ્પે. આત્મીય પુલાવ',
      category: 'Pav Bhaji & Pulao',
      price: 150,
      volumeQty: 95,
      revenue: 14250,
      revenueShare: 7.4,
      prepTime: '10m',
      rating: 4.7,
      velocity: '⭐ Steady',
      velocityType: 'steady',
      margin: '60%',
      recommendation: 'Preferred dinner rice item. Good pairing with chaas.'
    },
    // Underperforming / Dead Stock items with AI Recommendations
    {
      id: 'd_09',
      rank: 9,
      name: 'Spring Roll Dosa (Chinese)',
      guj: 'સ્પ્રિંગ રોલ ઢોસા',
      category: 'Chinese & Starters',
      price: 250,
      volumeQty: 18,
      revenue: 4500,
      revenueShare: 2.3,
      prepTime: '13m',
      rating: 4.2,
      velocity: '⚠️ Low Demand',
      velocityType: 'low',
      margin: '52%',
      recommendation: '💡 Attention: Underperforming. Create a "Chinese Combo (Spring Roll + Manchurian)" at ₹299 to drive trial.'
    },
    {
      id: 'd_10',
      rank: 10,
      name: 'Veg Hakka Noodles',
      guj: 'વેજ હક્કા નૂડલ્સ',
      category: 'Chinese & Starters',
      price: 120,
      volumeQty: 14,
      revenue: 1680,
      revenueShare: 0.9,
      prepTime: '10m',
      rating: 4.1,
      velocity: '⚠️ Dead Stock Risk',
      velocityType: 'low',
      margin: '48%',
      recommendation: '💡 Attention: Low demand. Feature on top banner during evening 4-7 PM student snack hour or consider replacing with Schezwan Rice.'
    },
    {
      id: 'd_11',
      rank: 11,
      name: 'Packaged Mineral Water (1L)',
      guj: 'મિનરલ વોટર',
      category: 'Beverages',
      price: 20,
      volumeQty: 22,
      revenue: 440,
      revenueShare: 0.2,
      prepTime: '1m',
      rating: 4.0,
      velocity: '💤 Slow Mover',
      velocityType: 'low',
      margin: '35%',
      recommendation: '💡 Low profit ticket. Introduce Freshly Brewed South Indian Filter Coffee (₹35) and Fresh Mint Chaas (₹25) for 5x higher margins.'
    }
  ], []);

  const maxDishVolume = Math.max(...allDishes.map(d => d.volumeQty));

  const filteredDishes = useMemo(() => {
    return allDishes
      .filter(dish => {
        if (demandTab === 'bestsellers') return dish.rank <= 8;
        if (demandTab === 'low_demand') return dish.rank >= 9;
        return true;
      })
      .filter(dish => {
        if (selectedCategory === 'all') return true;
        return dish.category.toLowerCase().includes(selectedCategory.toLowerCase());
      })
      .filter(dish => {
        if (!dishSearch.trim()) return true;
        const q = dishSearch.toLowerCase();
        return dish.name.toLowerCase().includes(q) || dish.guj.includes(q) || dish.category.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (dishSortBy === 'volume') return b.volumeQty - a.volumeQty;
        if (dishSortBy === 'revenue') return b.revenue - a.revenue;
        if (dishSortBy === 'margin') return parseInt(b.margin) - parseInt(a.margin);
        return a.rank - b.rank;
      });
  }, [allDishes, demandTab, selectedCategory, dishSearch, dishSortBy]);

  // Hourly Peak Rush Heatmap Data
  const rushHours = [
    { hour: '10 AM - 12 PM', session: 'Morning Breakfast', orders: 16, plates: 33, rush: 'Medium', speed: '8m avg', load: '35%', tip: 'Idli & Medu Vada counters active' },
    { hour: '12 PM - 03 PM', session: 'Lunch Rush', orders: 25, plates: 56, rush: 'High', speed: '11m avg', load: '65%', tip: 'Pav Bhaji & Mysore Dosa combo peak' },
    { hour: '03 PM - 07 PM', session: 'Afternoon & Snacks', orders: 19, plates: 43, rush: 'Steady', speed: '9m avg', load: '45%', tip: 'Cold Drinks, Chaas & Light Dosa' },
    { hour: '07 PM - 10 PM', session: '🔥 Mega Peak Dinner', orders: 54, plates: 126, rush: 'HOUSEFULL', speed: '14m avg', load: '95%', tip: 'Bahubali, Gotala, Jini Roll peak demand. 3 cooks on tawa' },
    { hour: '10 PM - 11 PM', session: 'Late Dining & Takeout', orders: 10, plates: 21, rush: 'Low', speed: '8m avg', load: '25%', tip: 'Kitchen closing & parcel orders' },
  ];

  // Fetch live Supabase data
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
    <div className={`space-y-6 pb-16 font-sans transition-colors duration-300 ${palette.textPrimary}`}>
      
      {/* 1. EXECUTIVE IDENTITY & TELEMETRY BAR */}
      <div className={`p-6 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all`}>
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-xl tracking-tight shadow-lg shadow-orange-500/20 shrink-0">
            DR
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
                DARSHIT RANA
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${isDark ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                Age 19 • Primary Restaurant Owner
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Supabase Cloud (Mumbai ap-south-1)</span>
              </span>
            </div>
            <p className={`text-xs ${palette.textSecondary} font-medium mt-1`}>
              Atmiya Dosa Hub • Executive Food Intelligence & Restaurant Operations (Petlad, Anand)
            </p>
          </div>
        </div>

        {/* Theme Pill Switcher & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          
          {/* Quick Theme Switcher */}
          {onThemeChange && (
            <div className={`flex items-center p-1 rounded-2xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'} text-xs font-bold`}>
              <button
                onClick={() => onThemeChange('obsidian')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  theme === 'obsidian' ? 'bg-orange-500 text-white shadow-xs font-black' : `${palette.textSecondary} hover:text-white`
                }`}
                title="Obsidian Dark Luxe"
              >
                <span>🌙 Obsidian</span>
              </button>
              <button
                onClick={() => onThemeChange('sapphire')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  theme === 'sapphire' ? 'bg-indigo-600 text-white shadow-xs font-black' : `${palette.textSecondary} hover:text-white`
                }`}
                title="Deep Royal Sapphire"
              >
                <span>💎 Sapphire</span>
              </button>
              <button
                onClick={() => onThemeChange('light')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  theme === 'light' ? 'bg-white text-zinc-900 shadow-xs font-black' : `${palette.textSecondary} hover:text-zinc-900`
                }`}
                title="Titanium Light"
              >
                <span>☀️ Light</span>
              </button>
            </div>
          )}

          <button
            onClick={onOpenGenerateQR}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl border ${isDark ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'} text-xs font-bold transition shadow-xs cursor-pointer`}
          >
            <QrCode className="w-4 h-4 text-orange-400" />
            <span>Floor & QRs</span>
          </button>
          
          <button
            onClick={onOpenAddItem}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold transition shadow-md shadow-orange-500/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Menu Item</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR REFINED EXECUTIVE KPI TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Metric 1: Total Revenue */}
        <div className={`p-5 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-lg transition-all`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${palette.textSecondary}`}>Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono">
              {currentDataset.total}
            </span>
          </div>
          <div className="mt-2 flex items-center text-[11px] font-bold text-emerald-400 space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs last period</span>
          </div>
        </div>

        {/* Metric 2: Order & Plate Volume */}
        <div className={`p-5 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-lg transition-all`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${palette.textSecondary}`}>Volume Tracked</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono">
              {currentDataset.totalOrders} <span className="text-sm font-bold text-slate-500">tickets</span>
            </span>
          </div>
          <div className={`mt-2 text-[11px] font-semibold ${palette.textSecondary}`}>
            {currentDataset.totalVolume} Total Plates Served
          </div>
        </div>

        {/* Metric 3: Avg Ticket Size */}
        <div className={`p-5 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-lg transition-all`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${palette.textSecondary}`}>Avg Ticket (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono">
              ₹249.32
            </span>
          </div>
          <div className="mt-2 text-[11px] font-bold text-emerald-400">
            Target ₹220+ exceeded by 13%
          </div>
        </div>

        {/* Metric 4: Floor Utilization */}
        <div className={`p-5 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-lg transition-all`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${palette.textSecondary}`}>Active Occupancy</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono">
              3 / 10 Tables
            </span>
          </div>
          <div className="mt-2 text-[11px] font-bold text-blue-400">
            30% Current Floor Seated
          </div>
        </div>

      </div>

      {/* 3. DUAL-METRIC SALES VELOCITY & ORDER VOLUME ENGINE (NO CHEAP CAPSULES!) */}
      <div className={`p-6 sm:p-7 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-xl space-y-5 transition-all`}>
        
        {/* Header with Metric & Timeframe Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-orange-400" />
              <h2 className="text-base sm:text-lg font-black font-heading">
                {currentDataset.title}
              </h2>
            </div>
            <p className={`text-xs ${palette.textSecondary} font-medium mt-0.5`}>
              {currentDataset.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Metric Mode Toggle: Revenue vs Volume */}
            <div className={`flex items-center p-1 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'} text-xs font-bold`}>
              <button
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  chartMetric === 'revenue' 
                    ? 'bg-orange-500 text-white shadow-xs font-black' 
                    : `${palette.textSecondary} hover:text-white`
                }`}
              >
                <span>₹ Revenue</span>
              </button>
              <button
                onClick={() => setChartMetric('volume')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  chartMetric === 'volume' 
                    ? 'bg-purple-600 text-white shadow-xs font-black' 
                    : `${palette.textSecondary} hover:text-white`
                }`}
              >
                <span>📦 Order Volume</span>
              </button>
            </div>

            {/* Timeframe Pill Switcher */}
            <div className={`flex items-center p-1 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'} text-xs font-bold`}>
              <button
                onClick={() => { setTimeframe('hourly'); setSelectedPointIndex(5); }}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  timeframe === 'hourly' 
                    ? 'bg-slate-800 text-white font-black shadow-xs' 
                    : `${palette.textSecondary} hover:text-white`
                }`}
              >
                Today (Hourly)
              </button>
              <button
                onClick={() => { setTimeframe('weekly'); setSelectedPointIndex(5); }}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  timeframe === 'weekly' 
                    ? 'bg-slate-800 text-white font-black shadow-xs' 
                    : `${palette.textSecondary} hover:text-white`
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => { setTimeframe('monthly'); setSelectedPointIndex(3); }}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  timeframe === 'monthly' 
                    ? 'bg-slate-800 text-white font-black shadow-xs' 
                    : `${palette.textSecondary} hover:text-white`
                }`}
              >
                This Month
              </button>
            </div>

          </div>
        </div>

        {/* Active Inspection Milestone Card */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border-slate-800' : 'bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white border-orange-200/60'} flex flex-wrap items-center justify-between gap-3 text-xs`}>
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-md shadow-orange-500/20 font-mono">
              {activePoint.label}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-black text-base font-mono">
                  {chartMetric === 'revenue' 
                    ? `₹${activePoint.revenue.toLocaleString('en-IN')}`
                    : `${activePoint.volume || activePoint.orders * 2} Plates`}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 font-bold text-[10px] border border-orange-500/30">
                  {activePoint.status}
                </span>
              </div>
              <p className={`text-[11px] ${palette.textSecondary} mt-0.5`}>
                Tickets: <strong className="text-slate-200">{activePoint.orders} orders</strong> • Top Demanded: <strong className="text-amber-400">{activePoint.peakDish}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className={`px-2.5 py-1 rounded-xl ${isDark ? 'bg-slate-800/80 text-slate-300' : 'bg-white text-slate-700'} border ${palette.cardBorder} font-mono font-bold`}>
              ⚡ Avg Turn: 18m
            </span>
            <span className="text-slate-500 hidden sm:inline">
              Click any column below to inspect that time milestone
            </span>
          </div>
        </div>

        {/* Precision Modern Chart Canvas */}
        <div className="pt-2 relative">
          
          {/* Subtle Grid Guidelines with Exact Axis Units */}
          <div className="absolute inset-x-0 top-10 bottom-14 flex flex-col justify-between pointer-events-none opacity-30">
            <div className="border-b border-dashed border-slate-700 w-full flex justify-end pr-2 text-[10px] font-mono text-slate-400">
              {chartMetric === 'revenue' ? `₹${maxRevenue.toLocaleString('en-IN')}` : `${maxVolume} Plates`}
            </div>
            <div className="border-b border-dashed border-slate-700 w-full flex justify-end pr-2 text-[10px] font-mono text-slate-400">
              {chartMetric === 'revenue' ? `₹${Math.round(maxRevenue * 0.66).toLocaleString('en-IN')}` : `${Math.round(maxVolume * 0.66)} Plates`}
            </div>
            <div className="border-b border-dashed border-slate-700 w-full flex justify-end pr-2 text-[10px] font-mono text-slate-400">
              {chartMetric === 'revenue' ? `₹${Math.round(maxRevenue * 0.33).toLocaleString('en-IN')}` : `${Math.round(maxVolume * 0.33)} Plates`}
            </div>
            <div className="border-b border-dashed border-slate-700 w-full flex justify-end pr-2 text-[10px] font-mono text-slate-400">
              0
            </div>
          </div>

          {/* Ambient SVG Spline Wave */}
          <div className="absolute inset-x-0 top-6 bottom-14 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartMetric === 'revenue' ? '#F59E0B' : '#8B5CF6'} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={chartMetric === 'revenue' ? '#F59E0B' : '#8B5CF6'} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#velocityGrad)" />
              <path 
                d={splinePath} 
                fill="none" 
                stroke={chartMetric === 'revenue' ? '#F59E0B' : '#8B5CF6'} 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
              {svgCoords.map((c, i) => (
                <circle 
                  key={i} 
                  cx={c.x} 
                  cy={c.y} 
                  r={activePointIndex === i ? 6 : 3.5} 
                  fill={activePointIndex === i ? '#ffffff' : (chartMetric === 'revenue' ? '#F59E0B' : '#8B5CF6')} 
                  stroke={chartMetric === 'revenue' ? '#F59E0B' : '#8B5CF6'} 
                  strokeWidth="2.5" 
                />
              ))}
            </svg>
          </div>

          {/* Precision Sleek Interactive Data Columns */}
          <div 
            className="relative z-10 grid gap-2 sm:gap-4 items-end h-60 sm:h-64 pb-2"
            style={{ gridTemplateColumns: `repeat(${currentDataset.points.length}, minmax(0, 1fr))` }}
          >
            {currentDataset.points.map((pt, index) => {
              const isSelected = activePointIndex === index;
              const value = chartMetric === 'revenue' ? pt.revenue : (pt.volume || pt.orders * 2.2);
              const maxValue = chartMetric === 'revenue' ? maxRevenue : maxVolume;
              const heightPercent = Math.max(16, Math.round((value / maxValue) * 100));

              return (
                <div 
                  key={index}
                  onClick={() => setSelectedPointIndex(index)}
                  className="flex flex-col items-center justify-end h-full group cursor-pointer relative"
                >
                  {/* Floating Value Tag */}
                  <div className={`mb-2 px-2 py-0.5 rounded-lg text-[10px] font-mono font-black transition-all whitespace-nowrap shadow-sm ${
                    isSelected 
                      ? 'bg-orange-500 text-white scale-110 shadow-orange-500/40 ring-2 ring-orange-400/30' 
                      : `${isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-zinc-700 border-zinc-200'} border group-hover:border-orange-400 group-hover:text-white`
                  }`}>
                    {chartMetric === 'revenue'
                      ? (pt.revenue >= 100000 ? `₹${(pt.revenue / 100000).toFixed(2)}L` : (pt.revenue >= 1000 ? `₹${(pt.revenue / 1000).toFixed(1)}k` : `₹${pt.revenue}`))
                      : `${pt.volume || pt.orders * 2}p`}
                  </div>

                  {/* Sleek Vertical Pillar Column */}
                  <div className={`w-full max-w-[42px] h-36 sm:h-40 flex flex-col justify-end items-center rounded-xl p-1 transition-all ${
                    isDark ? 'bg-slate-900/70 border border-slate-800/80 group-hover:border-slate-700' : 'bg-slate-100 border border-slate-200/70'
                  }`}>
                    <div 
                      style={{ height: `${heightPercent}%`, minHeight: '18px' }}
                      className={`w-full rounded-lg transition-all duration-300 relative overflow-hidden flex flex-col justify-between items-center py-1 ${
                        isSelected 
                          ? (chartMetric === 'revenue' 
                              ? 'bg-gradient-to-t from-orange-600 via-amber-500 to-amber-300 shadow-md shadow-orange-500/40' 
                              : 'bg-gradient-to-t from-purple-700 via-purple-500 to-indigo-300 shadow-md shadow-purple-500/40')
                          : (isDark 
                              ? 'bg-gradient-to-t from-slate-800 via-slate-700 to-slate-700 group-hover:from-orange-500/80 group-hover:to-amber-400' 
                              : 'bg-gradient-to-t from-zinc-300 to-zinc-200 group-hover:from-orange-400 group-hover:to-amber-300')
                      }`}
                    >
                      {/* Apex glow dot */}
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white shadow-xs' : 'bg-white/40'}`} />
                    </div>
                  </div>

                  {/* Column Bottom Label */}
                  <div className="text-center mt-2">
                    <span className={`block text-xs font-bold transition-colors ${
                      isSelected ? 'text-orange-400 font-black' : `${palette.textSecondary} group-hover:text-white`
                    }`}>
                      {pt.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {pt.orders} tickets
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* 4. MAIN OPERATIONS TABS NAVIGATION */}
      <div className={`flex items-center space-x-2 border-b ${palette.cardBorder} pb-3 overflow-x-auto`}>
        <button
          onClick={() => setActiveTab('demand')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'demand'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
              : `${isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-white hover:bg-slate-100 text-zinc-700'} border ${palette.cardBorder}`
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Dish Demand & Volume Matrix ({allDishes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pie_chart')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'pie_chart'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : `${isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-white hover:bg-slate-100 text-zinc-700'} border ${palette.cardBorder}`
          }`}
        >
          <PieChartIcon className="w-3.5 h-3.5" />
          <span>Category Volume Donut / Pie ({categoryStats.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rush_hours')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'rush_hours'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : `${isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-white hover:bg-slate-100 text-zinc-700'} border ${palette.cardBorder}`
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Peak Dining Rush Heatmap</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'sessions'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
              : `${isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-white hover:bg-slate-100 text-zinc-700'} border ${palette.cardBorder}`
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Live Table Sessions ({displaySessions.filter(s => s.status === 'ACTIVE').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('crm')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'crm'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : `${isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-white hover:bg-slate-100 text-zinc-700'} border ${palette.cardBorder}`
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customer CRM & VIPs ({crmGuests.length})</span>
        </button>
      </div>

      {/* TAB 1: DISH DEMAND & QUANTITY VOLUME MATRIX (DIRECT USER REQUIREMENT!) */}
      {activeTab === 'demand' && (
        <div className="space-y-5">
          
          {/* Controls Bar: Sub-Tabs, Search, and Category Filters */}
          <div className={`p-4 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4`}>
            
            {/* Filter Sub-Tabs */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDemandTab('bestsellers')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  demandTab === 'bestsellers'
                    ? 'bg-orange-500 text-white shadow-sm font-black'
                    : `${palette.textSecondary} hover:text-white`
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>🔥 Most Demanded (Bestsellers)</span>
              </button>

              <button
                onClick={() => setDemandTab('low_demand')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  demandTab === 'low_demand'
                    ? 'bg-rose-500 text-white shadow-sm font-black'
                    : `${palette.textSecondary} hover:text-white`
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>⚠️ Low Demand / Dead Stock (Action Needed)</span>
              </button>

              <button
                onClick={() => setDemandTab('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  demandTab === 'all'
                    ? 'bg-slate-800 text-white shadow-sm font-black'
                    : `${palette.textSecondary} hover:text-white`
                }`}
              >
                All Menu Items ({allDishes.length})
              </button>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter dish by name..."
                  value={dishSearch}
                  onChange={(e) => setDishSearch(e.target.value)}
                  className={`pl-9 pr-3 py-1.5 rounded-xl ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500' : 'bg-slate-100 border-slate-200 text-zinc-900'} border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-orange-500`}
                />
              </div>

              {/* Sort By Switcher */}
              <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-zinc-600'} text-xs font-bold`}>
                <span className="px-2 text-[10px] uppercase font-bold text-slate-500">Sort:</span>
                <button
                  onClick={() => setDishSortBy('volume')}
                  className={`px-2.5 py-1 rounded-lg transition ${dishSortBy === 'volume' ? 'bg-orange-500 text-white' : 'hover:text-white'}`}
                >
                  Volume (Qty)
                </button>
                <button
                  onClick={() => setDishSortBy('revenue')}
                  className={`px-2.5 py-1 rounded-lg transition ${dishSortBy === 'revenue' ? 'bg-orange-500 text-white' : 'hover:text-white'}`}
                >
                  Revenue (₹)
                </button>
                <button
                  onClick={() => setDishSortBy('margin')}
                  className={`px-2.5 py-1 rounded-lg transition ${dishSortBy === 'margin' ? 'bg-orange-500 text-white' : 'hover:text-white'}`}
                >
                  Margin %
                </button>
              </div>
            </div>

          </div>

          {/* Full Particular Records Matrix Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDishes.map((dish) => {
              const isTop3 = dish.rank <= 3;
              const isLow = dish.rank >= 9;
              const volumePercent = Math.round((dish.volumeQty / maxDishVolume) * 100);

              return (
                <div 
                  key={dish.id}
                  className={`p-5 rounded-3xl ${palette.cardBg} border ${isLow ? 'border-rose-500/30 ring-1 ring-rose-500/20' : (isTop3 ? 'border-amber-500/40 ring-1 ring-amber-500/20' : palette.cardBorder)} shadow-xl space-y-3.5 transition-all hover:scale-[1.01]`}
                >
                  {/* Card Header: Rank, Name, Category, Price */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 font-mono shadow-md ${
                        dish.rank === 1 
                          ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-amber-500/30' 
                          : dish.rank === 2 
                          ? 'bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-900 shadow-slate-300/30' 
                          : dish.rank === 3 
                          ? 'bg-gradient-to-tr from-amber-700 to-orange-500 text-white shadow-amber-700/30' 
                          : (isLow ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-300')
                      }`}>
                        #{dish.rank}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-black tracking-tight">{dish.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isLow 
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {dish.velocity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {dish.guj} • <span className="text-amber-400 font-bold">{dish.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black font-mono">₹{dish.price}</span>
                      <span className="block text-[10px] text-emerald-400 font-bold">{dish.margin} Margin</span>
                    </div>
                  </div>

                  {/* Volume vs Revenue Metrics Bar */}
                  <div className={`p-3 rounded-2xl ${palette.innerBox} space-y-2`}>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Total Plates Sold: </span>
                        <strong className="text-slate-100 font-mono font-black">{dish.volumeQty} plates</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400">Total Revenue: </span>
                        <strong className="text-amber-400 font-mono font-black">₹{dish.revenue.toLocaleString('en-IN')}</strong>
                        <span className="text-[10px] text-slate-500 ml-1 font-mono">({dish.revenueShare}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar of Volume */}
                    <div className="w-full bg-slate-800/90 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLow 
                            ? 'bg-rose-500' 
                            : (isTop3 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-emerald-500')
                        }`}
                        style={{ width: `${volumePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* AI Recommendation / Chef Insight */}
                  <div className={`p-3 rounded-2xl text-[11px] leading-relaxed border ${
                    isLow 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                      : (isTop3 ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-slate-800/60 border-slate-700/60 text-slate-300')
                  }`}>
                    {dish.recommendation}
                  </div>

                  {/* Quick Card Footer: Rating, Prep Time */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>⭐ {dish.rating} Customer Rating</span>
                    <span>⏱️ {dish.prepTime} Avg Prep Time</span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: INTERACTIVE CATEGORY VOLUME & REVENUE DONUT / PIE CHART (DIRECT USER REQUIREMENT!) */}
      {activeTab === 'pie_chart' && (
        <div className="space-y-6">
          
          <div className={`p-6 sm:p-7 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-xl space-y-6`}>
            
            {/* Header & Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <PieChartIcon className="w-5 h-5 text-purple-400" />
                  <h2 className="text-base sm:text-lg font-black font-heading">
                    Category Volume & Revenue Distribution
                  </h2>
                </div>
                <p className={`text-xs ${palette.textSecondary} font-medium mt-0.5`}>
                  Visualizing dining demand share across all 5 culinary categories ({totalCategoryVolume} plates total)
                </p>
              </div>

              {/* Metric Toggle: Volume (Plates) vs Revenue (₹) */}
              <div className={`flex items-center p-1 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'} text-xs font-bold`}>
                <button
                  onClick={() => setPieMetric('volume')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                    pieMetric === 'volume' 
                      ? 'bg-purple-600 text-white shadow-xs font-black' 
                      : `${palette.textSecondary} hover:text-white`
                  }`}
                >
                  <span>📦 By Volume (Plates)</span>
                </button>
                <button
                  onClick={() => setPieMetric('revenue')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                    pieMetric === 'revenue' 
                      ? 'bg-orange-500 text-white shadow-xs font-black' 
                      : `${palette.textSecondary} hover:text-white`
                  }`}
                >
                  <span>₹ By Revenue Share</span>
                </button>
              </div>
            </div>

            {/* Donut Chart + Deep Breakdown Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Interactive SVG Donut Visual */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative p-4">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                  <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 transform">
                    {donutSegments.map((segment) => {
                      const isHovered = hoveredSlice === segment.id;
                      const isSelected = selectedSlice === segment.id;

                      return (
                        <circle
                          key={segment.id}
                          cx="100"
                          cy="100"
                          r={radius}
                          fill="none"
                          stroke={segment.color}
                          strokeWidth={isSelected ? '28' : (isHovered ? '24' : '20')}
                          strokeDasharray={`${segment.strokeLength} ${circumference}`}
                          strokeDashoffset={segment.dashoffset}
                          strokeLinecap="round"
                          onClick={() => setSelectedSlice(segment.id)}
                          onMouseEnter={() => setHoveredSlice(segment.id)}
                          onMouseLeave={() => setHoveredSlice(null)}
                          className="cursor-pointer transition-all duration-300 hover:opacity-100"
                          style={{
                            filter: isSelected ? `drop-shadow(0px 0px 8px ${segment.color})` : 'none',
                            opacity: (selectedSlice && !isSelected && !isHovered) ? 0.75 : 1
                          }}
                        />
                      );
                    })}
                  </svg>

                  {/* Donut Center Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {pieMetric === 'volume' ? 'Total Volume' : 'Total Revenue'}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mt-0.5">
                      {pieMetric === 'volume' ? `${totalCategoryVolume}p` : `₹${(totalCategoryRevenue / 1000).toFixed(1)}k`}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold mt-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      100% Demand Tracked
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-2 font-medium">
                  💡 Click or hover any donut slice to inspect category performance
                </p>
              </div>

              {/* Right Column: Category Breakdown Cards & Active Selection */}
              <div className="lg:col-span-7 space-y-3">
                
                {/* Active Inspected Category Callout Banner */}
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} flex items-center justify-between`}>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full shrink-0 shadow-md"
                      style={{ backgroundColor: activeCategoryData.color }}
                    />
                    <div>
                      <h4 className="text-sm font-black">{activeCategoryData.name} ({activeCategoryData.guj})</h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Top Demand Item: <strong className="text-white">{activeCategoryData.topDish}</strong> • Avg Price: {activeCategoryData.avgPlatePrice}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black font-mono text-white">
                      {pieMetric === 'volume' ? `${activeCategoryData.volume} Plates` : `₹${activeCategoryData.revenue.toLocaleString('en-IN')}`}
                    </span>
                    <span className="block text-[10px] text-emerald-400 font-bold">
                      {activeCategoryData.percentage}% Demand Share
                    </span>
                  </div>
                </div>

                {/* List of all categories with progress bars */}
                <div className="space-y-2.5">
                  {donutSegments.map((cat, idx) => {
                    const isSelected = selectedSlice === cat.id;

                    return (
                      <div 
                        key={cat.id}
                        onClick={() => setSelectedSlice(cat.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected 
                            ? 'bg-slate-800/90 border-slate-700 shadow-md ring-1 ring-slate-600' 
                            : `${isDark ? 'bg-slate-900/50 hover:bg-slate-800/50 border-slate-800' : 'bg-white hover:bg-slate-50 border-slate-200'}`
                        }`}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <span className="font-mono font-bold text-xs text-slate-500 w-4">#{idx + 1}</span>
                          <div 
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: cat.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold truncate">{cat.name}</span>
                              <span className="font-mono font-black text-slate-200">
                                {pieMetric === 'volume' ? `${cat.volume} plates` : `₹${cat.revenue.toLocaleString('en-IN')}`}
                              </span>
                            </div>
                            
                            {/* Proportional Bar */}
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${cat.share}%`, backgroundColor: cat.color }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="text-right pl-3 shrink-0">
                          <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-slate-800 text-slate-300 border border-slate-700">
                            {cat.share}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 3: HOURLY PEAK DINING RUSH HEATMAP */}
      {activeTab === 'rush_hours' && (
        <div className="space-y-4">
          <div className={`p-6 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-xl space-y-4`}>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-base font-black font-heading">Kitchen Load & Rush Hour Heatmap</h3>
                <p className={`text-xs ${palette.textSecondary} font-medium`}>
                  Historical order frequency to optimize tawa preparation and staff allocation
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {rushHours.map((slot, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    slot.rush === 'HOUSEFULL' 
                      ? 'bg-rose-500/10 border-rose-500/30' 
                      : (slot.rush === 'High' ? 'bg-amber-500/10 border-amber-500/30' : `${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`)
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs font-mono">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm">{slot.hour}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          slot.rush === 'HOUSEFULL' ? 'bg-rose-500 text-white' : (slot.rush === 'High' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300')
                        }`}>
                          {slot.rush}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{slot.session}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tickets:</span>
                      <strong className="text-slate-100">{slot.orders} orders</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Volume:</span>
                      <strong className="text-amber-400">{slot.plates} plates</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Turnaround:</span>
                      <strong className="text-emerald-400">{slot.speed}</strong>
                    </div>
                    <div className="min-w-[120px]">
                      <span className="text-slate-400 block text-[10px]">Kitchen Load ({slot.load}):</span>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full ${slot.rush === 'HOUSEFULL' ? 'bg-rose-500' : 'bg-amber-500'}`}
                          style={{ width: slot.load }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[11px] max-w-xs">
                    💡 {slot.tip}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVE TABLE SESSIONS (LIVE FLOOR RECOVERY) */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          
          {/* Architecture Guardrail Banner */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-zinc-50 border-zinc-200'} flex items-center justify-between text-xs`}>
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className={palette.textSecondary}>
                <strong className="text-white">Persistent Session Rule Active:</strong> Customer browser refresh does not lose order state. Sessions terminate only upon food delivery and bill settlement.
              </span>
            </div>
            <button 
              onClick={fetchLiveSupabaseData}
              className={`px-3 py-1.5 rounded-xl border ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-white hover:bg-slate-100 text-zinc-900 border-zinc-300'} font-bold text-[11px] transition cursor-pointer flex items-center space-x-1`}
            >
              <RefreshCw className="w-3 h-3 text-orange-400" />
              <span>Sync Live DB</span>
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
                  className={`p-5 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-xl bg-orange-500 text-slate-950 font-black text-sm">
                          {tableNum}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {sess.session_code || 'SESS-LIVE'}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isPaid 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {isPaid ? 'PAID (Online Gateway)' : 'UNPAID (Cash On Table)'}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="mt-3.5 pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-100">{sess.customer_name || 'Walk-in Guest'}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{sess.customer_phone || 'No phone'}</span>
                      </div>
                    </div>

                    {/* Order summary */}
                    <div className={`mt-3 p-3 rounded-2xl ${palette.innerBox} text-xs text-slate-300 font-medium`}>
                      {sess.items_summary || '1x Mysore Masala Dosa, 1x Amul Butter Pav Bhaji'}
                    </div>

                    {/* Bill amount */}
                    <div className="mt-3.5 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Bill</span>
                      <span className="text-xl font-black font-mono text-emerald-400">
                        ₹{(sess.total_amount || 210).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center space-x-2">
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
                      className={`flex-1 py-2.5 rounded-xl border ${isDark ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-zinc-800'} text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer`}
                    >
                      <Receipt className="w-3.5 h-3.5 text-slate-400" />
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

      {/* TAB 5: CUSTOMER CRM & VIP DIRECTORY */}
      {activeTab === 'crm' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
            <div>
              <h3 className="text-sm font-black font-heading">Guest Directory & Lifetime Spend CRM</h3>
              <p className={`text-xs ${palette.textSecondary} font-medium`}>
                Ground-truth customer profiles with visit counts, favorite dishes, and 1-tap WhatsApp promo links
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by guest name or phone..."
                value={crmSearch}
                onChange={(e) => setCrmSearch(e.target.value)}
                className={`pl-9 pr-3 py-1.5 rounded-xl ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500' : 'bg-slate-100 border-slate-200 text-zinc-900'} border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-orange-500`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crmGuests.map((guest) => (
              <div 
                key={guest.id}
                className={`p-5 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-lg space-y-3 hover:border-slate-700 transition`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm">{guest.name}</h4>
                    <span className="text-xs text-slate-400 font-mono">{guest.phone}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    guest.tier.includes('Platinum') 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                      : guest.tier.includes('Gold') 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {guest.tier}
                  </span>
                </div>

                <div className={`p-3 rounded-2xl ${palette.innerBox} space-y-1.5 text-xs`}>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Visits:</span>
                    <strong className="text-slate-200 font-mono">{guest.visits} times</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lifetime Spend:</span>
                    <strong className="text-emerald-400 font-mono font-black">₹{guest.total_spent}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Favorite:</span>
                    <strong className="text-amber-400 truncate max-w-[150px]">{guest.favorite}</strong>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Last visit: {guest.last_visit}</span>
                  <a
                    href={`https://wa.me/${guest.phone.replace(/[^0-9]/g, '')}?text=Namaste%20${encodeURIComponent(guest.name)}%2C%20Atmiya%20Dosa%20Hub%20welcomes%20you%20back%20with%20a%20special%20festive%20treat%20today!`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 font-bold transition flex items-center space-x-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PRINTABLE TAX INVOICE & THERMAL RECEIPT MODAL */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-md w-full shadow-2xl border p-6 space-y-4 relative animate-in fade-in zoom-in-95 ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-zinc-200 text-zinc-900'}`}>
            
            <button
              onClick={() => setSelectedReceiptOrder(null)}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 absolute top-4 right-4 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Body */}
            <div id="printable-receipt" className="p-5 rounded-2xl bg-white border border-zinc-200 font-mono text-xs space-y-3 text-zinc-900">
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

              <div className="text-center text-[10px] text-zinc-500">
                Payment: {selectedReceiptOrder.payment_method} ({selectedReceiptOrder.payment_status})
                <br />
                Thank you for dining with Atmiya Dosa Hub! Visit again.
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-orange-600/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill (KOT / Thermal)</span>
              </button>
              <button
                onClick={() => {
                  alert('Tax Invoice downloaded to receipts folder.');
                  setSelectedReceiptOrder(null);
                }}
                className={`py-2.5 px-4 rounded-xl border ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-zinc-700 border-zinc-200'} font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer`}
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
