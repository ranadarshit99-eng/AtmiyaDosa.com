import { Client, Databases, Account } from 'appwrite';

// Initialize Appwrite Cloud Client
export const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('6ac08445000e533e223f');

export const databases = new Databases(client);
export const account = new Account(client);

export const DATABASE_ID = 'hotel_pos_db';
export const COLLECTIONS = {
  TABLES: 'tables',
  CATEGORIES: 'categories',
  MENU_ITEMS: 'menu_items',
  PROMOTIONS: 'promotions',
  ORDERS: 'orders',
  EMPLOYEES: 'employees',
  ACTIVITY: 'activity',
  SETTINGS: 'settings'
};

// LocalStorage Persistence Layer with Real-Time Event Dispatching
export const getLocalStore = (key, fallback) => {
  try {
    const item = localStorage.getItem(`restaurant_${key}`);
    return item ? JSON.parse(item) : fallback;
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

// Auth Management Helpers
export const getAuthUser = () => {
  return getLocalStore('auth_user', {
    id: 'usr_admin',
    name: 'Darshit Rana',
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

export const INITIAL_CATEGORIES = [
  { id: 'cat_mysore', name: 'Mysore Dosa', percentage: 30, icon: 'Flame' },
  { id: 'cat_fancy', name: 'Fancy Dosa', percentage: 25, icon: 'Sparkles' },
  { id: 'cat_masala', name: 'Masala Dosa', percentage: 20, icon: 'Utensils' },
  { id: 'cat_paper', name: 'Plain Paper Dosa', percentage: 10, icon: 'Leaf' },
  { id: 'cat_pavbhaji', name: 'Pav Bhaji & Pulao', percentage: 8, icon: 'UtensilsCrossed' },
  { id: 'cat_chinese', name: 'Chinese & Starters', percentage: 7, icon: 'ShoppingBag' }
];

export const INITIAL_MENU_ITEMS = [
  // Mysore Dosa
  {
    id: 'm_mysore_masala',
    name: 'Mysore Masala Dosa (માયસોર મસાલા)',
    category: 'Mysore Dosa',
    price: 130,
    description: 'Crispy dosa coated with spicy Mysore chutney and loaded with seasoned potato masala.',
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: true,
    is_available: true,
    orders_count: 142
  },
  {
    id: 'm_paneer_mysore',
    name: 'Paneer Mysore Dosa (પનીર માયસોર)',
    category: 'Mysore Dosa',
    price: 150,
    description: 'Fresh malai paneer grated generously over hot spicy Mysore spread.',
    image_url: 'https://images.unsplash.com/photo-1567184109411-b28f21ee097a?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: true,
    is_available: true,
    orders_count: 98
  },
  {
    id: 'm_cheese_mysore',
    name: 'Cheese Mysore Dosa (ચીઝ માયસોર)',
    category: 'Mysore Dosa',
    price: 160,
    description: 'Loaded with melted Amul cheese and signature Mysore red chutney.',
    image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: false,
    is_available: true,
    orders_count: 85
  },
  {
    id: 'm_sp_atmiya_mysore',
    name: 'S.P. Atmiya Mysore (સ્પે. આત્મીય માયસોર)',
    category: 'Mysore Dosa',
    price: 210,
    description: 'House specialty with dry fruits, paneer, double cheese, and royal Mysore gravy.',
    image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: true,
    is_available: true,
    orders_count: 110
  },
  {
    id: 'm_cheese_bhurji_mysore',
    name: 'Cheese Bhurji Mysore (ચીઝ ભુરજી માયસોર)',
    category: 'Mysore Dosa',
    price: 230,
    description: 'Tossed cheese bhurji stuffing with fresh capsicum and rich butter.',
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: true,
    is_available: true,
    orders_count: 67
  },

  // Fancy Dosa
  {
    id: 'm_jini_roll',
    name: 'Jini Roll Dosa (જીની રોલ)',
    category: 'Fancy Dosa',
    price: 200,
    description: 'Street-style vegetable stuffing topped with molten cheese, rolled and cut into upright bite pieces.',
    image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: true,
    is_available: true,
    orders_count: 124
  },
  {
    id: 'm_chinese_dosa',
    name: 'Chinese Dosa (ચાઈનીઝ ઢોંસા)',
    category: 'Fancy Dosa',
    price: 200,
    description: 'Indo-Chinese fusion with crunchy cabbage, capsicum, noodles, and Schezwan sauce.',
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: true,
    is_available: true,
    orders_count: 92
  },
  {
    id: 'm_spring_roll_dosa',
    name: 'Spring Roll Dosa (સ્પ્રિંગ રોલ)',
    category: 'Fancy Dosa',
    price: 250,
    description: 'Crispy cylindrical rolls loaded with veggies, cheese, and spicy dip.',
    image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: true,
    is_available: true,
    orders_count: 88
  },
  {
    id: 'm_gotala_dosa',
    name: 'Surti Gotala Dosa (ગોટાલા ઢોંસા)',
    category: 'Fancy Dosa',
    price: 220,
    description: 'Surat famous thick tomato-onion spiced gravy topped with crushed crispy dosa and cheese.',
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: true,
    is_available: true,
    orders_count: 135
  },

  // Plain & Paper Dosa
  {
    id: 'm_plain_paper',
    name: 'Plain Paper Dosa (પ્લેન પેપર)',
    category: 'Plain Paper Dosa',
    price: 60,
    description: 'Super wafer-thin, large golden crispy crepe served with sambar and coconut dip.',
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: false,
    is_available: true,
    orders_count: 75
  },
  {
    id: 'm_cheese_paper',
    name: 'Cheese Paper Dosa (ચીઝ પેપર)',
    category: 'Plain Paper Dosa',
    price: 90,
    description: 'Thin crispy paper dosa brushed with butter and covered with melted Amul cheese.',
    image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: false,
    is_available: true,
    orders_count: 62
  },

  // Special Items
  {
    id: 'm_bahubali_dosa',
    name: 'Bahubali Dosa (બાહુબલી ઢોસા)',
    category: 'Fancy Dosa',
    price: 350,
    description: 'Colossal king-size dosa loaded with 4 varieties of gravies, paneer tikka, and triple cheese.',
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: true,
    is_available: true,
    orders_count: 53
  },
  {
    id: 'm_mataka_dosa',
    name: 'Mataka Dosa (મટકા ઢોસા)',
    category: 'Fancy Dosa',
    price: 300,
    description: 'Slow-cooked bubbling cheese vegetable gravy served inside an authentic terracotta matka pot with dosa.',
    image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: true,
    is_available: true,
    orders_count: 71
  },

  // Pav Bhaji & Pulao
  {
    id: 'm_butter_pav_bhaji',
    name: 'Amul Butter Pav Bhaji (બટર પાંઉભાજી)',
    category: 'Pav Bhaji & Pulao',
    price: 80,
    description: 'Thick mashed vegetable curry slow-simmered with aromatic spices, served with 2 buttery pav buns.',
    image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: true,
    is_available: true,
    orders_count: 140
  },
  {
    id: 'm_cheese_pav_bhaji',
    name: 'Cheese Pav Bhaji (ચીઝ પાંઉભાજી)',
    category: 'Pav Bhaji & Pulao',
    price: 140,
    description: 'Butter pav bhaji smothered with mountain of grated cheese.',
    image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: true,
    is_available: true,
    orders_count: 88
  },
  {
    id: 'm_sp_atmiya_pulao',
    name: 'Sp. Atmiya Pulao (સ્પે. આત્મીય પુલાવ)',
    category: 'Pav Bhaji & Pulao',
    price: 150,
    description: 'Basmati rice tossed with roasted cashews, paneer chunks, green peas, and rich desi ghee.',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: false,
    is_available: true,
    orders_count: 65
  },

  // Chinese Starters & Noodles
  {
    id: 'm_manchurian_dry',
    name: 'Veg Manchurian Dry (મન્ચુરીયન ડ્રાય)',
    category: 'Chinese & Starters',
    price: 120,
    description: 'Crisp vegetable dumplings tossed in garlic, ginger, soya, and spring onions.',
    image_url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: true,
    is_available: true,
    orders_count: 82
  },
  {
    id: 'm_hakka_noodles',
    name: 'Hakka Noodles (હક્કા નુડલ્સ)',
    category: 'Chinese & Starters',
    price: 120,
    description: 'Wok-tossed noodles with julienne veggies, white pepper, and light soya sauce.',
    image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
    is_veg: true,
    is_spicy: false,
    is_available: true,
    orders_count: 73
  }
];

export const INITIAL_ORDERS = [
  {
    id: '#ORD1048',
    table_number: 'T04',
    customer_name: 'Rahul Sharma',
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
    payment_mode: 'UPI'
  },
  {
    id: '#ORD1047',
    table_number: 'T07',
    customer_name: 'Anjali Patel',
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
    payment_mode: 'UPI'
  },
  {
    id: '#ORD1046',
    table_number: 'T11',
    customer_name: 'Suresh Mehta',
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
    payment_mode: 'Cash'
  },
  {
    id: '#ORD1045',
    table_number: 'T02',
    customer_name: 'Vikram Joshi',
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
    payment_mode: 'Card'
  },
  {
    id: '#ORD1044',
    table_number: 'T09',
    customer_name: 'Pooja Bhatt',
    items: [
      { id: 'm_jini_roll', name: 'Jini Roll Dosa', price: 200, qty: 1 },
      { id: 'm_manchurian_dry', name: 'Veg Manchurian Dry', price: 120, qty: 1 }
    ],
    items_summary: '1x Jini Roll, 1x Manchurian Dry',
    subtotal: 320,
    tax: 16,
    discount: 0,
    total_amount: 336,
    status: 'Preparing',
    tab_type: 'ongoing',
    time: '10:28 AM',
    payment_mode: 'UPI'
  },
  {
    id: '#ORD1043',
    table_number: 'T06',
    customer_name: 'Kiran Shah',
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
    payment_mode: 'UPI'
  }
];

export const INITIAL_ACTIVITY = [
  { id: 'act1', time: '11:35 AM', type: 'order', text: 'Order #ORD1048 placed at Table 04 by Rahul Sharma', icon: 'ShoppingBag', color: 'orange' },
  { id: 'act2', time: '11:22 AM', type: 'payment', text: 'Payment received (UPI) ₹260 by Anjali Patel', icon: 'IndianRupee', color: 'emerald' },
  { id: 'act3', time: '11:18 AM', type: 'kitchen', text: 'Order #ORD1047 marked as Ready by Kitchen Staff', icon: 'ChefHat', color: 'amber' },
  { id: 'act4', time: '11:05 AM', type: 'table', text: 'Table 09 session closed by Riya (Waiter)', icon: 'Users', color: 'blue' },
  { id: 'act5', time: '10:52 AM', type: 'staff', text: 'New employee added (name: amit)', icon: 'UserCheck', color: 'indigo' }
];

export const INITIAL_EMPLOYEES = [
  { id: 'emp1', name: 'Darshit Rana', role: 'Admin / Owner', phone: '+91 63530 59221', shift: 'Full Day', active: true },
  { id: 'emp2', name: 'Amit Kumar', role: 'Head Chef', phone: '+91 97123 45678', shift: 'Morning Shift', active: true },
  { id: 'emp3', name: 'Riya Patel', role: 'Senior Waiter', phone: '+91 99245 67890', shift: 'Morning Shift', active: true },
  { id: 'emp4', name: 'Anjali Patel', role: 'Cashier & POS Lead', phone: '+91 98980 11223', shift: 'Evening Shift', active: true },
  { id: 'emp5', name: 'Rohan Verma', role: 'Kitchen Helper', phone: '+91 98220 55667', shift: 'Evening Shift', active: true }
];

export const INITIAL_COUPONS = [
  { id: 'c1', code: 'WELCOME50', discount: 50, type: 'flat', min_order: 250, active: true },
  { id: 'c2', code: 'DOSA20', discount: 20, type: 'percentage', min_order: 300, active: true },
  { id: 'c3', code: 'FESTIVE100', discount: 100, type: 'flat', min_order: 500, active: true }
];
