import React, { useState } from 'react';
import { Utensils, Plus, Trash2, Edit3, QrCode, Clock, Users, ShieldCheck } from 'lucide-react';

export default function FloorMap({ tables, onAddTable, onDeleteTable, onSelectQRTable, onSimulateCustomer }) {
  const [selectedZone, setSelectedZone] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [newTable, setNewTable] = useState({ number: '', capacity: 4, zone: 'Indoor Main' });

  const zones = ['All', 'Indoor Main', 'Patio Garden', 'Rooftop Lounge', 'VIP Royal Suite'];

  const filteredTables = selectedZone === 'All' 
    ? tables 
    : tables.filter(t => t.zone === selectedZone);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTable.number) return;
    onAddTable(newTable);
    setShowModal(false);
    setNewTable({ number: '', capacity: 4, zone: 'Indoor Main' });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Utensils className="w-6 h-6 text-amber-400" />
            Interactive Dining Floor Matrix
          </h2>
          <p className="text-xs text-slate-400">Manage seating layout, zones, party capacity, and live elapsed timers.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dining Table</span>
        </button>
      </div>

      {/* Zone Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {zones.map(zone => (
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedZone === zone 
                ? 'bg-amber-500 text-slate-950 shadow-lg' 
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {zone} ({zone === 'All' ? tables.length : tables.filter(t => t.zone === zone).length})
          </button>
        ))}
      </div>

      {/* Floor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.map(table => (
          <div 
            key={table.id} 
            className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 relative group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">{table.zone}</span>
                <h3 className="text-2xl font-black text-white">{table.number}</h3>
              </div>

              <span className={`px-3 py-1 text-xs font-extrabold uppercase rounded-full border ${
                table.status === 'occupied' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                table.status === 'food_served' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                table.status === 'billing' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {table.status.replace('_', ' ')}
              </span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between items-center">
                <span>Guest Capacity:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  {table.capacity} Seats
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Elapsed Timing:</span>
                <span className="font-mono text-amber-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {table.timing || 'No Active Guests'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => onSelectQRTable(table)}
                className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                QR Standee
              </button>

              <button
                onClick={() => onSimulateCustomer(table.number)}
                className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Simulate
              </button>

              <button
                onClick={() => onDeleteTable(table.id)}
                className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Table Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="glass-panel max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold text-white">Create New Dining Table</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Table Code (e.g. T-08)</label>
                <input 
                  type="text" 
                  value={newTable.number} 
                  onChange={e => setNewTable({...newTable, number: e.target.value})} 
                  placeholder="T-08"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Capacity</label>
                <input 
                  type="number" 
                  value={newTable.capacity} 
                  onChange={e => setNewTable({...newTable, capacity: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Floor Zone</label>
                <select 
                  value={newTable.zone} 
                  onChange={e => setNewTable({...newTable, zone: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                >
                  <option value="Indoor Main">Indoor Main Hall</option>
                  <option value="Patio Garden">Patio Garden</option>
                  <option value="Rooftop Lounge">Rooftop Lounge</option>
                  <option value="VIP Royal Suite">VIP Royal Suite</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button 
                type="submit"
                className="flex-1 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Create Table
              </button>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
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
