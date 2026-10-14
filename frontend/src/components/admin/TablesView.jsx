import React, { useState } from 'react';
import { Utensils, Plus, Trash2, QrCode, Clock, Users, CheckCircle2, X } from 'lucide-react';
import { getTranslation } from '../../lib/translations';

export default function TablesView({ tables, onAddTable, onDeleteTable, onSelectQRTable, onSimulateCustomer, currentLang }) {
  const [selectedZone, setSelectedZone] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [newTable, setNewTable] = useState({ number: '', capacity: 4, zone: 'Main Hall' });

  const t = (key) => getTranslation(currentLang, key);
  const zones = ['All', 'Main Hall', 'AC Section', 'Patio Garden', 'Family Section'];

  const filteredTables = selectedZone === 'All' 
    ? tables 
    : tables.filter(t => t.zone === selectedZone);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTable.number) return;
    onAddTable(newTable);
    setShowModal(false);
    setNewTable({ number: '', capacity: 4, zone: 'Main Hall' });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Utensils className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-slate-900 font-heading">
              {t('tables')} Floor Matrix & Occupancy
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time visual table map with dining duration counters, party capacity, and QR codes.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dining Table</span>
        </button>
      </div>

      {/* Zone Switcher */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {zones.map(z => (
          <button
            key={z}
            onClick={() => setSelectedZone(z)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedZone === z 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {z}
          </button>
        ))}
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredTables.map(table => {
          const isOccupied = table.status === 'occupied';
          return (
            <div 
              key={table.id}
              className={`p-5 rounded-3xl border-2 transition space-y-3 relative overflow-hidden flex flex-col justify-between ${
                isOccupied 
                  ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950' 
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-heading text-slate-900">{table.number}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isOccupied ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isOccupied ? 'Occupied' : 'Available'}
                </span>
              </div>

              <div className="space-y-1 text-xs font-medium text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Zone:</span>
                  <span className="font-bold text-slate-800">{table.zone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Seats:</span>
                  <span className="font-bold text-slate-800">{table.capacity} Guests</span>
                </div>
                {table.timing && (
                  <div className="flex items-center justify-between text-orange-600 font-bold font-mono">
                    <span>Seated Time:</span>
                    <span>{table.timing}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectQRTable(table)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                  title="Generate Table QR Standee"
                >
                  <QrCode className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSimulateCustomer(table.number)}
                  className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[11px] flex-1 text-center"
                >
                  Guest Menu
                </button>

                <button
                  onClick={() => onDeleteTable(table.id)}
                  className="p-2 rounded-xl hover:bg-rose-50 text-rose-500"
                  title="Delete Table"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Table Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 font-heading">Add New Table</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Table Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T17"
                  value={newTable.number}
                  onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Floor Zone</label>
                <select
                  value={newTable.zone}
                  onChange={(e) => setNewTable({ ...newTable, zone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="Main Hall">Main Hall</option>
                  <option value="AC Section">AC Section</option>
                  <option value="Patio Garden">Patio Garden</option>
                  <option value="Family Section">Family Section</option>
                </select>
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
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md"
                >
                  Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
