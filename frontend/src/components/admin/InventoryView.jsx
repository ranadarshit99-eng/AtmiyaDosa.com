import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ArrowUpRight, 
  IndianRupee, 
  Layers, 
  Truck, 
  RotateCw,
  X,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { getTranslation } from '../../lib/translations';
import { playSound } from '../../lib/sound';

export default function InventoryView({ 
  inventory = [], 
  onRestockItem, 
  onAddInventoryItem, 
  currentStaff = { name: 'Amit Kumar', role: 'Head Chef' },
  currentLang 
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [restockModalItem, setRestockModalItem] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(5);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Dairy & Fats',
    currentStock: 10,
    unit: 'kg',
    minThreshold: 5,
    costPerUnit: 100,
    supplier: 'Local Market'
  });

  const t = (key) => getTranslation(currentLang, key);

  const categories = ['All', 'Dairy & Fats', 'Raw Batter', 'Bakery', 'Vegetables', 'Spices & Chutneys', 'Gravies'];

  const filteredItems = inventory.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.supplier?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // KPI telemetry
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(i => (Number(i.currentStock) || 0) <= (Number(i.minThreshold) || 0));
  const totalValuation = inventory.reduce((sum, i) => sum + ((Number(i.currentStock) || 0) * (Number(i.costPerUnit) || 0)), 0);

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!restockModalItem || !restockQuantity) return;
    if (onRestockItem) {
      onRestockItem(restockModalItem.id, Number(restockQuantity));
    }
    playSound('success');
    setRestockModalItem(null);
    setRestockQuantity(5);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name) return;
    if (onAddInventoryItem) {
      onAddInventoryItem(newItem);
    }
    playSound('success');
    setShowAddModal(false);
    setNewItem({
      name: '',
      category: 'Dairy & Fats',
      currentStock: 10,
      unit: 'kg',
      minThreshold: 5,
      costPerUnit: 100,
      supplier: 'Local Market'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & TELEMETRY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-heading shadow-sm">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 font-heading">
              Raw Materials & Kitchen Inventory
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Live tracking of dosa batter, Amul dairy, spices, and automated low-stock warnings.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* 2. KPI TELEMETRY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Tracked Raw Materials</span>
            <div className="text-2xl font-black text-slate-900 font-heading mt-1">{totalItems} SKUs</div>
            <span className="text-[10px] text-slate-400 font-semibold">Active in pantry & cold room</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between ${
          lowStockItems.length > 0 ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[11px] font-bold uppercase text-rose-700">Low Stock Alerts</span>
            <div className="text-2xl font-black text-rose-600 font-heading mt-1">{lowStockItems.length} Items</div>
            <span className="text-[10px] text-rose-600 font-semibold">Below minimum kitchen threshold</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Total Inventory Value</span>
            <div className="text-2xl font-black text-slate-900 font-heading mt-1 font-mono">₹{totalValuation.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono">Asset Capital Invested</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & CATEGORY FILTER */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search raw ingredient, batter, supplier name..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. INVENTORY DATA GRID */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Min. Threshold</th>
                <th className="p-4">Unit Cost</th>
                <th className="p-4">Supplier</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredItems.map(item => {
                const stock = Number(item.currentStock) || 0;
                const min = Number(item.minThreshold) || 0;
                const isLow = stock <= min;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-black text-slate-900 font-heading">
                      {item.name}
                    </td>

                    <td className="p-4 text-slate-600 font-semibold">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {item.category}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-black text-sm text-slate-900">
                      {stock} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                    </td>

                    <td className="p-4 font-mono text-slate-500">
                      {min} {item.unit}
                    </td>

                    <td className="p-4 font-mono font-bold text-slate-900">
                      ₹{item.costPerUnit}
                    </td>

                    <td className="p-4 text-slate-600 flex items-center space-x-1.5 pt-4">
                      <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.supplier || 'Local'}</span>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isLow 
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isLow ? '⚠️ LOW STOCK' : 'IN STOCK'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setRestockModalItem(item)}
                        className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 transition inline-flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. RESTOCK MODAL */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 font-heading">
                Restock {restockModalItem.name}
              </h3>
              <button 
                onClick={() => setRestockModalItem(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Current stock on floor: <span className="font-bold text-slate-900 font-mono">{restockModalItem.currentStock} {restockModalItem.unit}</span>
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity Received ({restockModalItem.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex justify-between font-mono">
                <span>Total New Stock:</span>
                <span className="font-black text-slate-900">
                  {(Number(restockModalItem.currentStock) || 0) + (Number(restockQuantity) || 0)} {restockModalItem.unit}
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md"
                >
                  Confirm Restock
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 6. ADD RAW MATERIAL ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 font-heading">
                Add New Raw Material SKU
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amul Salted Butter"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. kg / liters / blocks"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={newItem.currentStock}
                    onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItem.minThreshold}
                    onChange={(e) => setNewItem({ ...newItem, minThreshold: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cost / Unit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItem.costPerUnit}
                    onChange={(e) => setNewItem({ ...newItem, costPerUnit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Vendor</label>
                <input
                  type="text"
                  placeholder="e.g. Amul Authorized Distributor"
                  value={newItem.supplier}
                  onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
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
                  Save Material SKU
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
