import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Clock, 
  Plus, 
  Minus, 
  Utensils, 
  Tag, 
  Check, 
  BellRing, 
  GlassWater, 
  IndianRupee, 
  Flame,
  Leaf,
  X,
  CheckCircle2,
  Globe,
  ArrowRight,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { getTranslation } from '../lib/translations';
import { playSound } from '../lib/sound';

export default function CustomerMenu({ 
  currentTable, 
  setCurrentTable, 
  categories, 
  menuItems, 
  orders = [],
  coupons, 
  onPlaceOrder, 
  currentLang, 
  onLanguageChange,
  onBackToAdmin,
  restaurantSettings
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);

  const [cart, setCart] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState('');

  const [specialNote, setSpecialNote] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  const t = (key) => getTranslation(currentLang, key);

  // Filter items
  const filteredItems = menuItems.filter(item => {
    if (!item.is_available) return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (vegOnly && !item.is_veg) return false;
    if (spicyOnly && !item.is_spicy) return false;
    if (searchQuery.trim() !== '') {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  // Sort: Discounted items show FIRST as required in Section 4 of Admin.txt
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.hasDiscount && !b.hasDiscount) return -1;
    if (!a.hasDiscount && b.hasDiscount) return 1;
    return (b.orders_count || 0) - (a.orders_count || 0);
  });

  // Check for any recent cancelled order for this table (Section 7 of Admin.txt)
  const recentCancelledOrder = orders?.find(o => 
    (o.table_number === currentTable || o.table_number === `Table ${currentTable}`) && 
    o.status === 'Cancelled' && 
    o.cancel_reason
  );

  const getItemCartQty = (id) => {
    const found = cart.find(i => i.id === id);
    return found ? found.qty : 0;
  };

  const handleAddToCart = (item) => {
    const unitPrice = Number(item.finalPrice || item.price || 0);
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...item, price: unitPrice, qty: 1 }]);
    }
    playSound('order');
  };

  const handleRemoveFromCart = (id) => {
    const existing = cart.find(i => i.id === id);
    if (!existing) return;
    if (existing.qty === 1) {
      setCart(cart.filter(i => i.id !== id));
    } else {
      setCart(cart.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.05; // 5% GST
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      discount = (subtotal * appliedPromo.discount) / 100;
    } else {
      discount = Math.min(subtotal, appliedPromo.discount);
    }
  }
  const totalAmount = Math.max(0, subtotal + tax - discount);
  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleApplyPromo = () => {
    const found = coupons.find(c => c.code.toUpperCase() === promoCodeInput.trim().toUpperCase() && c.active);
    if (found) {
      if (subtotal >= found.min_order) {
        setAppliedPromo(found);
        setPromoMessage(`✅ Coupon ${found.code} applied successfully!`);
      } else {
        setPromoMessage(`⚠️ Minimum order of ₹ ${found.min_order} required for this coupon.`);
      }
    } else {
      setPromoMessage(`❌ Invalid or expired coupon code.`);
    }
  };

  const handleConfirmOrder = () => {
    if (cart.length === 0) return;

    const newId = `#ORD${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrderObj = {
      id: newId,
      table_number: currentTable,
      customer_name: `Table ${currentTable} Guest`,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      items_summary: cart.map(i => `${i.qty}x ${i.name}`).join(', '),
      subtotal: subtotal,
      tax: tax,
      discount: discount,
      total_amount: totalAmount,
      status: 'Preparing',
      tab_type: 'ongoing',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      payment_mode: paymentMode,
      special_note: specialNote
    };

    onPlaceOrder(newOrderObj);
    playSound('order');
    setPlacedOrderId(newId);
    setOrderSuccess(true);
    setCart([]);
    setShowCartDrawer(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            {onBackToAdmin && (
              <button 
                onClick={onBackToAdmin}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="Return to Admin POS"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg text-slate-900 font-heading">
                  {restaurantSettings?.restaurantName || 'Atmiya Dosa'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-100 text-orange-900 border border-orange-300">
                  Table {currentTable}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500">
                {restaurantSettings?.tagline || 'Pure Veg • Authentic Taste'}
              </p>
            </div>
          </div>

          {/* Language Selector Dropdown */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            <Globe className="w-3.5 h-3.5 text-orange-500" />
            <select 
              value={currentLang} 
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="gu">ગુજરાતી</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        
        {/* Out-of-Stock / Cancellation Alert Banner (Section 7 of Admin.txt) */}
        {recentCancelledOrder && (
          <div className="rounded-2xl p-4 bg-rose-50 border-2 border-rose-400 text-rose-950 shadow-md flex items-start space-x-3.5 animate-fadeIn">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="font-black text-rose-800 text-sm flex items-center space-x-2">
                <span>Order Notice for Table {currentTable}</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 font-mono text-[10px] font-bold">
                  {recentCancelledOrder.id}
                </span>
              </div>
              <p className="mt-1 font-semibold text-rose-900 leading-relaxed">
                Your order could not be fulfilled: <span className="font-black underline bg-rose-100 px-1 py-0.5 rounded">{recentCancelledOrder.cancel_reason}</span>
              </p>
              <p className="text-[11px] text-rose-700 mt-1 font-medium">
                Please select an alternative dish from our live menu below or notify floor staff.
              </p>
            </div>
          </div>
        )}

        {/* Banner with Restaurant Food Promo */}
        <div className="rounded-3xl p-5 bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md flex items-center justify-between overflow-hidden relative">
          <div className="space-y-1 z-10 max-w-xs sm:max-w-md">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
              Live Table Menu
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-heading leading-tight">
              Order Fresh From Your Phone
            </h2>
            <p className="text-xs text-orange-100 font-medium">
              No apps required. Select your dishes, customize notes, and place order directly to the kitchen.
            </p>
          </div>

          <img 
            src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=260&q=80" 
            alt="Dosa Plate" 
            className="w-24 h-20 sm:w-32 sm:h-24 rounded-2xl object-cover shadow-lg shrink-0 hidden sm:block" 
          />
        </div>

        {/* Search & Dietary Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchMenu')}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm font-semibold shadow-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {['All', 'Mysore Dosa', 'Fancy Dosa', 'Pav Bhaji & Pulao', 'Beverages', 'South Indian'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Veg & Spicy Toggles */}
          <div className="flex items-center space-x-3 text-xs font-bold">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition ${
                vegOnly ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>{t('vegOnly')}</span>
            </button>

            <button
              onClick={() => setSpicyOnly(!spicyOnly)}
              className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition ${
                spicyOnly ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{t('spicyOnly')}</span>
            </button>
          </div>
        </div>

        {/* Menu Items Grid - Sorted to place Discounted items FIRST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedItems.map(item => {
            const qty = getItemCartQty(item.id);
            const currentItemPrice = item.finalPrice || item.price;
            const originalItemPrice = item.originalPrice || item.price;
            const savings = Math.max(0, originalItemPrice - currentItemPrice);

            return (
              <div 
                key={item.id} 
                className={`bg-white rounded-3xl p-4 border shadow-sm flex items-center justify-between gap-3 hover:shadow-md transition relative ${
                  item.hasDiscount ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200/80'
                }`}
              >
                {/* Bold Red DISCOUNT Badge (Section 4 of Admin.txt) */}
                {item.hasDiscount && (
                  <div className="absolute -top-2.5 right-4 z-10 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] tracking-wider uppercase shadow-md flex items-center space-x-1 border border-white">
                    <span>🔥 DISCOUNT</span>
                    <span>{item.discountPercent}% OFF</span>
                  </div>
                )}

                <div className="space-y-1.5 flex-1 pr-2">
                  <div className="flex items-center space-x-1.5">
                    {item.is_veg && (
                      <span className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-sm flex items-center justify-center p-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      </span>
                    )}
                    {item.is_spicy && <Flame className="w-3.5 h-3.5 text-rose-500" />}
                    <span className="text-[10px] font-bold text-orange-600 uppercase">{item.category}</span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 font-heading leading-tight">{item.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                  
                  {/* Price Display with Strikethrough for Discount */}
                  <div className="flex items-baseline space-x-2 pt-1">
                    {item.hasDiscount ? (
                      <>
                        <span className="text-base font-black text-rose-600 font-heading">
                          ₹{currentItemPrice}
                        </span>
                        <span className="text-xs line-through text-slate-400 font-mono font-semibold">
                          ₹{originalItemPrice}
                        </span>
                        {savings > 0 && (
                          <span className="text-[9px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            SAVE ₹{savings}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-base font-black text-slate-950 font-heading">
                        ₹{currentItemPrice}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-2 shrink-0">
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-20 h-20 rounded-2xl object-cover shadow-sm" 
                  />

                  {qty === 0 ? (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-sm transition flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('addToCart')}</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-slate-950 text-white rounded-xl p-1 shadow">
                      <button 
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="p-1 hover:bg-slate-800 rounded-lg text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black px-1 font-mono">{qty}</span>
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="p-1 hover:bg-slate-800 rounded-lg text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Floating Bottom Cart Bar (if cart has items) */}
      {totalCartCount > 0 && !showCartDrawer && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
          <button
            onClick={() => setShowCartDrawer(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm shadow-2xl flex items-center justify-between border border-slate-800 animate-bounce"
          >
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-orange-500 text-white text-xs font-black flex items-center justify-center">
                {totalCartCount}
              </span>
              <span>{t('cart')}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-orange-400 font-mono">₹ {totalAmount.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Checkout Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-black text-slate-900 font-heading">Table {currentTable} Order</h3>
              </div>
              <button 
                onClick={() => setShowCartDrawer(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 divide-y divide-slate-100">
              {cart.map(item => (
                <div key={item.id} className="pt-2 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 font-heading">{item.name}</h4>
                    <span className="text-xs font-mono font-bold text-slate-500">₹ {item.price} each</span>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1">
                    <button 
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="p-1 hover:bg-slate-200 rounded-lg text-slate-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black px-1.5 font-mono">{item.qty}</span>
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="p-1 hover:bg-slate-200 rounded-lg text-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Instructions Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Kitchen Cooking Note</label>
              <input
                type="text"
                placeholder={t('specialInstructions')}
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Apply Coupon Code */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600">Have a Promo Coupon?</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME50"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <div className="text-[11px] font-bold text-slate-700">{promoMessage}</div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600">{t('paymentMode')}</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMode('UPI')}
                  className={`p-2.5 rounded-xl border transition ${
                    paymentMode === 'UPI' ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {t('payUPI')}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('Cash')}
                  className={`p-2.5 rounded-xl border transition ${
                    paymentMode === 'Cash' ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {t('payAtCounter')}
                </button>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="border-t border-dashed border-slate-200 pt-3 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-slate-600">
                <span>{t('subtotal')}:</span>
                <span>₹ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-600">
                <span>{t('tax')}:</span>
                <span>₹ {tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>{t('discount')}:</span>
                  <span>- ₹ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200 font-heading">
                <span>{t('total')}:</span>
                <span className="text-orange-600 font-mono">₹ {totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmOrder}
              className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-xl transition flex items-center justify-center space-x-2"
            >
              <span>{t('placeOrder')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}

      {/* Order Placed Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 font-heading">Order Placed!</h3>
              <p className="text-xs font-bold text-orange-600 font-mono">{placedOrderId}</p>
              <p className="text-xs font-medium text-slate-500 pt-1">
                {t('orderPlacedSuccess')} Your chef has started preparing your fresh food.
              </p>
            </div>

            <button
              onClick={() => setOrderSuccess(false)}
              className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs shadow-md transition"
            >
              Continue Dining
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
