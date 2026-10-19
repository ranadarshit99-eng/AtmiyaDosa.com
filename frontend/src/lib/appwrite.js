import { supabase, RESTAURANT_ID } from './supabase';

// Supabase Cloud Configuration
export { supabase, RESTAURANT_ID };


// LocalStorage Persistence Layer with Real-Time Event Dispatching
export const getLocalStore = (key, fallback) => {
  try {
    const item = localStorage.getItem(`restaurant_${key}`);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    // Sanitize menu_items: remove any raw demo unsplash images as requested by user
    if (key === 'menu_items' && Array.isArray(parsed)) {
      return parsed.map(dish => ({
        ...dish,
        image_url: (dish.image_url && dish.image_url.includes('unsplash')) ? null : (dish.image_url || null)
      }));
    }
    return parsed;
  } catch (e) {
    console.error('Storage Read Error:', e);
    return fallback;
  }
};

export const setLocalStore = (key, value) => {
  try {
    localStorage.setItem(`restaurant_${key}`, JSON.stringify(value));
    window.dispatchEvent(new Event('restaurant_data_updated'));
  } catch (e) {
    console.error('Storage Write Error:', e);
  }
};

// Activity Recording Helper (Section 1.2 of Admin.txt)
export const recordEmployeeActivity = (
  employeeNameOrObj, 
  employeeRole = 'Admin', 
  actionType = 'GENERAL_ACTION', 
  details = '', 
  tableNumber = null, 
  orderId = null, 
  amount = null, 
  paymentMethod = null
) => {
  let name = employeeNameOrObj;
  let role = employeeRole;
  let action = actionType;
  let det = details;
  let tbl = tableNumber;
  let ord = orderId;
  let amt = amount;
  let payMethod = paymentMethod;

  if (typeof employeeNameOrObj === 'object' && employeeNameOrObj !== null) {
    name = employeeNameOrObj.employeeName || 'Darshit Rana';
    role = employeeNameOrObj.employeeRole || 'Admin';
    action = employeeNameOrObj.actionType || 'GENERAL_ACTION';
    det = employeeNameOrObj.details || employeeNameOrObj.text || '';
    tbl = employeeNameOrObj.tableNumber || null;
    ord = employeeNameOrObj.orderId || null;
    amt = employeeNameOrObj.amount || null;
    payMethod = employeeNameOrObj.paymentMethod || null;
  }

  const currentActivity = getLocalStore('activity', INITIAL_ACTIVITY);
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newEntry = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    time: timeStr,
    timestamp: now.toISOString(),
    employeeName: name || 'Darshit Rana',
    employeeRole: role || 'Admin',
    actionType: action,
    tableNumber: tbl,
    orderId: ord,
    amount: amt,
    paymentMethod: payMethod,
    details: det,
    text: det,
    type: action.toLowerCase().includes('payment') ? 'payment' : action.toLowerCase().includes('order') ? 'order' : 'staff',
    color: action.toLowerCase().includes('payment') ? 'emerald' : action.toLowerCase().includes('cancel') ? 'rose' : 'orange'
  };

  const updated = [newEntry, ...currentActivity.slice(0, 99)];
  setLocalStore('activity', updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('restaurant_data_updated'));
  }
  return updated;
};

// Auth Management Helpers
export const getAuthUser = () => {
  return getLocalStore('auth_user', {
    id: 'usr_admin',
    name: 'Darshit Rana',
    username: 'admin',
    email: 'admin@atmiyadosa.com',
    role: 'Admin',
    restaurantName: 'Atmiya Dosa Hub'
  });
};

export const setAuthUser = (user) => {
  setLocalStore('auth_user', user);
};

export const logoutAuthUser = () => {
  localStorage.removeItem('restaurant_auth_user');
  window.dispatchEvent(new Event('restaurant_data_updated'));
};

// Real Atmiya Dosa Hub Settings from Uploaded Menu
export const INITIAL_SETTINGS = {
  restaurantName: "Atmiya Dosa Hub",
  tagline: "Pure Veg Authentic Taste • Petlad",
  address: "College Chokdi, Petlad-Khambhat Road, Opp. Harshal Hospital, Nr. Khodiyar Mata Mandir, At. Petlad, Dist. Anand",
  phone: "+91 63530 59221",
  gstin: "24AAACA1234A1Z5",
  currency: "₹",
  language: "en",
  instagram: "@ATMIYA_DOSA_HUB"
};

export const INITIAL_TABLES = [
  { id: 'T01', number: 'T01', capacity: 4, zone: 'Main Hall', status: 'occupied', current_order_id: '#ORD1041', timing: '25m' },
  { id: 'T02', number: 'T02', capacity: 2, zone: 'Main Hall', status: 'occupied', current_order_id: '#ORD1045', timing: '42m' },
  { id: 'T03', number: 'T03', capacity: 4, zone: 'Patio Garden', status: 'available', current_order_id: null, timing: null },
  { id: 'T04', number: 'T04', capacity: 4, zone: 'AC Section', status: 'occupied', current_order_id: '#ORD1048', timing: '15m' },
  { id: 'T05', number: 'T05', capacity: 6, zone: 'Family Section', status: 'available', current_order_id: null, timing: null },
  { id: 'T06', number: 'T06', capacity: 2, zone: 'Main Hall', status: 'occupied', current_order_id: '#ORD1043', timing: '30m' },
  { id: 'T07', number: 'T07', capacity: 4, zone: 'AC Section', status: 'occupied', current_order_id: '#ORD1047', timing: '18m' },
  { id: 'T08', number: 'T08', capacity: 4, zone: 'Patio Garden', status: 'available', current_order_id: null, timing: null },
  { id: 'T09', number: 'T09', capacity: 4, zone: 'Main Hall', status: 'occupied', current_order_id: '#ORD1044', timing: '36m' },
  { id: 'T10', number: 'T10', capacity: 6, zone: 'Family Section', status: 'available', current_order_id: null, timing: null },
  { id: 'T11', number: 'T11', capacity: 2, zone: 'AC Section', status: 'occupied', current_order_id: '#ORD1046', timing: '10m' },
  { id: 'T12', number: 'T12', capacity: 4, zone: 'Patio Garden', status: 'available', current_order_id: null, timing: null },
  { id: 'T13', number: 'T13', capacity: 4, zone: 'Main Hall', status: 'available', current_order_id: null, timing: null },
  { id: 'T14', number: 'T14', capacity: 4, zone: 'AC Section', status: 'available', current_order_id: null, timing: null },
  { id: 'T15', number: 'T15', capacity: 6, zone: 'Family Section', status: 'available', current_order_id: null, timing: null },
  { id: 'T16', number: 'T16', capacity: 4, zone: 'Main Hall', status: 'occupied', current_order_id: '#ORD1042', timing: '50m' }
];

import { AUTHENTIC_CATEGORIES, AUTHENTIC_MENU_CARD_ITEMS } from './authenticMenuData';

export { AUTHENTIC_CATEGORIES, AUTHENTIC_MENU_CARD_ITEMS };

export const INITIAL_CATEGORIES = AUTHENTIC_CATEGORIES;
export const INITIAL_MENU_ITEMS = AUTHENTIC_MENU_CARD_ITEMS;

// 1-Click Load Authentic 7 Menu Cards or Clear Menu for Manual Creation
export const loadAuthenticMenuCards = () => {
  setLocalStore('menu_items', AUTHENTIC_MENU_CARD_ITEMS);
  window.dispatchEvent(new Event('restaurant_data_updated'));
  recordEmployeeActivity('DARSHIT RANA', 'Admin', 'MENU_SEEDED', 'Loaded all 177 authentic dishes from the 7 restaurant menu cards (pure-veg, zero stock photos)');
  return AUTHENTIC_MENU_CARD_ITEMS;
};

export const clearMenuItems = () => {
  setLocalStore('menu_items', []);
  window.dispatchEvent(new Event('restaurant_data_updated'));
  recordEmployeeActivity('DARSHIT RANA', 'Admin', 'MENU_CLEARED', 'Cleared all menu items so user can create their custom menu from scratch');
  return [];
};


// Real Orders with Payment Logic & Wait Time (Sections 2, 7 & 8 of Admin.txt)
export const INITIAL_ORDERS = [
  {
    id: '#ORD1048',
    table_number: 'T04',
    customer_name: 'Rahul Sharma',
    order_source: 'Dine-In',
    items: [
      { id: 'm_mysore_masala', name: 'Mysore Masala Dosa', price: 130, qty: 2 },
      { id: 'm_coke', name: 'Cold Drink', price: 40, qty: 1 }
    ],
    items_summary: '2x Mysore Masala, 1x Cold Drink',
    subtotal: 300,
    tax: 15,
    discount: 0,
    total_amount: 315,
    status: 'Preparing',
    tab_type: 'ongoing',
    time: '11:32 AM',
    placed_at: '2026-10-14T11:32:00Z',
    payment_mode: 'UPI',
    payment_status: 'Paid',
    payment_verified_online: true,
    paid_collected_by: 'UPI Gateway Direct',
    cancel_reason: null
  },
  {
    id: '#ORD1047',
    table_number: 'T07',
    customer_name: 'Anjali Patel',
    order_source: 'Dine-In',
    items: [
      { id: 'm_cheese_mysore', name: 'Cheese Mysore Dosa', price: 160, qty: 1 },
      { id: 'm_plain_paper', name: 'Plain Paper Dosa', price: 60, qty: 2 }
    ],
    items_summary: '1x Cheese Mysore, 2x Plain Paper',
    subtotal: 280,
    tax: 14,
    discount: 50,
    total_amount: 244,
    status: 'Ready',
    tab_type: 'ongoing',
    time: '11:18 AM',
    placed_at: '2026-10-14T11:18:00Z',
    payment_mode: 'UPI',
    payment_status: 'Paid',
    payment_verified_online: true,
    paid_collected_by: 'UPI Gateway Direct',
    cancel_reason: null
  },
  {
    id: '#ORD1046',
    table_number: 'T11',
    customer_name: 'Suresh Mehta',
    order_source: 'Dine-In',
    items: [
      { id: 'm_gotala_dosa', name: 'Surti Gotala Dosa', price: 220, qty: 1 }
    ],
    items_summary: '1x Surti Gotala Dosa',
    subtotal: 220,
    tax: 11,
    discount: 0,
    total_amount: 231,
    status: 'Cooking',
    tab_type: 'ongoing',
    time: '10:56 AM',
    placed_at: '2026-10-14T10:56:00Z',
    payment_mode: 'Cash',
    payment_status: 'Pending',
    payment_verified_online: false,
    paid_collected_by: null,
    cancel_reason: null
  },
  {
    id: '#ORD1049',
    table_number: 'Online-Zomato',
    customer_name: 'Priya Shah (Zomato #Z8941)',
    order_source: 'Zomato',
    items: [
      { id: 'm_bahubali_dosa', name: 'Bahubali Dosa', price: 298, qty: 1 },
      { id: 'm_butter_pav_bhaji', name: 'Amul Butter Pav Bhaji', price: 80, qty: 1 }
    ],
    items_summary: '1x Bahubali Dosa, 1x Butter Pav Bhaji',
    subtotal: 378,
    tax: 19,
    discount: 0,
    total_amount: 397,
    status: 'Cooking',
    tab_type: 'ongoing',
    time: '11:40 AM',
    placed_at: '2026-10-14T11:40:00Z',
    payment_mode: 'Online (Prepaid)',
    payment_status: 'Paid',
    payment_verified_online: true,
    paid_collected_by: 'Zomato Merchant Settle',
    cancel_reason: null
  },
  {
    id: '#ORD1050',
    table_number: 'Online-Swiggy',
    customer_name: 'Ketan Patel (Swiggy #S204)',
    order_source: 'Swiggy',
    items: [
      { id: 'm_paneer_mysore', name: 'Paneer Mysore Dosa', price: 128, qty: 2 }
    ],
    items_summary: '2x Paneer Mysore Dosa',
    subtotal: 256,
    tax: 13,
    discount: 0,
    total_amount: 269,
    status: 'Placed',
    tab_type: 'ongoing',
    time: '11:44 AM',
    placed_at: '2026-10-14T11:44:00Z',
    payment_mode: 'Online (Prepaid)',
    payment_status: 'Paid',
    payment_verified_online: true,
    paid_collected_by: 'Swiggy Pay',
    cancel_reason: null
  },
  {
    id: '#ORD1045',
    table_number: 'T02',
    customer_name: 'Vikram Joshi',
    order_source: 'Dine-In',
    items: [
      { id: 'm_mysore_masala', name: 'Mysore Masala Dosa', price: 130, qty: 2 },
      { id: 'm_butter_pav_bhaji', name: 'Amul Butter Pav Bhaji', price: 80, qty: 1 }
    ],
    items_summary: '2x Mysore Masala, 1x Pav Bhaji',
    subtotal: 340,
    tax: 17,
    discount: 0,
    total_amount: 357,
    status: 'Served',
    tab_type: 'ongoing',
    time: '10:42 AM',
    placed_at: '2026-10-14T10:42:00Z',
    payment_mode: 'Cash',
    payment_status: 'Paid',
    payment_verified_online: false,
    paid_collected_by: 'Anjali Patel (Cashier)',
    cancel_reason: null
  },
  {
    id: '#ORD1043',
    table_number: 'T06',
    customer_name: 'Kiran Shah',
    order_source: 'Dine-In',
    items: [
      { id: 'm_cheese_bhurji_mysore', name: 'Cheese Bhurji Mysore', price: 230, qty: 2 }
    ],
    items_summary: '2x Cheese Bhurji Mysore',
    subtotal: 460,
    tax: 23,
    discount: 20,
    total_amount: 463,
    status: 'Completed',
    tab_type: 'completed',
    time: '09:55 AM',
    placed_at: '2026-10-14T09:55:00Z',
    payment_mode: 'UPI',
    payment_status: 'Paid',
    payment_verified_online: true,
    paid_collected_by: 'UPI Gateway Direct',
    cancel_reason: null
  }
];

// Immutable Activity Audit Log (Section 1.2 of Admin.txt)
export const INITIAL_ACTIVITY = [
  { 
    id: 'act1', 
    time: '11:42 AM', 
    timestamp: '2026-10-14T11:42:00Z',
    type: 'payment', 
    employeeName: 'Anjali Patel',
    employeeRole: 'Cashier & POS Lead',
    tableNumber: 'T02',
    actionType: 'PAYMENT_COLLECTED_CASH',
    amount: 357,
    paymentMethod: 'Cash',
    details: 'Cash payment of ₹357 for Table 02 manually collected & confirmed by Anjali Patel',
    text: 'Cash payment of ₹357 for Table 02 manually collected & confirmed by Anjali Patel',
    color: 'emerald'
  },
  { 
    id: 'act2', 
    time: '11:35 AM', 
    timestamp: '2026-10-14T11:35:00Z',
    type: 'order', 
    employeeName: 'System / QR Self-Order',
    employeeRole: 'Guest Service',
    tableNumber: 'T04',
    actionType: 'ORDER_PLACED_QR',
    amount: 315,
    paymentMethod: 'UPI',
    details: 'Order #ORD1048 placed via QR at Table 04 by Rahul Sharma (UPI Paid ₹315)',
    text: 'Order #ORD1048 placed via QR at Table 04 by Rahul Sharma (UPI Paid ₹315)',
    color: 'orange'
  },
  { 
    id: 'act3', 
    time: '11:20 AM', 
    timestamp: '2026-10-14T11:20:00Z',
    type: 'staff', 
    employeeName: 'Darshit Rana',
    employeeRole: 'Admin / Owner',
    tableNumber: 'System',
    actionType: 'CREDENTIAL_GENERATED',
    amount: null,
    paymentMethod: null,
    details: 'Generated new staff login credentials for Anjali Patel (Role: Cashier)',
    text: 'Generated new staff login credentials for Anjali Patel (Role: Cashier)',
    color: 'indigo'
  },
  { 
    id: 'act4', 
    time: '11:18 AM', 
    timestamp: '2026-10-14T11:18:00Z',
    type: 'kitchen', 
    employeeName: 'Amit Kumar',
    employeeRole: 'Head Chef',
    tableNumber: 'T07',
    actionType: 'KDS_ORDER_READY',
    amount: null,
    paymentMethod: null,
    details: 'Order #ORD1047 marked as Ready for pickup by Amit Kumar',
    text: 'Order #ORD1047 marked as Ready for pickup by Amit Kumar',
    color: 'amber'
  },
  { 
    id: 'act5', 
    time: '11:05 AM', 
    timestamp: '2026-10-14T11:05:00Z',
    type: 'table', 
    employeeName: 'Riya Patel',
    employeeRole: 'Senior Waiter',
    tableNumber: 'T09',
    actionType: 'TABLE_SERVED',
    amount: null,
    paymentMethod: null,
    details: 'Table 09 food served and guest dining session initiated by Riya Patel',
    text: 'Table 09 food served and guest dining session initiated by Riya Patel',
    color: 'blue'
  }
];

// Staff Credentials with creation & deletion support (Section 1 of Admin.txt)
export const INITIAL_EMPLOYEES = [
  { id: 'emp1', name: 'Darshit Rana', username: 'admin', role: 'Admin / Owner', password: 'password123', phone: '+91 63530 59221', shift: 'Full Day', active: true, createdAt: '2026-09-01' },
  { id: 'emp2', name: 'Amit Kumar', username: 'chef_amit', role: 'Head Chef', password: 'password123', phone: '+91 97123 45678', shift: 'Morning Shift', active: true, createdAt: '2026-09-10' },
  { id: 'emp3', name: 'Riya Patel', username: 'waiter_riya', role: 'Senior Waiter', password: 'password123', phone: '+91 99245 67890', shift: 'Morning Shift', active: true, createdAt: '2026-09-15' },
  { id: 'emp4', name: 'Anjali Patel', username: 'cashier_anjali', role: 'Cashier & POS Lead', password: 'password123', phone: '+91 98980 11223', shift: 'Evening Shift', active: true, createdAt: '2026-10-01' },
  { id: 'emp5', name: 'Rohan Verma', username: 'kitchen_rohan', role: 'Kitchen Helper', password: 'password123', phone: '+91 98220 55667', shift: 'Evening Shift', active: true, createdAt: '2026-10-05' }
];

// Coupons (Section 5 of Admin.txt)
export const INITIAL_COUPONS = [
  { id: 'c1', code: 'WELCOME50', discount: 50, type: 'flat', min_order: 250, active: true },
  { id: 'c2', code: 'DOSA20', discount: 20, type: 'percentage', min_order: 300, active: true },
  { id: 'c3', code: 'FESTIVE100', discount: 100, type: 'flat', min_order: 500, active: true }
];

// Raw Ingredients & Inventory Stock Control (Enterprise Feature)
export const INITIAL_INVENTORY = [
  { id: 'inv_1', name: 'Special Dosa Batter', category: 'Raw Batter', currentStock: 18, unit: 'kg', minThreshold: 8, costPerUnit: 45, supplier: 'Atmiya Central Prep' },
  { id: 'inv_2', name: 'Amul Salted Butter', category: 'Dairy & Fats', currentStock: 24, unit: 'blocks (500g)', minThreshold: 10, costPerUnit: 275, supplier: 'Amul Authorized Distributor' },
  { id: 'inv_3', name: 'Amul Processed Cheese', category: 'Dairy & Fats', currentStock: 12, unit: 'tins (1kg)', minThreshold: 5, costPerUnit: 520, supplier: 'Amul Authorized Distributor' },
  { id: 'inv_4', name: 'Fresh Malai Paneer', category: 'Dairy & Fats', currentStock: 6.5, unit: 'kg', minThreshold: 4, costPerUnit: 340, supplier: 'Local Anand Dairy' },
  { id: 'inv_5', name: 'Pav Bread Fresh Loaves', category: 'Bakery', currentStock: 45, unit: 'packets', minThreshold: 20, costPerUnit: 25, supplier: 'Petlad Bakery Express' },
  { id: 'inv_6', name: 'Fresh Potatoes (Boiled)', category: 'Vegetables', currentStock: 28, unit: 'kg', minThreshold: 12, costPerUnit: 22, supplier: 'Petlad APMC Mandi' },
  { id: 'inv_7', name: 'Mysore Red Chilli Paste', category: 'Spices & Chutneys', currentStock: 4.2, unit: 'kg', minThreshold: 3, costPerUnit: 180, supplier: 'House Made' },
  { id: 'inv_8', name: 'Fresh Coconut Chutney', category: 'Chutneys', currentStock: 9, unit: 'liters', minThreshold: 4, costPerUnit: 60, supplier: 'House Daily Grind' },
  { id: 'inv_9', name: 'Toor Dal Sambhar Base', category: 'Gravies', currentStock: 15, unit: 'liters', minThreshold: 6, costPerUnit: 55, supplier: 'Kitchen Base Batch' }
];

// Live Table Service Requests (Call Waiter, Water, Bill)
export const INITIAL_SERVICE_CALLS = [
  { id: 'srv_1', tableNumber: 'T02', type: 'WATER', label: 'Extra Water Jar', time: '11:43 AM', status: 'pending' },
  { id: 'srv_2', tableNumber: 'T07', type: 'BILL', label: 'Bill / Payment Settle', time: '11:45 AM', status: 'pending' }
];



