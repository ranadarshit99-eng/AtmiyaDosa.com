import React, { useState } from 'react';
import { Utensils, Plus, Clock, Search, Sparkles, Check, X } from 'lucide-react';

export default function MenuManager({ categories, menuItems, onToggleStock, onAddMenuItem }) {
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category_id: categories[0]?.id || 'cat1',
    image_url: '',
    is_veg: true,
    is_spicy: false,
    is_available: true,
    is_featured: false,
    preparation_time: 15
  });

  const filteredItems = menuItems.filter(item => {
    if (selectedCat !== 'all' && item.category_id !== selectedCat) return false;
    if (search.trim() !== '') {
      return item.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    onAddMenuItem(newItem);
    setShowAddModal(false);
    setNewItem({
      name: '',
      description: '',
      price: '',
      category_id: categories[0]?.id || 'cat1',
      image_url: '',
      is_veg: true,
      is_spicy: false,
      is_available: true,
      is_featured: false,
      preparation_time: 15
    });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Utensils className="w-6 h-6 text-amber-400" />
            Food & Beverage Menu Manager
          </h2>
          <p className="text-xs text-slate-400">Manage digital menu catalog, prices, preparation timing, and instant stock switches.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Food Menu Item</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCat === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCat === c.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search dish name..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="glass-card rounded-3xl overflow-hidden border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="relative h-48 w-full">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {item.is_veg ? (
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-lg bg-emerald-950/90 text-emerald-400 border border-emerald-500/50">
                      🌱 VEG
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-lg bg-rose-950/90 text-rose-400 border border-rose-500/50">
                      🥩 NON-VEG
                    </span>
                  )}
                  {item.is_spicy && (
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-lg bg-amber-950/90 text-amber-400 border border-amber-500/50">
                      🔥 SPICY
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 font-mono font-black text-sm bg-slate-950/90 text-amber-400 border border-amber-500/40 rounded-xl shadow-lg">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Cook: ~{item.preparation_time} mins</span>
                </div>
                <h3 className="font-bold text-white text-base">{item.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/80 mt-2">
              <span className="text-xs text-slate-400">Stock Availability:</span>
              <button
                onClick={() => onToggleStock(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  item.is_available 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                <span>{item.is_available ? 'In Stock' : 'Sold Out'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-slate-800 space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold text-white">Add New Food Menu Item</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Dish Name</label>
                <input 
                  type="text" 
                  value={newItem.name} 
                  onChange={e => setNewItem({...newItem, name: e.target.value})} 
                  placeholder="Truffle Pasta"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newItem.price} 
                    onChange={e => setNewItem({...newItem, price: e.target.value})} 
                    placeholder="18.99"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select 
                    value={newItem.category_id} 
                    onChange={e => setNewItem({...newItem, category_id: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Image URL</label>
                <input 
                  type="url" 
                  value={newItem.image_url} 
                  onChange={e => setNewItem({...newItem, image_url: e.target.value})} 
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                <textarea 
                  value={newItem.description} 
                  onChange={e => setNewItem({...newItem, description: e.target.value})} 
                  placeholder="Ingredients..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none h-20"
                ></textarea>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newItem.is_veg} 
                    onChange={e => setNewItem({...newItem, is_veg: e.target.checked})}
                    className="accent-amber-500 w-4 h-4"
                  />
                  <span className="text-slate-200">Vegetarian</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newItem.is_spicy} 
                    onChange={e => setNewItem({...newItem, is_spicy: e.target.checked})}
                    className="accent-amber-500 w-4 h-4"
                  />
                  <span className="text-slate-200">Spicy</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button 
                type="submit"
                className="flex-1 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Add Menu Item
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
