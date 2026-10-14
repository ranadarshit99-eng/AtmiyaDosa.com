import React, { useState } from 'react';
import { Box, Plus, AlertTriangle, CheckCircle2, TrendingDown, DollarSign } from 'lucide-react';

export default function InventoryManager({ inventory, onUpdateStock, onAddIngredient }) {
  const [showModal, setShowModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    category: 'Dairy & Fats',
    stock_quantity: 10,
    unit: 'kg',
    reorder_level: 5,
    cost_per_unit: 5.0
  });

  const lowStockCount = inventory.filter(item => item.status === 'low' || item.stock_quantity <= item.reorder_level).length;
  const totalValuation = inventory.reduce((sum, item) => sum + (item.stock_quantity * item.cost_per_unit), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newIngredient.name) return;
    const itemObj = {
      ...newIngredient,
      id: `inv_${Date.now()}`,
      stock_quantity: parseFloat(newIngredient.stock_quantity),
      reorder_level: parseFloat(newIngredient.reorder_level),
      cost_per_unit: parseFloat(newIngredient.cost_per_unit),
      status: parseFloat(newIngredient.stock_quantity) <= parseFloat(newIngredient.reorder_level) ? 'low' : 'good'
    };
    onAddIngredient(itemObj);
    setShowModal(false);
    setNewIngredient({
      name: '',
      category: 'Dairy & Fats',
      stock_quantity: 10,
      unit: 'kg',
      reorder_level: 5,
      cost_per_unit: 5.0
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Box className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-black text-slate-950 font-heading">
              Kitchen Raw Stock & Inventory Manager
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track daily culinary ingredients, safety thresholds, supplier costs, and automatic re-ordering alerts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-slate-950 text-white font-black text-xs hover:bg-slate-900 shadow-md transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add Raw Ingredient</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Total Tracked Items</span>
          <div className="text-2xl font-black text-slate-950 mt-2 font-heading">{inventory.length} SKUs</div>
          <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">100% active catalog</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Low Stock Warnings</span>
          <div className="text-2xl font-black text-rose-600 mt-2 font-heading flex items-center space-x-2">
            <span>{lowStockCount}</span>
            {lowStockCount > 0 && <AlertTriangle className="w-5 h-5 text-rose-600" />}
          </div>
          <span className="text-xs text-slate-500 font-bold mt-1 inline-block">Items below safety reorder level</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Total Inventory Valuation</span>
          <div className="text-2xl font-black text-slate-950 mt-2 font-heading">${totalValuation.toFixed(2)}</div>
          <span className="text-xs text-slate-500 font-bold mt-1 inline-block">Current kitchen asset value</span>
        </div>

      </div>

      {/* Ingredients Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-black text-sm text-slate-950 uppercase tracking-wider font-heading">
            Live Raw Ingredients Roster
          </h3>
          <span className="text-xs text-slate-500 font-bold">Auto-deduction on Kitchen KDS preparation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Ingredient Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Reorder Threshold</th>
                <th className="p-4">Cost / Unit</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {inventory.map(item => {
                const isLow = item.stock_quantity <= item.reorder_level;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-black text-slate-950 font-heading text-sm">
                      {item.name}
                    </td>
                    <td className="p-4 text-slate-600 font-bold">
                      {item.category}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-950">
                      {item.stock_quantity} {item.unit}
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      {item.reorder_level} {item.unit}
                    </td>
                    <td className="p-4 font-mono text-slate-800">
                      ${item.cost_per_unit.toFixed(2)}
                    </td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Sufficient
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => onUpdateStock(item.id, Math.max(0, item.stock_quantity - 1))}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold border border-slate-300"
                        title="Reduce 1 unit"
                      >
                        -1 {item.unit}
                      </button>
                      <button
                        onClick={() => onUpdateStock(item.id, item.stock_quantity + 5)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black shadow-sm"
                        title="Add 5 units"
                      >
                        +5 {item.unit}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Ingredient Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-slate-300 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-950 font-heading">Add Raw Ingredient</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ingredient Name</label>
                <input
                  type="text"
                  required
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  placeholder="e.g. Royal Shahi Jeera"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newIngredient.category}
                    onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Dairy & Fats">Dairy & Fats</option>
                    <option value="Grains & Rice">Grains & Rice</option>
                    <option value="Poultry & Meat">Poultry & Meat</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Condiments">Condiments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="ltr">ltr (Liters)</option>
                    <option value="pcs">pcs (Pieces)</option>
                    <option value="gm">gm (Grams)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newIngredient.stock_quantity}
                    onChange={(e) => setNewIngredient({ ...newIngredient, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reorder Lvl</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newIngredient.reorder_level}
                    onChange={(e) => setNewIngredient({ ...newIngredient, reorder_level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cost/Unit ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newIngredient.cost_per_unit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, cost_per_unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md"
                >
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
