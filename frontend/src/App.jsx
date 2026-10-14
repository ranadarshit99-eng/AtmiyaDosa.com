import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ChefHat, 
  Utensils, 
  Users, 
  BarChart3, 
  Tag, 
  QrCode, 
  Settings, 
  Bell, 
  Search, 
  Sun, 
  Calendar, 
  LogOut, 
  Menu, 
  X, 
  Globe, 
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

import { 
  getLocalStore, 
  setLocalStore, 
  getAuthUser, 
  setAuthUser, 
  logoutAuthUser,
  INITIAL_SETTINGS,
  INITIAL_TABLES, 
  INITIAL_CATEGORIES, 
  INITIAL_MENU_ITEMS, 
  INITIAL_ORDERS, 
  INITIAL_ACTIVITY, 
  INITIAL_EMPLOYEES, 
  INITIAL_COUPONS,
  recordEmployeeActivity
} from './lib/appwrite';
import { getTranslation } from './lib/translations';
import { playSound } from './lib/sound';

import AuthPage from './components/auth/AuthPage';
import ExecutiveDashboard from './components/admin/ExecutiveDashboard';
import OrdersView from './components/admin/OrdersView';
import KitchenPanelView from './components/admin/KitchenPanelView';
import TablesView from './components/admin/TablesView';
import MenuManagementView from './components/admin/MenuManagementView';
import EmployeesView from './components/admin/EmployeesView';
import ReportsAnalytics from './components/admin/ReportsAnalytics';
import OffersView from './components/admin/OffersView';
import QRManagementView from './components/admin/QRManagementView';
import SettingsView from './components/admin/SettingsView';

import CustomerMenu from './components/CustomerMenu';

export default function App() {
  // Check if opened via QR code scanning (e.g. ?table=T04)
  const urlParams = new URLSearchParams(window.location.search);
  const scannedTable = urlParams.get('table');

  const [viewMode, setViewMode] = useState(scannedTable ? 'customer' : 'admin'); // 'admin' or 'customer'
  const [currentTable, setCurrentTable] = useState(scannedTable || 'T04');
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, orders, kitchen, tables, menu, employees, reports, offers, qr, settings
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Authentication State
  const [authUser, setAuthState] = useState(() => getLocalStore('auth_user', null));

  // Global State (persisted & synchronized)
  const [settings, setSettings] = useState(() => getLocalStore('settings', INITIAL_SETTINGS));
  const [currentLang, setCurrentLang] = useState(settings?.language || 'en');
  const [tables, setTables] = useState(() => getLocalStore('tables', INITIAL_TABLES));
  const [categories, setCategories] = useState(() => getLocalStore('categories', INITIAL_CATEGORIES));
  const [menuItems, setMenuItems] = useState(() => getLocalStore('menu_items', INITIAL_MENU_ITEMS));
  const [orders, setOrders] = useState(() => getLocalStore('orders', INITIAL_ORDERS));
  const [activity, setActivity] = useState(() => getLocalStore('activity', INITIAL_ACTIVITY));
  const [employees, setEmployees] = useState(() => getLocalStore('employees', INITIAL_EMPLOYEES));
  const [coupons, setCoupons] = useState(() => getLocalStore('coupons', INITIAL_COUPONS));

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('Wed, 15 Oct 2025 | 11:42 AM');

  const t = (key) => getTranslation(currentLang, key);

  // Real-time listener for updates across tabs / components
  const loadFreshState = () => {
    setSettings(getLocalStore('settings', INITIAL_SETTINGS));
    setTables(getLocalStore('tables', INITIAL_TABLES));
    setCategories(getLocalStore('categories', INITIAL_CATEGORIES));
    setMenuItems(getLocalStore('menu_items', INITIAL_MENU_ITEMS));
    setOrders(getLocalStore('orders', INITIAL_ORDERS));
    setActivity(getLocalStore('activity', INITIAL_ACTIVITY));
    setEmployees(getLocalStore('employees', INITIAL_EMPLOYEES));
    setCoupons(getLocalStore('coupons', INITIAL_COUPONS));
    setAuthState(getLocalStore('auth_user', null));
  };

  useEffect(() => {
    window.addEventListener('restaurant_data_updated', loadFreshState);
    return () => window.removeEventListener('restaurant_data_updated', loadFreshState);
  }, []);

  // Update live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = days[now.getDay()];
      const date = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCurrentTimeStr(`${day}, ${date} ${month} ${year} | ${time}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    setAuthUser(user);
    setAuthState(user);
    playSound('success');
  };

  const handleLogout = () => {
    logoutAuthUser();
    setAuthState(null);
  };

  // State Mutation Handlers
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    setLocalStore('orders', updated);

    const targetOrder = orders.find(o => o.id === orderId);
    recordEmployeeActivity({
      employeeName: authUser?.name || 'Darshit Rana',
      employeeRole: authUser?.role || 'Admin',
      tableNumber: targetOrder?.table_number || 'Kitchen',
      actionType: `ORDER_${newStatus.toUpperCase()}`,
      amount: targetOrder?.total || null,
      details: `Order #${orderId} status changed to "${newStatus}" by ${authUser?.name || 'Staff'}`,
      type: 'order',
      color: newStatus === 'Completed' ? 'emerald' : newStatus === 'Preparing' ? 'amber' : 'orange'
    });
    playSound('order');
  };

  const handleMarkCashPaymentDone = (orderId, staffName) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;
    const collector = staffName || authUser?.name || 'Anjali Patel';
    const updated = orders.map(o => o.id === orderId ? {
      ...o,
      payment_status: 'Paid',
      payment_mode: 'Cash',
      paid_collected_by: collector,
      payment_verified_online: false
    } : o);
    setOrders(updated);
    setLocalStore('orders', updated);

    recordEmployeeActivity({
      employeeName: collector,
      employeeRole: 'Cashier & POS Lead',
      tableNumber: targetOrder.table_number || 'Dine-In',
      actionType: 'PAYMENT_COLLECTED_CASH',
      amount: targetOrder.total,
      paymentMethod: 'Cash',
      details: `Cash payment of ₹${targetOrder.total} collected & confirmed for Table ${targetOrder.table_number || 'Dine-In'} by ${collector}`,
      type: 'payment',
      color: 'emerald'
    });
    playSound('success');
  };

  const handleCancelOrderWithReason = (orderId, reason, staffName) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;
    const staff = staffName || authUser?.name || 'Admin';
    const updated = orders.map(o => o.id === orderId ? {
      ...o,
      status: 'Cancelled',
      cancel_reason: reason,
      cancelled_by: staff
    } : o);
    setOrders(updated);
    setLocalStore('orders', updated);

    recordEmployeeActivity({
      employeeName: staff,
      employeeRole: authUser?.role || 'Admin',
      tableNumber: targetOrder.table_number || 'Online Queue',
      actionType: 'ORDER_CANCELLED_OUT_OF_STOCK',
      amount: targetOrder.total,
      details: `Order #${targetOrder.id} cancelled. Reason: ${reason} (Authorized by ${staff})`,
      type: 'order',
      color: 'rose'
    });
    playSound('alert');
  };

  const handlePlaceCustomerOrder = (newOrder) => {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    setLocalStore('orders', updated);

    recordEmployeeActivity({
      employeeName: newOrder.customer_name || 'Guest User',
      employeeRole: 'Guest / QR Self-Order',
      tableNumber: newOrder.table_number || 'Online',
      actionType: 'ORDER_PLACED_QR',
      amount: newOrder.total,
      paymentMethod: newOrder.payment_mode || 'UPI',
      details: `Order #${newOrder.id} placed via QR at Table ${newOrder.table_number} (₹${newOrder.total})`,
      type: 'order',
      color: 'orange'
    });
    playSound('order');
  };

  const handleAddTable = (tableData) => {
    const tableObj = {
      id: tableData.number,
      number: tableData.number,
      capacity: parseInt(tableData.capacity, 10),
      zone: tableData.zone,
      status: 'available',
      current_order_id: null,
      timing: null
    };
    const updated = [...tables, tableObj];
    setTables(updated);
    setLocalStore('tables', updated);
    recordEmployeeActivity({
      employeeName: authUser?.name || 'Admin',
      employeeRole: authUser?.role || 'Admin',
      tableNumber: tableData.number,
      actionType: 'TABLE_ADDED',
      details: `Added new dining table ${tableData.number} (${tableData.zone}, Capacity: ${tableData.capacity})`,
      type: 'table',
      color: 'blue'
    });
    playSound('success');
  };

  const handleDeleteTable = (id) => {
    if (!window.confirm('Delete this dining table?')) return;
    const updated = tables.filter(t => t.id !== id);
    setTables(updated);
    setLocalStore('tables', updated);
    recordEmployeeActivity({
      employeeName: authUser?.name || 'Admin',
      employeeRole: authUser?.role || 'Admin',
      tableNumber: id,
      actionType: 'TABLE_DELETED',
      details: `Deleted dining table ${id}`,
      type: 'table',
      color: 'rose'
    });
  };

  const handleToggleStock = (itemId) => {
    const updated = menuItems.map(item => {
      if (item.id === itemId) {
        const nextState = !item.is_available;
        recordEmployeeActivity({
          employeeName: authUser?.name || 'Admin',
          employeeRole: authUser?.role || 'Admin',
          tableNumber: 'Kitchen Store',
          actionType: nextState ? 'DISH_IN_STOCK' : 'DISH_OUT_OF_STOCK',
          details: `Dish "${item.name}" marked as ${nextState ? 'Available / In-Stock' : 'OUT OF STOCK'}`,
          type: 'menu',
          color: nextState ? 'emerald' : 'rose'
        });
        return { ...item, is_available: nextState };
      }
      return item;
    });
    setMenuItems(updated);
    setLocalStore('menu_items', updated);
  };

  const handleApplyDiscount = (itemId, percent) => {
    const p = Number(percent) || 0;
    const updated = menuItems.map(item => {
      if (item.id === itemId) {
        const origPrice = Number(item.originalPrice || item.price || 0);
        const discountAmt = Math.round((origPrice * p) / 100);
        const finalPrice = Math.max(0, origPrice - discountAmt);
        return {
          ...item,
          originalPrice: origPrice,
          finalPrice: finalPrice,
          price: finalPrice,
          hasDiscount: true,
          discountPercent: p
        };
      }
      return item;
    });
    setMenuItems(updated);
    setLocalStore('menu_items', updated);
    const affectedItem = menuItems.find(i => i.id === itemId);
    recordEmployeeActivity({
      employeeName: authUser?.name || 'Darshit Rana',
      employeeRole: authUser?.role || 'Admin',
      tableNumber: 'Menu',
      actionType: 'DISCOUNT_APPLIED',
      details: `Applied ${p}% discount on "${affectedItem?.name || itemId}" (Discounted Price: ₹${Math.max(0, Math.round((affectedItem?.originalPrice || affectedItem?.price || 0) * (1 - p/100)))})`,
      type: 'menu',
      color: 'rose'
    });
    playSound('success');
  };

  const handleRemoveDiscount = (itemId) => {
    const updated = menuItems.map(item => {
      if (item.id === itemId) {
        const origPrice = Number(item.originalPrice || item.price || 0);
        return {
          ...item,
          finalPrice: origPrice,
          price: origPrice,
          hasDiscount: false,
          discountPercent: 0
        };
      }
      return item;
    });
    setMenuItems(updated);
    setLocalStore('menu_items', updated);
    const affectedItem = menuItems.find(i => i.id === itemId);
    recordEmployeeActivity({
      employeeName: authUser?.name || 'Darshit Rana',
      employeeRole: authUser?.role || 'Admin',
      tableNumber: 'Menu',
      actionType: 'DISCOUNT_REMOVED',
      details: `Removed discount on "${affectedItem?.name || itemId}". Restored original price ₹${affectedItem?.originalPrice || affectedItem?.price}`,
      type: 'menu',
      color: 'slate'
    });
    playSound('success');
  };

  const handleUpdateMenuItem = (updatedItem) => {
    const updated = menuItems.map(item => item.id === updatedItem.id ? updatedItem : item);
    setMenuItems(updated);
    setLocalStore('menu_items', updated);
    recordEmployeeActivity({
      employeeName: authUser?.name || 'Darshit Rana',
      employeeRole: authUser?.role || 'Admin',
      tableNumber: 'Menu',
      actionType: 'MENU_ITEM_UPDATED',
      details: `Updated dish "${updatedItem.name}" (Price: ₹${updatedItem.finalPrice || updatedItem.price})`,
      type: 'menu',
      color: 'orange'
    });
    playSound('success');
  };

  const handleAddMenuItem = (itemData) => {
    const itemObj = {
      ...itemData,
      id: `m_${Date.now()}`,
      originalPrice: Number(itemData.price),
      finalPrice: Number(itemData.price),
      hasDiscount: false,
      discountPercent: 0,
      orders_count: 0
    };
    const updated = [...menuItems, itemObj];
    setMenuItems(updated);
    setLocalStore('menu_items', updated);
    recordEmployeeActivity({
      employeeName: authUser?.name || 'Admin',
      employeeRole: authUser?.role || 'Admin',
      tableNumber: 'Menu',
      actionType: 'DISH_ADDED',
      details: `Created new dish "${itemObj.name}" in category "${itemObj.category}" (₹${itemObj.price})`,
      type: 'menu',
      color: 'emerald'
    });
    playSound('success');
  };

  const handleDeleteMenuItem = (id) => {
    const targetItem = menuItems.find(item => item.id === id);
    if (!window.confirm(`Remove "${targetItem?.name || 'this dish'}" from the menu?`)) return;
    const updated = menuItems.filter(item => item.id !== id);
    setMenuItems(updated);
    setLocalStore('menu_items', updated);
    recordEmployeeActivity({
      employeeName: authUser?.name || 'Admin',
      employeeRole: authUser?.role || 'Admin',
      tableNumber: 'Menu',
      actionType: 'DISH_DELETED',
      details: `Deleted dish "${targetItem?.name || id}" from menu`,
      type: 'menu',
      color: 'rose'
    });
  };

  const handleAddEmployee = (empData) => {
    const updated = [...employees, empData];
    setEmployees(updated);
    setLocalStore('employees', updated);
    recordEmployeeActivity({
      employeeName: authUser?.name || 'Darshit Rana',
      employeeRole: 'Admin / Owner',
      tableNumber: 'System',
      actionType: 'CREDENTIAL_GENERATED',
      details: `Generated login credentials for ${empData.name} (Role: ${empData.role}, Username: ${empData.username})`,
      type: 'staff',
      color: 'indigo'
    });
    playSound('success');
  };

  const handleDeleteEmployee = (empId, empName) => {
    if (!window.confirm(`Are you sure you want to delete staff credentials for ${empName || 'this employee'}?`)) return;
    const updated = employees.filter(e => e.id !== empId);
    setEmployees(updated);
    setLocalStore('employees', updated);
    recordEmployeeActivity({
      employeeName: authUser?.name || 'Darshit Rana',
      employeeRole: 'Admin / Owner',
      tableNumber: 'System',
      actionType: 'CREDENTIAL_DELETED',
      details: `Deleted login credentials for ${empName || empId}`,
      type: 'staff',
      color: 'rose'
    });
    playSound('success');
  };

  const handleAddCoupon = (couponData) => {
    const updated = [...coupons, couponData];
    setCoupons(updated);
    setLocalStore('coupons', updated);
    recordEmployeeActivity({
      employeeName: authUser?.name || 'Admin',
      employeeRole: 'Admin / Owner',
      tableNumber: 'Promo',
      actionType: 'COUPON_CREATED',
      details: `Created promo coupon "${couponData.code}" (${couponData.discount}${couponData.type === 'percentage' ? '%' : '₹'} off)`,
      type: 'promo',
      color: 'amber'
    });
    playSound('success');
  };

  const handleToggleCoupon = (id) => {
    const updated = coupons.map(c => c.id === id ? { ...c, active: !c.active } : c);
    setCoupons(updated);
    setLocalStore('coupons', updated);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    setLocalStore('settings', newSettings);
  };

  // IF CUSTOMER VIEW (OR SCANNED QR CODE) -> DIRECTLY SHOW TOUCH-FRIENDLY CUSTOMER MENU (NO LOGIN WALL)
  if (viewMode === 'customer') {
    return (
      <CustomerMenu
        currentTable={currentTable}
        setCurrentTable={setCurrentTable}
        categories={categories}
        menuItems={menuItems}
        orders={orders}
        coupons={coupons}
        onPlaceOrder={handlePlaceCustomerOrder}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        restaurantSettings={settings}
        onBackToAdmin={() => setViewMode('admin')}
      />
    );
  }

  // IF NOT AUTHENTICATED -> SHOW SIGNUP / LOGIN WALL (WITH DATABASE SYNC)
  if (!authUser) {
    return (
      <AuthPage
        onLoginSuccess={handleLoginSuccess}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenCustomerPreview={() => setViewMode('customer')}
      />
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD (MATCHING THE REFERENCE SCREENSHOT)
  return (
    <div className="min-h-screen bg-slate-100/70 font-sans flex text-slate-900">
      
      {/* 1. LEFT DARK SIDEBAR (SLATE-900 / #111827) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Top Logo & Restaurant Title */}
        <div>
          <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-heading font-black shadow-md">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-white font-heading tracking-tight leading-tight">
                  {settings?.restaurantName || 'Atmiya Dosa'}
                </h1>
                <p className="text-[10px] font-semibold text-slate-400">
                  {t('adminPanel')}
                </p>
              </div>
            </div>

            {/* Close button on mobile */}
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="p-4 space-y-1">
            
            {/* Dashboard */}
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
                activeTab === 'dashboard' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('dashboard')}</span>
            </button>

            {/* Orders */}
            <button
              onClick={() => { setActiveTab('orders'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-black transition ${
                activeTab === 'orders' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-4 h-4" />
                <span>{t('orders')}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-400/20 text-orange-400">
                6
              </span>
            </button>

            {/* Kitchen Panel */}
            <button
              onClick={() => { setActiveTab('kitchen'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
                activeTab === 'kitchen' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>{t('kitchenPanel')}</span>
            </button>

            {/* Tables */}
            <button
              onClick={() => { setActiveTab('tables'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
                activeTab === 'tables' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>{t('tables')}</span>
            </button>

            {/* Menu Management */}
            <button
              onClick={() => { setActiveTab('menu'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
                activeTab === 'menu' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>{t('menuManagement')}</span>
            </button>

            {/* Employees */}
            <button
              onClick={() => { setActiveTab('employees'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
                activeTab === 'employees' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('employees')}</span>
            </button>

            {/* Reports & Analytics */}
            <button
              onClick={() => { setActiveTab('reports'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
                activeTab === 'reports' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t('reportsAnalytics')}</span>
            </button>

            {/* Offers & Coupons */}
            <button
              onClick={() => { setActiveTab('offers'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
                activeTab === 'offers' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>{t('offersCoupons')}</span>
            </button>

            {/* QR Management */}
            <button
              onClick={() => { setActiveTab('qr'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
                activeTab === 'qr' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{t('qrManagement')}</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
                activeTab === 'settings' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{t('settings')}</span>
            </button>

          </nav>
        </div>

        {/* Sidebar Footer with Quote Banner & Appwrite credit */}
        <div className="p-4 space-y-3">
          
          {/* Food Graphic Banner */}
          <div className="rounded-2xl p-3 bg-slate-800/80 border border-slate-700/60 relative overflow-hidden">
            <div className="flex items-center space-x-3">
              <img 
                src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=120&q=80" 
                alt="Dosa Plate" 
                className="w-12 h-12 rounded-xl object-cover shrink-0" 
              />
              <div>
                <p className="text-[11px] font-black text-white font-heading leading-tight">
                  {t('goodFoodHappyPeople')}
                </p>
                <span className="text-[9px] font-bold text-orange-400">Pure Veg Authentic</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span>Version 1.0.0</span>
            <span>{t('poweredByAppwrite')} ❤️</span>
          </div>

        </div>

      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
        ></div>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* TOP HEADER BAR */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-sm px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between gap-4">
            
            {/* Mobile Hamburger & Greeting */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2">
                <Sun className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <div className="text-sm font-black text-slate-900 font-heading flex items-center space-x-1.5">
                    <span>{t('goodMorning')},</span>
                    <span className="text-orange-600">{authUser?.name || 'Darshit Rana'}</span>
                    <span>👑</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">
                    {authUser?.role || 'Admin'} • {settings?.restaurantName || 'Atmiya Dosa'}
                  </div>
                </div>
              </div>
            </div>

            {/* Global Search Bar (hidden on very small screens) */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100 border-none text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            {/* Right Controls: Live Clock, Language Dropdown, Notifications, User */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Date & Time Badge */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 font-mono">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                <span>{currentTimeStr}</span>
              </div>

              {/* 4-Language Dropdown Selector */}
              <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700">
                <Globe className="w-3.5 h-3.5 text-orange-500" />
                <select
                  value={currentLang}
                  onChange={(e) => setCurrentLang(e.target.value)}
                  className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="gu">ગુજરાતી</option>
                  <option value="hinglish">Hinglish</option>
                </select>
              </div>

              {/* Customer Menu Bypass Shortcut */}
              <button
                onClick={() => setViewMode('customer')}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold transition"
                title="Preview Guest Mobile QR Menu"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Menu</span>
              </button>

              {/* Kitchen KDS Shortcut */}
              <button
                onClick={() => setActiveTab('kitchen')}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition"
                title="Open Kitchen Display"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>KDS</span>
              </button>

              {/* Notification Bell with Badge */}
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow">
                    3
                  </span>
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl p-4 shadow-2xl border border-slate-200 space-y-2 z-50">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-slate-900 font-heading">Notifications</span>
                      <span className="text-[10px] font-bold text-orange-600">3 Unread</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-xl bg-orange-50 border border-orange-100">
                        <p className="font-bold text-slate-800">New Order #ORD1048 received</p>
                        <span className="text-[10px] text-slate-400">Table T04 • 2 mins ago</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="font-bold text-slate-800">Payment received ₹260 (UPI)</p>
                        <span className="text-[10px] text-slate-400">Table T07 • 12 mins ago</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="font-bold text-slate-800">Low Stock Alert: Basmati Rice</p>
                        <span className="text-[10px] text-slate-400">Kitchen Store • 1 hour ago</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Logout */}
              <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center font-heading">
                  DR
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </header>

        {/* 3. DYNAMIC BODY ROUTER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          
          {activeTab === 'dashboard' && (
            <ExecutiveDashboard
              restaurantSettings={settings}
              tables={tables}
              orders={orders}
              menuItems={menuItems}
              activity={activity}
              categories={categories}
              currentLang={currentLang}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAddOrder={() => setActiveTab('orders')}
              onOpenAddItem={() => setActiveTab('menu')}
              onOpenGenerateQR={() => setActiveTab('qr')}
              onOpenApplyCoupon={() => setActiveTab('offers')}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
              onMarkCashPaymentDone={handleMarkCashPaymentDone}
              onCancelOrderWithReason={handleCancelOrderWithReason}
              onAddNewOrder={() => setViewMode('customer')}
              currentStaff={{ name: authUser?.name || 'Darshit Rana', role: authUser?.role || 'Admin' }}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'kitchen' && (
            <KitchenPanelView
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'tables' && (
            <TablesView
              tables={tables}
              onAddTable={handleAddTable}
              onDeleteTable={handleDeleteTable}
              onSelectQRTable={(t) => {
                setActiveTab('qr');
              }}
              onSimulateCustomer={(tbl) => {
                setCurrentTable(tbl);
                setViewMode('customer');
              }}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'menu' && (
            <MenuManagementView
              categories={categories}
              menuItems={menuItems}
              onToggleStock={handleToggleStock}
              onAddMenuItem={handleAddMenuItem}
              onUpdateMenuItem={handleUpdateMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              onApplyDiscount={handleApplyDiscount}
              onRemoveDiscount={handleRemoveDiscount}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesView
              employees={employees}
              activity={activity}
              onAddEmployee={handleAddEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsAnalytics
              orders={orders}
            />
          )}

          {activeTab === 'offers' && (
            <OffersView
              coupons={coupons}
              onAddCoupon={handleAddCoupon}
              onToggleCoupon={handleToggleCoupon}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'qr' && (
            <QRManagementView
              tables={tables}
              restaurantSettings={settings}
              currentLang={currentLang}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              restaurantSettings={settings}
              onSaveSettings={handleSaveSettings}
              currentLang={currentLang}
              onLanguageChange={setCurrentLang}
            />
          )}

        </main>

        {/* 4. FOOTER */}
        <footer className="p-4 sm:px-8 border-t border-slate-200/80 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 font-medium">
            <span className="font-bold text-slate-800">{settings?.restaurantName || 'Atmiya Dosa'}</span>
            <span>•</span>
            <span>Restaurant Management System</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400">
            <span>Built with ❤️ for Restaurants</span>
            <span>|</span>
            <span className="text-orange-600 font-bold">Powered by Appwrite</span>
          </div>
        </footer>

      </div>

    </div>
  );
}
