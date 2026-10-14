import React, { useState } from 'react';
import { 
  Utensils, 
  Plus, 
  Search, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Flame, 
  Leaf, 
  Trash2, 
  X,
  IndianRupee,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { getTranslation } from '../../lib/translations';

export default function MenuManagementView({ categories, menuItems, onToggleStock, onAddMenuItem, onDeleteMenuItem, currentLang }) {
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Dosa',
    price: '',
    description: '',
    is_veg: true,
    is_spicy: false,
    is_available: true,
    image_url: ''
  });

  const t = (key) => getTranslation(currentLang, key);

  // Filter items
  const filteredItems = menuItems.filter(item => {
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
        setNewItem({ ...newItem, image_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    
    onAddMenuItem({
      ...newItem,
      image_url: newItem.image_url || imagePreview || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      price: parseFloat(newItem.price),
      orders_count: 0
    });

    setShowAddModal(false);
    setImagePreview('');
    setNewItem({
      name: '',
      category: 'Dosa',
      price: '',
      description: '',
      is_veg: true,
      is_spicy: false,
      is_available: true,
      image_url: ''
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Utensils className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-slate-900 font-heading">
              {t('menuManagement')} & Recipe Catalog
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Upload dish photos, adjust prices in ₹, manage dietary tags, and toggle instant kitchen stock availability.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addItem')}</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Dosa', 'South Indian', 'Pizza & Fast Food', 'Beverages', 'Others & Desserts'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCat === cat 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchMenu')}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
            
            <div className="relative h-44 w-full bg-slate-100">
              <img 
                src={item.image_url} 
                alt={item.name} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                {item.is_veg && (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-600/90 text-white text-[10px] font-black backdrop-blur-sm flex items-center space-x-1 shadow-sm">
                    <Leaf className="w-3 h-3" />
                    <span>Pure Veg</span>
                  </span>
                )}
                {item.is_spicy && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-600/90 text-white text-[10px] font-black backdrop-blur-sm flex items-center space-x-1 shadow-sm">
                    <Flame className="w-3 h-3" />
                    <span>Spicy</span>
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shadow-sm ${
                  item.is_available 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-rose-500 text-white'
                }`}>
                  {item.is_available ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{item.category}</span>
                  <span className="text-base font-black text-slate-900 font-heading">₹ {item.price}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 font-heading mt-1">{item.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onToggleStock(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    item.is_available 
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  <span>{item.is_available ? 'Mark Out of Stock' : 'Mark Available'}</span>
                </button>

                {onDeleteMenuItem && (
                  <button
                    onClick={() => onDeleteMenuItem(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add Dish Modal with Photo Upload */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 font-heading">{t('addItem')}</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Photo Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dish Photo (Upload or Paste URL)</label>
                <div className="flex items-center space-x-3">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    {imagePreview || newItem.image_url ? (
                      <img src={imagePreview || newItem.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-200">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileChange} 
                        className="hidden" 
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste image web link..."
                      value={newItem.image_url}
                      onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schezwan Spring Roll Dosa"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="Dosa">Dosa</option>
                    <option value="South Indian">South Indian</option>
                    <option value="Pizza & Fast Food">Pizza & Fast Food</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Others & Desserts">Others & Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Describe the dish ingredients and taste..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                ></textarea>
              </div>

              <div className="flex items-center space-x-6 pt-1">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItem.is_veg}
                    onChange={(e) => setNewItem({ ...newItem, is_veg: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span>Pure Veg Item</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItem.is_spicy}
                    onChange={(e) => setNewItem({ ...newItem, is_spicy: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span>Spicy Item</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md"
                >
                  Save Dish to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
