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
  Eye,
  Sliders,
  Settings,
  Check,
  Edit2,
  ToggleLeft,
  ToggleRight,
  SlidersHorizontal,
  ChevronDown
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
  theme = 'light',
  onThemeChange,
  onNavigate,
  onOpenAddOrder,
  onOpenAddItem,
  onOpenGenerateQR,
  onOpenApplyCoupon
}) {
  // 1. Dashboard Customization State (persisted in localStorage)
  const [dashboardConfig, setDashboardConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_dashboard_config');
      return saved ? JSON.parse(saved) : {
        showKpis: true,
        showPieChart: true,
        showSalesWave: true,
        showItemCommandCenter: true,
        showLiveTables: true,
        showRushHeatmap: true,
        chartType: 'donut', // 'donut' | 'pie'
        viewDensity: 'standard' // 'standard' | 'compact'
      };
    } catch {
      return {
        showKpis: true,
        showPieChart: true,
        showSalesWave: true,
        showItemCommandCenter: true,
        showLiveTables: true,
        showRushHeatmap: true,
        chartType: 'donut',
        viewDensity: 'standard'
      };
    }
  });

  const updateConfig = (key, val) => {
    const updated = { ...dashboardConfig, [key]: val };
    setDashboardConfig(updated);
    try {
      localStorage.setItem('admin_dashboard_config', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // 2. Editable Daily Target Sales Goal (persisted in localStorage)
  const [dailyTarget, setDailyTarget] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_daily_sales_target');
      return saved ? Number(saved) : 40000;
    } catch {
      return 40000;
    }
  });
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInputVal, setTargetInputVal] = useState(dailyTarget);

  const handleSaveDailyTarget = () => {
    const num = Number(targetInputVal);
    if (!isNaN(num) && num > 0) {
      setDailyTarget(num);
      try {
        localStorage.setItem('admin_daily_sales_target', num.toString());
      } catch (e) {
        console.warn(e);
      }
      setIsEditingTarget(false);
    }
  };

  // 3. Analytics Controls
  const [timeframe, setTimeframe] = useState('hourly'); // 'hourly' | 'weekly' | 'monthly'
  const [dateFilter, setDateFilter] = useState('today'); // 'today' | 'yesterday' | '7days' | 'month'
  const [selectedPointIndex, setSelectedPointIndex] = useState(5);
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'volume'
  const [pieMetric, setPieMetric] = useState('volume'); // 'volume' | 'revenue'
  const [pieChartStyle, setPieChartStyle] = useState(dashboardConfig.chartType || 'donut'); // 'donut' | 'pie'

  // 4. All-In-One Item Command Center State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [demandTab, setDemandTab] = useState('all'); // 'all' | 'bestsellers' | 'low_demand'
  const [dishSearch, setDishSearch] = useState('');
  const [dishSortBy, setDishSortBy] = useState('volume'); // 'volume' | 'revenue' | 'margin' | 'price'
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [selectedSlice, setSelectedSlice] = useState('all');

  // Inline Price Editing State
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingPriceVal, setEditingPriceVal] = useState('');

  // Modals & Real-time Sessions
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [crmSearch, setCrmSearch] = useState('');
  const [liveSessions, setLiveSessions] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);

  const isDark = theme !== 'light';

  // Ultra-Professional Theme Palette
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
        activePill: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
      };
    }
    if (theme === 'obsidian') {
      return {
        bg: 'bg-[#090D16]',
        cardBg: 'bg-[#111827]',
        cardBorder: 'border-slate-800/80',
        cardHover: 'hover:border-slate-700',
        innerBox: 'bg-[#0D1322] border-slate-800/90',
        textPrimary: 'text-slate-100',
        textSecondary: 'text-slate-400',
        accentGrad: 'from-orange-500 via-amber-500 to-amber-400',
        activePill: 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
      };
    }
    // Default: 'light' — Clean, High-End Enterprise Professional White (Stripe/Toast/Linear)
    return {
      bg: 'bg-[#F8FAFC]',
      cardBg: 'bg-white',
      cardBorder: 'border-slate-200/90',
      cardHover: 'hover:border-slate-300 hover:shadow-md',
      innerBox: 'bg-slate-50/80 border-slate-200/80',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-500',
      accentGrad: 'from-orange-500 to-amber-500',
      activePill: 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
    };
  }, [theme]);

  // Executive Timeframe Datasets
  const chartDatasets = {
    hourly: {
      title: "Today's Sales & Volume Velocity",
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

  // 5. CATEGORY PIE / DONUT BREAKDOWN DATASET
  const categoryStats = useMemo(() => [
    { 
      id: 'cat_mysore', 
      name: 'Mysore Dosa', 
      guj: 'માયસોર ઢોસા', 
      percentage: 38, 
      volume: 486, 
      revenue: 63180, 
      color: '#F59E0B', 
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
      color: '#6366F1', 
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
      avgPlatePrice: '₹120',
      topDish: 'Veg Manchurian Dry' 
    }
  ], []);

  const totalCategoryVolume = categoryStats.reduce((sum, c) => sum + c.volume, 0);
  const totalCategoryRevenue = categoryStats.reduce((sum, c) => sum + c.revenue, 0);

  // SVG Pie & Donut Angle Calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.82

  let accumulatedDonutOffset = 0;
  let accumulatedAngle = 0;

  const pieAndDonutSegments = useMemo(() => {
    let currAngle = -Math.PI / 2; // start from top (12 o'clock)
    let donutOffset = 0;

    return categoryStats.map((cat) => {
      const val = pieMetric === 'volume' ? cat.volume : cat.revenue;
      const total = pieMetric === 'volume' ? totalCategoryVolume : totalCategoryRevenue;
      const share = (val / total) * 100;
      const angle = (share / 100) * (2 * Math.PI);

      // Donut dash values
      const strokeLength = (share / 100) * circumference;
      const dashoffset = -donutOffset;
      donutOffset += strokeLength;

      // Solid Pie Path calculation
      const startAngle = currAngle;
      const endAngle = currAngle + angle;
      currAngle += angle;

      const pieR = 82;
      const cx = 100;
      const cy = 100;
      const x1 = cx + pieR * Math.cos(startAngle);
      const y1 = cy + pieR * Math.sin(startAngle);
      const x2 = cx + pieR * Math.cos(endAngle);
      const y2 = cy + pieR * Math.sin(endAngle);
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      const piePath = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${pieR} ${pieR} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

      return {
        ...cat,
        share: share.toFixed(1),
        strokeLength,
        dashoffset,
        piePath,
        midAngle: (startAngle + endAngle) / 2
      };
    });
  }, [categoryStats, pieMetric, totalCategoryVolume, totalCategoryRevenue, circumference]);

  const activeCategoryData = categoryStats.find(c => c.id === selectedSlice) || categoryStats[0];

  // 6. ALL-IN-ONE MENU ITEM COMMAND CENTER DATASET (11 ITEMS WITH LIVE EDITING & TOGGLES)
  const defaultDishes = useMemo(() => [
    {
      id: 'd_01',
      rank: 1,
      name: 'Mysore Masala Dosa',
      guj: 'માયસોર મસાલા ઢોસા',
      category: 'Mysore Dosa',
      price: 130,
      costPrice: 42,
      volumeQty: 342,
      revenue: 44460,
      prepTime: '10m',
      rating: 4.9,
      isAvailable: true,
      velocity: '🚀 Super Bestseller',
      velocityType: 'super',
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
      costPrice: 112,
      volumeQty: 275,
      revenue: 81950,
      prepTime: '16m',
      rating: 4.9,
      isAvailable: true,
      velocity: '🔥 High Velocity',
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
      costPrice: 34,
      volumeQty: 254,
      revenue: 20320,
      prepTime: '8m',
      rating: 4.8,
      isAvailable: true,
      velocity: '⚡ Steady Mover',
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
      costPrice: 72,
      volumeQty: 215,
      revenue: 43000,
      prepTime: '12m',
      rating: 4.8,
      isAvailable: true,
      velocity: '⚡ Steady Mover',
      velocityType: 'fast',
      margin: '64%',
      recommendation: 'Huge popularity with youths & couples. Keep grated cheese prep ready.'
    },
    {
      id: 'd_05',
      rank: 5,
      name: 'Paneer Mysore Dosa',
      guj: 'પનીર માયસોર ઢોસા',
      category: 'Mysore Dosa',
      price: 150,
      costPrice: 52,
      volumeQty: 188,
      revenue: 28200,
      prepTime: '11m',
      rating: 4.7,
      isAvailable: true,
      velocity: '⚡ Steady Mover',
      velocityType: 'fast',
      margin: '65%',
      recommendation: 'Strong dinner preference. Fresh malai paneer cubes drive repeat orders.'
    },
    {
      id: 'd_06',
      rank: 6,
      name: 'Cheese Paper Dosa',
      guj: 'ચીઝ પેપર ઢોસા',
      category: 'Plain Paper Dosa',
      price: 110,
      costPrice: 32,
      volumeQty: 142,
      revenue: 15620,
      prepTime: '7m',
      rating: 4.6,
      isAvailable: true,
      velocity: '⚡ Steady Mover',
      velocityType: 'steady',
      margin: '71%',
      recommendation: 'Highest margin dish (71%). Low labor, great breakfast & snack item.'
    },
    {
      id: 'd_07',
      rank: 7,
      name: 'Cheese Gotala Dosa',
      guj: 'ચીઝ ગોટાલા ઢોસા',
      category: 'Fancy Dosa',
      price: 240,
      costPrice: 90,
      volumeQty: 126,
      revenue: 30240,
      prepTime: '14m',
      rating: 4.7,
      isAvailable: true,
      velocity: '⚡ Steady Mover',
      velocityType: 'steady',
      margin: '63%',
      recommendation: 'Surat specialty favorite. High ticket booster on weekend evenings.'
    },
    {
      id: 'd_08',
      rank: 8,
      name: 'Veg Manchurian Dry',
      guj: 'વેજ મંચુરિયન ડ્રાય',
      category: 'Chinese & Starters',
      price: 130,
      costPrice: 54,
      volumeQty: 98,
      revenue: 12740,
      prepTime: '10m',
      rating: 4.5,
      isAvailable: true,
      velocity: '⚡ Steady Mover',
      velocityType: 'steady',
      margin: '58%',
      recommendation: 'Solid starter. Upsell with Cold Drink combo at ₹149.'
    },
    {
      id: 'd_09',
      rank: 9,
      name: 'Chinese Bhel (Crispy)',
      guj: 'ચાઈનીઝ ભેળ',
      category: 'Chinese & Starters',
      price: 100,
      costPrice: 48,
      volumeQty: 32,
      revenue: 3200,
      prepTime: '6m',
      rating: 4.2,
      isAvailable: false,
      velocity: '⚠️ Low Demand / Dead Stock',
      velocityType: 'low',
      margin: '52%',
      recommendation: 'Underperforming. Create combo with Soup or discount by 15% during 4-7 PM.'
    },
    {
      id: 'd_10',
      rank: 10,
      name: 'Idli Sambhar Plate (2 Pcs)',
      guj: 'ઈડલી સંભાર (૨ નંગ)',
      category: 'Plain Paper Dosa',
      price: 60,
      costPrice: 32,
      volumeQty: 26,
      revenue: 1560,
      prepTime: '4m',
      rating: 4.1,
      isAvailable: true,
      velocity: '⚠️ Low Demand / Dead Stock',
      velocityType: 'low',
      margin: '47%',
      recommendation: 'Morning demand is sluggish. Package with Medu Vada for a ₹75 Breakfast Special.'
    },
    {
      id: 'd_11',
      rank: 11,
      name: 'Sweet Corn Veg Soup',
      guj: 'સ્વીટ કોર્ન સૂપ',
      category: 'Chinese & Starters',
      price: 90,
      costPrice: 58,
      volumeQty: 18,
      revenue: 1620,
      prepTime: '9m',
      rating: 4.0,
      isAvailable: true,
      velocity: '⚠️ Low Demand / Dead Stock',
      velocityType: 'low',
      margin: '36%',
      recommendation: 'Lowest velocity dish. Replace with Hot & Sour or Manchow Soup for winter menu.'
    }
  ], []);

  // Synchronized dishes list (allowing inline availability toggle & price edit)
  const [itemsList, setItemsList] = useState(() => {
    try {
      const saved = localStorage.getItem('restaurant_dashboard_dishes');
      return saved ? JSON.parse(saved) : defaultDishes;
    } catch {
      return defaultDishes;
    }
  });

  // Handle Availability 1-Click Toggle
  const handleToggleItemAvailability = (itemId) => {
    const updated = itemsList.map(dish => {
      if (dish.id === itemId) {
        return { ...dish, isAvailable: !dish.isAvailable };
      }
      return dish;
    });
    setItemsList(updated);
    try {
      localStorage.setItem('restaurant_dashboard_dishes', JSON.stringify(updated));
      window.dispatchEvent(new Event('restaurant_data_updated'));
    } catch (e) {
      console.warn(e);
    }
    const target = updated.find(d => d.id === itemId);
    recordEmployeeActivity(
      'DARSHIT RANA',
      'admin',
      'ITEM_AVAILABILITY_CHANGED',
      `Toggled "${target.name}" to ${target.isAvailable ? 'AVAILABLE (In Stock)' : 'OUT OF STOCK'}`
    );
  };

  // Handle Inline Price Edit Save
  const handleSaveItemPrice = (itemId) => {
    const newPrice = Number(editingPriceVal);
    if (isNaN(newPrice) || newPrice <= 0) return;

    const updated = itemsList.map(dish => {
      if (dish.id === itemId) {
        const cost = dish.costPrice || Math.round(dish.price * 0.4);
        const marginVal = Math.round(((newPrice - cost) / newPrice) * 100);
        return { 
          ...dish, 
          price: newPrice,
          margin: `${marginVal}%`,
          revenue: dish.volumeQty * newPrice
        };
      }
      return dish;
    });

    setItemsList(updated);
    setEditingItemId(null);
    setEditingPriceVal('');

    try {
      localStorage.setItem('restaurant_dashboard_dishes', JSON.stringify(updated));
      window.dispatchEvent(new Event('restaurant_data_updated'));
    } catch (e) {
      console.warn(e);
    }

    const target = updated.find(d => d.id === itemId);
    recordEmployeeActivity(
      'DARSHIT RANA',
      'admin',
      'MENU_PRICE_UPDATED',
      `Updated price of "${target.name}" to ₹${newPrice}`
    );
  };

  const maxDishVolume = Math.max(...itemsList.map(d => d.volumeQty));

  // Filtered Dishes for All-in-One Command Table
  const filteredDishes = useMemo(() => {
    return itemsList
      .filter(dish => {
        if (demandTab === 'bestsellers') return dish.rank <= 6;
        if (demandTab === 'low_demand') return dish.rank >= 9;
        return true;
      })
      .filter(dish => {
        if (selectedCategory === 'all') return true;
        return dish.category.toLowerCase().includes(selectedCategory.toLowerCase());
      })
      .filter(dish => {
        if (selectedSlice !== 'all') {
          const cat = categoryStats.find(c => c.id === selectedSlice);
          if (cat) {
            return dish.category.toLowerCase().includes(cat.name.toLowerCase());
          }
        }
        return true;
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
        if (dishSortBy === 'price') return b.price - a.price;
        return a.rank - b.rank;
      });
  }, [itemsList, demandTab, selectedCategory, selectedSlice, dishSearch, dishSortBy, categoryStats]);

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
      payment_method: 'ONLINE_UPI',
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

  // Target Goal Calculations
  const currentTodaySales = 18450;
  const targetPercent = Math.min(100, Math.round((currentTodaySales / dailyTarget) * 100));

  return (
    <div className={`space-y-6 pb-20 font-sans transition-colors duration-200 ${palette.textPrimary}`}>
      
      {/* 1. EXECUTIVE IDENTITY & CUSTOMIZATION COMMAND BAR */}
      <div className={`p-5 sm:p-6 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all`}>
        <div className="flex items-center space-x-4">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xl tracking-tight shadow-md shadow-orange-500/20 shrink-0 font-heading">
            DR
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-slate-900">
                DARSHIT RANA
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Age 19 • Primary Restaurant Owner
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase Cloud (Mumbai ap-south-1) 🟢</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Atmiya Dosa Hub • Executive Restaurant Intelligence & Operations (Petlad, Anand)
            </p>
          </div>
        </div>

        {/* Action Controls: Customize View, Floor QRs, Add Item */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          
          {/* Quick Date Range Filter */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-xl transition ${dateFilter === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('yesterday')}
              className={`px-3 py-1.5 rounded-xl transition ${dateFilter === 'yesterday' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1.5 rounded-xl transition ${dateFilter === '7days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              7 Days
            </button>
          </div>

          {/* CUSTOMIZE DASHBOARD BUTTON */}
          <button
            onClick={() => setShowCustomizeModal(true)}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition shadow-xs cursor-pointer"
            title="Adjust & customize what you see on the dashboard"
          >
            <SlidersHorizontal className="w-4 h-4 text-orange-600" />
            <span>Customize View</span>
          </button>

          <button
            onClick={onOpenGenerateQR}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-orange-500" />
            <span>Floor QRs</span>
          </button>
          
          <button
            onClick={onOpenAddItem}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition shadow-sm shadow-orange-500/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE KPIS + EDITABLE DAILY SALES GOAL METER */}
      {dashboardConfig.showKpis && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          
          {/* Tile 1: Total Revenue */}
          <div className={`p-5 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-xs hover:shadow-sm transition`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Today's Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
                ₹
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-slate-900">
                {currentDataset.total}
              </span>
            </div>
            <div className="mt-2 flex items-center text-[11px] font-bold text-emerald-600 space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs yesterday</span>
            </div>
          </div>

          {/* Tile 2: Volume Tracked */}
          <div className={`p-5 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-xs hover:shadow-sm transition`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Volume Tracked</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-slate-900">
                {currentDataset.totalVolume} Plates
              </span>
            </div>
            <div className="mt-2 text-[11px] font-bold text-purple-600">
              Across {currentDataset.totalOrders} dining tickets
            </div>
          </div>

          {/* Tile 3: Average Order Value */}
          <div className={`p-5 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-xs hover:shadow-sm transition`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Avg Ticket (AOV)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                AOV
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-slate-900">
                ₹249
              </span>
            </div>
            <div className="mt-2 text-[11px] font-bold text-emerald-600">
              Target ₹220+ exceeded by 13%
            </div>
          </div>

          {/* Tile 4: Active Occupancy */}
          <div className={`p-5 rounded-3xl ${palette.cardBg} border ${palette.cardBorder} shadow-xs hover:shadow-sm transition`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Floor Seated</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-slate-900">
                3 / 10 Tables
              </span>
            </div>
            <div className="mt-2 text-[11px] font-bold text-blue-600">
              30% Current Floor Seated
            </div>
          </div>

          {/* Tile 5: EDITABLE DAILY SALES GOAL CARD */}
          <div className={`col-span-2 lg:col-span-1 p-5 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 relative overflow-hidden flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-100">Daily Target Goal</span>
              <button
                onClick={() => { setIsEditingTarget(true); setTargetInputVal(dailyTarget); }}
                className="text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-lg transition cursor-pointer flex items-center space-x-1"
                title="Click to edit your daily target goal"
              >
                <Edit2 className="w-2.5 h-2.5" />
                <span>Edit Goal</span>
              </button>
            </div>

            {isEditingTarget ? (
              <div className="mt-2 bg-white/95 p-2 rounded-xl text-slate-900 flex items-center space-x-1.5">
                <span className="font-bold text-xs">₹</span>
                <input
                  type="number"
                  value={targetInputVal}
                  onChange={(e) => setTargetInputVal(e.target.value)}
                  className="w-full text-xs font-mono font-bold focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveDailyTarget}
                  className="px-2 py-1 rounded bg-orange-600 text-white text-[10px] font-bold hover:bg-orange-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="mt-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono tracking-tight">
                    {targetPercent}%
                  </span>
                  <span className="text-xs font-mono opacity-90">
                    ₹{currentTodaySales.toLocaleString()} / ₹{dailyTarget.toLocaleString()}
                  </span>
                </div>
                
                {/* Target Progress Bar */}
                <div className="w-full h-2 rounded-full bg-black/20 mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${targetPercent}%` }} 
                    className="h-full bg-white rounded-full transition-all duration-500"
                  />
                </div>
                <span className="block text-[10px] opacity-90 mt-1 font-medium">
                  {targetPercent >= 100 ? '🎉 Goal Achieved!' : `₹${(dailyTarget - currentTodaySales).toLocaleString()} remaining`}
                </span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. UNIFIED VISUAL ANALYTICS: INTERACTIVE CATEGORY PIE CHART + SALES VELOCITY WAVE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / PIE CHART (6 COLS): WORLD-CLASS INTERACTIVE PIE & DONUT VISUALIZER */}
        {dashboardConfig.showPieChart && (
          <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm space-y-5 transition-all">
            
            {/* Header with Visual Style & Metric Toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <PieChartIcon className="w-5 h-5 text-orange-500" />
                  <h2 className="text-base font-black font-heading text-slate-900">
                    Category Demand Pie & Volume
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Click any slice to filter and inspect items in that category
                </p>
              </div>

              {/* Toggles: Donut vs Pie & Volume vs Revenue */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Pie vs Donut Style Toggle */}
                <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => { setPieChartStyle('donut'); updateConfig('chartType', 'donut'); }}
                    className={`px-2.5 py-1 rounded-xl transition ${pieChartStyle === 'donut' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    🍩 Donut
                  </button>
                  <button
                    onClick={() => { setPieChartStyle('pie'); updateConfig('chartType', 'pie'); }}
                    className={`px-2.5 py-1 rounded-xl transition ${pieChartStyle === 'pie' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    🍰 Pie
                  </button>
                </div>

                {/* Metric: Volume vs Revenue */}
                <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setPieMetric('volume')}
                    className={`px-2.5 py-1 rounded-xl transition ${pieMetric === 'volume' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    📦 Plates
                  </button>
                  <button
                    onClick={() => setPieMetric('revenue')}
                    className={`px-2.5 py-1 rounded-xl transition ${pieMetric === 'revenue' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    ₹ Revenue
                  </button>
                </div>

              </div>
            </div>

            {/* SVG Canvas & Rich Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              
              {/* SVG Visual (Solid Pie or Donut) */}
              <div className="sm:col-span-6 flex flex-col items-center justify-center relative p-2">
                <div className="relative w-56 h-56 sm:w-60 sm:h-60">
                  
                  {pieChartStyle === 'donut' ? (
                    /* DONUT CHART */
                    <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 transform">
                      {pieAndDonutSegments.map((segment) => {
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
                            strokeWidth={isSelected ? '28' : (isHovered ? '25' : '21')}
                            strokeDasharray={`${segment.strokeLength} ${circumference}`}
                            strokeDashoffset={segment.dashoffset}
                            strokeLinecap="round"
                            onClick={() => setSelectedSlice(selectedSlice === segment.id ? 'all' : segment.id)}
                            onMouseEnter={() => setHoveredSlice(segment.id)}
                            onMouseLeave={() => setHoveredSlice(null)}
                            className="cursor-pointer transition-all duration-300"
                            style={{
                              filter: isSelected ? `drop-shadow(0px 0px 6px ${segment.color})` : 'none',
                              opacity: (selectedSlice !== 'all' && !isSelected && !isHovered) ? 0.45 : 1
                            }}
                          />
                        );
                      })}
                    </svg>
                  ) : (
                    /* SOLID PIE CHART */
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {pieAndDonutSegments.map((segment) => {
                        const isHovered = hoveredSlice === segment.id;
                        const isSelected = selectedSlice === segment.id;

                        return (
                          <path
                            key={segment.id}
                            d={segment.piePath}
                            fill={segment.color}
                            stroke="#FFFFFF"
                            strokeWidth={isSelected ? '3' : '2'}
                            onClick={() => setSelectedSlice(selectedSlice === segment.id ? 'all' : segment.id)}
                            onMouseEnter={() => setHoveredSlice(segment.id)}
                            onMouseLeave={() => setHoveredSlice(null)}
                            className="cursor-pointer transition-all duration-300 hover:brightness-110"
                            style={{
                              transformOrigin: '100px 100px',
                              transform: (isHovered || isSelected) ? 'scale(1.05)' : 'scale(1)',
                              opacity: (selectedSlice !== 'all' && !isSelected && !isHovered) ? 0.45 : 1
                            }}
                          />
                        );
                      })}
                    </svg>
                  )}

                  {/* Donut Center Label (Visible in Donut mode) */}
                  {pieChartStyle === 'donut' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {pieMetric === 'volume' ? 'Total Volume' : 'Total Revenue'}
                      </span>
                      <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 mt-0.5">
                        {pieMetric === 'volume' ? `${totalCategoryVolume}p` : `₹${(totalCategoryRevenue / 1000).toFixed(1)}k`}
                      </span>
                      <span className="text-[9px] text-emerald-700 font-bold mt-1 px-2 py-0.2 rounded-full bg-emerald-50 border border-emerald-200">
                        100% Demand
                      </span>
                    </div>
                  )}

                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => setSelectedSlice('all')}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition ${
                      selectedSlice === 'all' 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    View All Categories
                  </button>
                  {selectedSlice !== 'all' && (
                    <span className="text-[11px] font-bold text-orange-600">
                      Filtering: {categoryStats.find(c => c.id === selectedSlice)?.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Category Breakdown Cards on Right of Pie */}
              <div className="sm:col-span-6 space-y-2">
                {pieAndDonutSegments.map((cat, idx) => {
                  const isSelected = selectedSlice === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedSlice(selectedSlice === cat.id ? 'all' : cat.id)}
                      className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected 
                          ? 'bg-orange-50/80 border-orange-300 ring-2 ring-orange-400/20' 
                          : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div 
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" 
                          style={{ backgroundColor: cat.color }} 
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 truncate">
                              {cat.name}
                            </span>
                            <span className="font-mono font-black text-slate-800 text-[11px]">
                              {pieMetric === 'volume' ? `${cat.volume}p` : `₹${cat.revenue.toLocaleString()}`}
                            </span>
                          </div>
                          
                          {/* Mini Progress Bar */}
                          <div className="w-full h-1.5 rounded-full bg-slate-200 mt-1 overflow-hidden">
                            <div 
                              style={{ width: `${cat.share}%`, backgroundColor: cat.color }} 
                              className="h-full rounded-full"
                            />
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">
                        {cat.share}%
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

        {/* RIGHT / SALES VELOCITY (6 COLS): DUAL-METRIC SALES VELOCITY WAVE */}
        {dashboardConfig.showSalesWave && (
          <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm space-y-4 transition-all">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  <h2 className="text-base font-black font-heading text-slate-900">
                    {currentDataset.title}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {currentDataset.subtitle}
                </p>
              </div>

              {/* Timeframe & Metric Toggle */}
              <div className="flex items-center space-x-1.5">
                <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setChartMetric('revenue')}
                    className={`px-2 py-1 rounded-xl transition ${chartMetric === 'revenue' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    ₹
                  </button>
                  <button
                    onClick={() => setChartMetric('volume')}
                    className={`px-2 py-1 rounded-xl transition ${chartMetric === 'volume' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    📦
                  </button>
                </div>

                <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => { setTimeframe('hourly'); setSelectedPointIndex(5); }}
                    className={`px-2.5 py-1 rounded-xl transition ${timeframe === 'hourly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => { setTimeframe('weekly'); setSelectedPointIndex(5); }}
                    className={`px-2.5 py-1 rounded-xl transition ${timeframe === 'weekly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => { setTimeframe('monthly'); setSelectedPointIndex(3); }}
                    className={`px-2.5 py-1 rounded-xl transition ${timeframe === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Month
                  </button>
                </div>
              </div>
            </div>

            {/* Active Milestone Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/50 to-white border border-orange-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs font-mono">
                  {activePoint.label}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-sm font-mono text-slate-900">
                      {chartMetric === 'revenue' 
                        ? `₹${activePoint.revenue.toLocaleString('en-IN')}` 
                        : `${activePoint.volume || activePoint.orders * 2} Plates`}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 font-bold text-[10px] border border-orange-200">
                      {activePoint.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {activePoint.orders} tickets • Top Dish: <strong className="text-orange-700">{activePoint.peakDish}</strong>
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 font-mono font-bold text-[11px] text-slate-700 shadow-xs">
                ⚡ Turn: 18m
              </span>
            </div>

            {/* Precision SVG Canvas & Pillars */}
            <div className="pt-2 relative">
              
              {/* Spline Wave SVG Line */}
              <div className="w-full h-24 mb-2">
                <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="whiteWaveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EA580C" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {areaPath && (
                    <path d={areaPath} fill="url(#whiteWaveGrad)" />
                  )}
                  {splinePath && (
                    <path 
                      d={splinePath} 
                      fill="none" 
                      stroke="#EA580C" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                    />
                  )}
                  {svgCoords.map((coord, idx) => (
                    <circle
                      key={idx}
                      cx={coord.x}
                      cy={coord.y}
                      r={idx === activePointIndex ? 6 : 4}
                      fill={idx === activePointIndex ? '#EA580C' : '#FFFFFF'}
                      stroke="#EA580C"
                      strokeWidth="2.5"
                    />
                  ))}
                </svg>
              </div>

              {/* Slender Data Columns */}
              <div className="grid grid-cols-7 gap-2 items-end pt-1">
                {currentDataset.points.map((pt, index) => {
                  const val = chartMetric === 'revenue' ? pt.revenue : (pt.volume || pt.orders * 2.2);
                  const max = chartMetric === 'revenue' ? maxRevenue : maxVolume;
                  const heightPct = Math.max(16, Math.min(100, Math.round((val / max) * 100)));
                  const isSelected = index === activePointIndex;

                  return (
                    <div 
                      key={index}
                      onClick={() => setSelectedPointIndex(index)}
                      className="flex flex-col items-center justify-end h-full group cursor-pointer"
                    >
                      <div className={`mb-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition shadow-2xs ${
                        isSelected ? 'bg-orange-600 text-white scale-105' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {chartMetric === 'revenue' 
                          ? (pt.revenue >= 1000 ? `₹${(pt.revenue / 1000).toFixed(1)}k` : `₹${pt.revenue}`)
                          : `${pt.volume || pt.orders * 2}p`}
                      </div>

                      <div className="w-full max-w-[34px] h-28 bg-slate-100 rounded-xl p-1 flex flex-col justify-end items-center border border-slate-200/80">
                        <div 
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-lg transition-all duration-300 ${
                            isSelected 
                              ? 'bg-gradient-to-t from-orange-600 to-amber-500 shadow-xs' 
                              : 'bg-slate-300 group-hover:bg-orange-400'
                          }`}
                        />
                      </div>

                      <span className={`text-[11px] font-bold mt-1.5 ${isSelected ? 'text-orange-600' : 'text-slate-500'}`}>
                        {pt.label}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* 4. "CHECKS THE ITEMS IN ONE PLACE" — ALL-IN-ONE MENU ITEM COMMAND CENTER & QUICK-EDITOR */}
      {dashboardConfig.showItemCommandCenter && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm space-y-5 transition-all">
          
          {/* Header & Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                <h2 className="text-base sm:text-lg font-black font-heading text-slate-900">
                  Menu Items Demand & Live Control Center ({filteredDishes.length} Items)
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Check and customize dish demand, volume sold, live stock availability, and edit prices right in one place
              </p>
            </div>

            {/* Sub-Filters: All, Bestsellers, Dead Stock */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setDemandTab('all')}
                  className={`px-3 py-1.5 rounded-xl transition ${demandTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  All Menu Items ({itemsList.length})
                </button>
                <button
                  onClick={() => setDemandTab('bestsellers')}
                  className={`px-3 py-1.5 rounded-xl transition ${demandTab === 'bestsellers' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  🔥 Bestsellers
                </button>
                <button
                  onClick={() => setDemandTab('low_demand')}
                  className={`px-3 py-1.5 rounded-xl transition ${demandTab === 'low_demand' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  ⚠️ Dead Stock / Low Demand
                </button>
              </div>

              {/* Category Filter Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSlice('all'); }}
                className="px-3 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="mysore">Mysore Dosa</option>
                <option value="fancy">Fancy Dosa</option>
                <option value="spacial">Spacial Item</option>
                <option value="paper">Plain Paper Dosa</option>
                <option value="masala">Masala Dosa</option>
                <option value="pavu bhaji">Pavu Bhaji</option>
                <option value="pulav">Pulav</option>
                <option value="chinese rice">Chinese Rice</option>
                <option value="stater">Stater</option>
                <option value="noodles">Noodles</option>
                <option value="maggi">Maggi</option>
                <option value="soup">Soup</option>
                <option value="uttapam">Uttapam</option>
                <option value="idali">Idali</option>
                <option value="vada">Vada & Dhokala</option>
                <option value="papad">Papad & French Fries</option>
                <option value="unlimited">Unlimited Meal Plans</option>
              </select>

              {/* Sort By Dropdown */}
              <select
                value={dishSortBy}
                onChange={(e) => setDishSortBy(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="volume">Sort by: Quantity Volume (Plates)</option>
                <option value="revenue">Sort by: Revenue (₹)</option>
                <option value="margin">Sort by: Profit Margin %</option>
                <option value="price">Sort by: Selling Price (₹)</option>
              </select>
            </div>
          </div>

          {/* Search Bar & Active Slice Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search dish by English name, Gujarati (માયસોર, બાહુબલી) or category..."
                value={dishSearch}
                onChange={(e) => setDishSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {selectedSlice !== 'all' && (
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-slate-500">Filtered by Pie Slice:</span>
                <span className="px-2.5 py-1 rounded-xl bg-orange-100 text-orange-800 font-bold border border-orange-200 flex items-center space-x-1.5">
                  <span>{categoryStats.find(c => c.id === selectedSlice)?.name}</span>
                  <button onClick={() => setSelectedSlice('all')} className="hover:text-red-600">×</button>
                </span>
              </div>
            )}
          </div>

          {/* THE ALL-IN-ONE DATA & ACTION TABLE */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Rank & Dish Details</th>
                  <th className="py-3 px-4">Demand Velocity</th>
                  <th className="py-3 px-4">Live Availability</th>
                  <th className="py-3 px-4">Selling Price (Editable)</th>
                  <th className="py-3 px-4">Volume (Plates Sold)</th>
                  <th className="py-3 px-4">Total Revenue</th>
                  <th className="py-3 px-4">Margin %</th>
                  <th className="py-3 px-4">AI Turnaround Tip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredDishes.map((dish) => {
                  const volumePct = Math.round((dish.volumeQty / maxDishVolume) * 100);
                  const isEditingThisPrice = editingItemId === dish.id;

                  return (
                    <tr key={dish.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* 1. Rank & Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                            dish.rank === 1 ? 'bg-amber-100 text-amber-800 font-black' : (dish.rank <= 3 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600')
                          }`}>
                            #{dish.rank}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {dish.name}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 block">
                              {dish.guj}
                            </span>
                            <span className="text-[10px] font-bold text-orange-600 mt-0.5 inline-block">
                              {dish.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Demand Velocity Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          dish.velocityType === 'super'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : (dish.velocityType === 'hot' || dish.velocityType === 'fast'
                              ? 'bg-orange-50 text-orange-800 border-orange-200'
                              : (dish.velocityType === 'low'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'))
                        }`}>
                          {dish.velocity}
                        </span>
                      </td>

                      {/* 3. Live Stock Availability Toggle Switch */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleItemAvailability(dish.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border ${
                            dish.isAvailable
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Click to toggle In Stock vs Sold Out in real-time"
                        >
                          <span className={`w-2 h-2 rounded-full ${dish.isAvailable ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                          <span>{dish.isAvailable ? 'In Stock 🟢' : 'Sold Out 🔴'}</span>
                        </button>
                      </td>

                      {/* 4. Inline Price Editor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isEditingThisPrice ? (
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-500 font-bold">₹</span>
                            <input
                              type="number"
                              value={editingPriceVal}
                              onChange={(e) => setEditingPriceVal(e.target.value)}
                              className="w-16 px-1.5 py-0.5 text-xs font-mono font-bold border border-orange-300 rounded focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveItemPrice(dish.id)}
                              className="p-1 rounded bg-orange-600 hover:bg-orange-700 text-white"
                              title="Save Price"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => { setEditingItemId(dish.id); setEditingPriceVal(dish.price); }}
                            className="flex items-center space-x-1.5 group cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-lg transition"
                            title="Click to edit item price"
                          >
                            <span className="font-mono font-black text-slate-900 text-xs">
                              ₹{dish.price}
                            </span>
                            <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                          </div>
                        )}
                      </td>

                      {/* 5. Volume Sold */}
                      <td className="py-3.5 px-4 min-w-[130px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-mono font-black text-slate-900">{dish.volumeQty} Plates</span>
                            <span className="font-mono text-[10px] text-slate-400">{volumePct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div 
                              style={{ width: `${volumePct}%` }} 
                              className={`h-full rounded-full ${dish.rank <= 3 ? 'bg-orange-500' : 'bg-slate-400'}`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 6. Total Gross Revenue */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-black text-slate-900">
                        ₹{dish.revenue.toLocaleString()}
                      </td>

                      {/* 7. Margin % */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          parseInt(dish.margin) >= 65 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {dish.margin}
                        </span>
                      </td>

                      {/* 8. AI Strategy Tip */}
                      <td className="py-3.5 px-4 min-w-[200px] text-[11px] text-slate-600">
                        {dish.recommendation}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 5. ACTIVE TABLE SESSIONS & COD VS ONLINE RECONCILIATION */}
      {dashboardConfig.showLiveTables && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm space-y-5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base sm:text-lg font-black font-heading text-slate-900">
                  Live Table Sessions & Bill Settlement ({displaySessions.filter(s => s.status === 'ACTIVE').length} Tables Seated)
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Clear distinction between online paid and COD (Cash on Table). Includes 30-min auto-vacate calculation and 1-click vacate.
              </p>
            </div>

            <button
              onClick={fetchLiveSupabaseData}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Live Supabase Tables</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displaySessions.filter(s => s.status === 'ACTIVE').map(session => {
              const elapsedMinutes = Math.round((Date.now() - new Date(session.opened_at).getTime()) / 60000);
              const isOvertime = elapsedMinutes > 30;
              const isOnlinePaid = session.payment_status === 'PAID';

              return (
                <div 
                  key={session.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    isOvertime 
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20' 
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono font-black text-xs flex items-center justify-center">
                        {session.table_number || 'T01'}
                      </span>
                      <div>
                        <h4 className="font-black text-xs text-slate-900">{session.customer_name || 'Guest'}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{session.customer_phone || ''}</span>
                      </div>
                    </div>

                    {/* Online vs COD Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isOnlinePaid 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-orange-100 text-orange-800 border-orange-300'
                    }`}>
                      {isOnlinePaid ? 'Online Paid (UPI) 🟢' : 'COD (Cash Due) 🟠'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Order Items:</span>
                      <strong className="text-slate-800 font-medium truncate max-w-[170px]">{session.items_summary || 'Mysore Masala + Chaas'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Elapsed Time:</span>
                      <span className={`font-mono font-bold ${isOvertime ? 'text-amber-700' : 'text-slate-700'}`}>
                        {elapsedMinutes} mins {isOvertime && '(Eligible for Auto-Vacate)'}
                      </span>
                    </div>
                    <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-100">
                      <span>Total Bill:</span>
                      <span className="font-mono text-orange-600">₹{session.total_amount}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => handleSettleSession(session)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Vacate & Settle</span>
                    </button>

                    <button
                      onClick={() => setSelectedReceiptOrder({
                        order_number: session.session_code,
                        table_number: session.table_number,
                        customer_name: session.customer_name,
                        customer_phone: session.customer_phone,
                        items_summary: session.items_summary,
                        total_amount: session.total_amount,
                        payment_method: session.payment_method,
                        payment_status: session.payment_status,
                        placed_at: session.opened_at
                      })}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                      title="Download or Print Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. PEAK DINING RUSH HEATMAP */}
      {dashboardConfig.showRushHeatmap && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm space-y-4 transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-black font-heading text-slate-900">
                Hourly Kitchen Prep & Tawa Staffing Heatmap
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Kitchen Turnaround: 11m Average
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {rushHours.map((slot, i) => (
              <div 
                key={i}
                className={`p-4 rounded-2xl border transition ${
                  slot.rush === 'HOUSEFULL' 
                    ? 'bg-orange-50/80 border-orange-300 ring-2 ring-orange-400/20' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  {slot.hour}
                </span>
                <h4 className="font-black text-sm text-slate-900 mt-1">
                  {slot.session}
                </h4>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-700">{slot.plates} Plates</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    slot.rush === 'HOUSEFULL' ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {slot.rush}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 mt-2 overflow-hidden">
                  <div 
                    style={{ width: slot.load }} 
                    className={`h-full rounded-full ${slot.rush === 'HOUSEFULL' ? 'bg-orange-500' : 'bg-slate-400'}`}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                  {slot.tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. DASHBOARD CUSTOMIZE MODAL / DRAWER */}
      {showCustomizeModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-black font-heading text-slate-900">
                  Customize Executive Dashboard
                </h3>
              </div>
              <button 
                onClick={() => setShowCustomizeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customization Options */}
            <div className="space-y-4 text-xs">
              
              {/* Daily Sales Target Goal Setting */}
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-2">
                <span className="font-bold text-slate-900 block">Daily Target Sales Goal (₹)</span>
                <p className="text-[11px] text-slate-600">Set your restaurant's daily sales milestone. The progress bar updates in real time.</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="font-bold text-sm text-slate-800">₹</span>
                  <input
                    type="number"
                    value={targetInputVal}
                    onChange={(e) => setTargetInputVal(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-orange-300 bg-white text-xs font-mono font-bold focus:outline-none"
                  />
                  <button
                    onClick={handleSaveDailyTarget}
                    className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                  >
                    Save Target
                  </button>
                </div>
              </div>

              {/* Toggle Sections Visibility */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider text-slate-400">
                  Visible Dashboard Sections
                </span>

                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-slate-100">
                  <span className="font-medium text-slate-800">1. Executive KPI Cards & Daily Goal</span>
                  <input
                    type="checkbox"
                    checked={dashboardConfig.showKpis}
                    onChange={(e) => updateConfig('showKpis', e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-slate-100">
                  <span className="font-medium text-slate-800">2. Interactive Category Pie / Donut Chart</span>
                  <input
                    type="checkbox"
                    checked={dashboardConfig.showPieChart}
                    onChange={(e) => updateConfig('showPieChart', e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-slate-100">
                  <span className="font-medium text-slate-800">3. Sales Velocity & Order Volume Spline Wave</span>
                  <input
                    type="checkbox"
                    checked={dashboardConfig.showSalesWave}
                    onChange={(e) => updateConfig('showSalesWave', e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-slate-100">
                  <span className="font-medium text-slate-800">4. Menu Items Demand & Live Control Table</span>
                  <input
                    type="checkbox"
                    checked={dashboardConfig.showItemCommandCenter}
                    onChange={(e) => updateConfig('showItemCommandCenter', e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-slate-100">
                  <span className="font-medium text-slate-800">5. Live Table Sessions & Bill Settlement</span>
                  <input
                    type="checkbox"
                    checked={dashboardConfig.showLiveTables}
                    onChange={(e) => updateConfig('showLiveTables', e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-slate-100">
                  <span className="font-medium text-slate-800">6. Hourly Kitchen Prep & Staffing Heatmap</span>
                  <input
                    type="checkbox"
                    checked={dashboardConfig.showRushHeatmap}
                    onChange={(e) => updateConfig('showRushHeatmap', e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded cursor-pointer"
                  />
                </label>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 8. PRINTABLE TAX INVOICE & THERMAL RECEIPT MODAL */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 bg-white p-6 space-y-4 relative animate-in fade-in zoom-in-95 text-slate-900">
            
            <button
              onClick={() => setSelectedReceiptOrder(null)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 absolute top-4 right-4 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Body */}
            <div id="printable-receipt" className="p-5 rounded-2xl bg-white border border-slate-200 font-mono text-xs space-y-3 text-slate-900">
              <div className="text-center space-y-1">
                <h4 className="font-black text-base uppercase tracking-tight text-slate-900">
                  ATMIYA DOSA HUB
                </h4>
                <p className="text-[10px] text-slate-500">
                  Opp. New Bus Station, Station Road, Petlad, Anand, Gujarat - 388450
                </p>
                <p className="text-[10px] text-slate-500">GSTIN: 24AAACA1234A1Z5 • Phone: +91 98765 43210</p>
                <div className="border-b border-dashed border-slate-300 pt-2"></div>
              </div>

              <div className="flex justify-between text-[11px]">
                <span>Order: {selectedReceiptOrder.order_number}</span>
                <span>Table: {selectedReceiptOrder.table_number}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Guest: {selectedReceiptOrder.customer_name || 'Walk-in'}</span>
                <span>{selectedReceiptOrder.customer_phone || ''}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Date: {new Date(selectedReceiptOrder.placed_at || Date.now()).toLocaleString()}
              </div>

              <div className="border-b border-dashed border-slate-300"></div>

              {/* Items */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>{selectedReceiptOrder.items_summary || 'Mysore Masala Dosa + Pav Bhaji'}</span>
                  <span>₹{selectedReceiptOrder.total_amount}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-300"></div>

              {/* Calculations */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{(selectedReceiptOrder.total_amount * 0.952).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>GST (5% Included):</span>
                  <span>₹{(selectedReceiptOrder.total_amount * 0.048).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-300 text-slate-900">
                  <span>NET TOTAL:</span>
                  <span>₹{selectedReceiptOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-300"></div>

              <div className="text-center text-[10px] text-slate-500">
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
                className="py-2.5 px-4 rounded-xl border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
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
