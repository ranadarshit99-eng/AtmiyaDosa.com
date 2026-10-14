import React, { useState } from 'react';
import { 
  Utensils, 
  Plus, 
  Search, 
  Trash2, 
  X,
  IndianRupee,
  Percent,
  Sparkles,
  Tag,
  Edit2,
  Check,
  AlertCircle
} from 'lucide-react';
import { getTranslation } from '../../lib/translations';

export default function MenuManagementView({ 
  categories, 
  menuItems, 
  onToggleStock, 
  onAddMenuItem, 
  onUpdateMenuItem, 
  onDeleteMenuItem,
  onApplyDiscount,
  onRemoveDiscount,
  currentLang 
}) {
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [discountModalItem, setDiscountModalItem] = useState(null);
  const [discountPercentInput, setDiscountPercentInput] = useState(15);
  const [imagePreview, setImagePreview] = useState('');

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Mysore Dosa',
    price: '',
    description: '',
    is_veg: true,
    is_spicy: false,
    is_available: true,
    image_url: ''
  });

  const t = (key) => getTranslation(currentLang, key);

  // Sort: Discounted items showed FIRST as required in Section 4 of Admin.txt
  const sortedItems = [...menuItems].sort((a, b) => {
    if (a.hasDiscount && !b.hasDiscount) return -1;
    if (!a.hasDiscount && b.hasDiscount) return 1;
    return (b.orders_count || 0) - (a.orders_count || 0);
  });

  // Filter items by category and search term
  const filteredItems = sortedItems.filter(item => {
    const matchesCat = selectedCat === 'All' || item.category === selectedCat;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        if (editingItem) {
          setEditingItem({ ...editingItem, image_url: reader.result });
        } else {
          setNewItem({ ...newItem, image_url: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    const priceNum = parseFloat(newItem.price);
    
    onAddMenuItem({
      ...newItem,
      originalPrice: priceNum,
      finalPrice: priceNum,
      price: priceNum,
      hasDiscount: false,
      discountPercent: 0,
      image_url: newItem.image_url || imagePreview || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      orders_count: 0,
      rating: 4.8,
      prepTimeMins: 10
    });

    setShowAddModal(false);
    setImagePreview('');
    setNewItem({
      name: '',
      category: 'Mysore Dosa',
      price: '',
      description: '',
      is_veg: true,
      is_spicy: false,
      is_available: true,
      image_url: ''
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingItem.name || !editingItem.price) return;
    const priceNum = parseFloat(editingItem.price);
    
    const hasDisc = editingItem.hasDiscount;
    const discPct = editingItem.discountPercent || 0;
    const calcFinalPrice = hasDisc ? Math.round(priceNum * (1 - discPct / 100)) : priceNum;

    onUpdateMenuItem({
      ...editingItem,
      originalPrice: priceNum,
      finalPrice: calcFinalPrice,
      price: calcFinalPrice
    });

    setEditingItem(null);
  };

  const handleApplyDiscountSubmit = (e) => {
    e.preventDefault();
    if (!discountModalItem) return;
    const pct = Math.max(1, Math.min(90, parseInt(discountPercentInput) || 15));
    onApplyDiscount(discountModalItem.id, pct);
    setDiscountModalItem(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#F3F4F6] shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1F2937] font-heading">
                Menu Management & Price Control
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Add dishes, modify prices in ₹, toggle stock availability, and manage highlighted discounts.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => { setImagePreview(''); setShowAddModal(true); }}
          className="px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 transition flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Category Pills & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#F3F4F6] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCat('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCat === 'All' 
                ? 'bg-[#1F2937] text-white shadow-sm' 
                : 'bg-[#F3F4F6] text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCat === cat.name 
                  ? 'bg-[#F97316] text-white shadow-sm shadow-orange-500/20' 
                  : 'bg-[#F3F4F6] text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish name, ingredients..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F3F4F6] border border-transparent focus:border-[#F97316] text-xs font-semibold focus:outline-none"
          />
        </div>
      </div>

      {/* Dish Grid with Red DISCOUNT styling and Priority Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredItems.map(item => {
          const isDiscounted = item.hasDiscount;
          const origPrice = item.originalPrice || item.price;
          const currentPrice = item.finalPrice || item.price;

          return (
            <div 
              key={item.id} 
              className={`bg-white rounded-3xl p-4 shadow-sm border transition flex flex-col justify-between relative overflow-hidden group ${
                isDiscounted 
                  ? 'border-red-400/80 ring-2 ring-red-100 shadow-red-50' 
                  : 'border-[#F3F4F6] hover:border-slate-300'
              }`}
            >
              {/* Highlight Red DISCOUNT Badge on Top (Section 4 Requirement) */}
              {isDiscounted && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md animate-pulse">
                    <Tag className="w-3 h-3 fill-current" />
                    DISCOUNT {item.discountPercent}% OFF
                  </span>
                </div>
              )}

              <div>
                {/* Image & Stock Badge */}
                <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 mb-3.5">
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      !item.is_available ? 'grayscale opacity-60' : ''
                    }`} 
                  />
                  
                  {/* Stock Pill */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => onToggleStock(item.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md transition ${
                        item.is_available 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.is_available ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </div>

                  {/* Category Tag */}
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-white">
                    {item.category}
                  </div>
                </div>

                {/* Dish Information */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-heading font-black text-sm text-[#1F2937] leading-snug line-clamp-1">
                      {item.name}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 min-h-[32px] leading-relaxed">
                    {item.description || 'Authentic dish freshly prepared using premium ingredients and desi butter.'}
                  </p>
                </div>
              </div>

              {/* Price & Discount Section */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    {isDiscounted ? (
                      <div className="flex items-baseline gap-2">
                        {/* Red Final Discounted Price */}
                        <span className="text-xl font-black text-red-600 font-heading">
                          ₹{currentPrice}
                        </span>
                        {/* Strike-through Original Price */}
                        <span className="text-xs text-slate-400 line-through font-bold">
                          ₹{origPrice}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-black text-[#1F2937] font-heading">
                        ₹{origPrice}
                      </span>
                    )}
                    <div className="text-[10px] text-slate-400 font-medium">Prep: {item.prepTimeMins || 10}m</div>
                  </div>

                  {/* Discount Trigger / Remove Discount Button */}
                  <div>
                    {isDiscounted ? (
                      <button
                        onClick={() => onRemoveDiscount(item.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold border border-red-200 transition"
                        title="Remove discount and return price to normal"
                      >
                        Remove Discount
                      </button>
                    ) : (
                      <button
                        onClick={() => { setDiscountModalItem(item); setDiscountPercentInput(15); }}
                        className="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#F97316] text-[11px] font-bold border border-orange-200 transition flex items-center gap-1"
                        title="Apply discount with red highlighted badge"
                      >
                        <Percent className="w-3 h-3" />
                        <span>Add Discount</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Action Row */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => setEditingItem({ ...item, price: origPrice })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F3F4F6] hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition"
                  >
                    <Edit2 className="w-3 h-3 text-slate-500" />
                    <span>Edit Price</span>
                  </button>

                  <button
                    onClick={() => onDeleteMenuItem(item.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1. APPLY DISCOUNT MODAL */}
      {discountModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#1F2937] font-heading">Apply Discount</h3>
                <p className="text-xs text-slate-500 font-medium">{discountModalItem.name}</p>
              </div>
              <button onClick={() => setDiscountModalItem(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyDiscountSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Original Price</label>
                <div className="text-lg font-black text-slate-900 font-mono">₹{discountModalItem.originalPrice || discountModalItem.price}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Discount Percentage</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[10, 15, 20, 25].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercentInput(pct)}
                      className={`py-2 rounded-xl text-xs font-black transition border ${
                        discountPercentInput === pct 
                          ? 'bg-red-600 text-white border-red-600' 
                          : 'bg-[#F3F4F6] text-slate-700 border-transparent hover:bg-slate-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={discountPercentInput}
                  onChange={(e) => setDiscountPercentInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-center focus:border-red-500 focus:outline-none"
                  placeholder="Custom %"
                />
              </div>

              <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>New Discounted Price:</span>
                  <span className="font-mono text-base font-black text-red-700">
                    ₹{Math.round((discountModalItem.originalPrice || discountModalItem.price) * (1 - discountPercentInput / 100))}
                  </span>
                </div>
                <p className="text-[11px] text-red-700">
                  This dish will be highlighted with red text name as <strong>DISCOUNT</strong> and prioritized at the top of the menu!
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-500/20 transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Highlight Discount</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT DISH & PRICE MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#1F2937] font-heading">Edit Dish Details & Price</h3>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#F97316]"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingItem.image_url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 mt-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD DISH MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#1F2937] font-heading">Add New Dish to Menu</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cheese Corn Masala Dosa"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#F97316]"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="180"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Crispy dosa topped with sweet corn, spices & molten cheese..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Upload Photo / URL</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#FFF7ED] file:text-[#F97316]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dish to Menu</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
