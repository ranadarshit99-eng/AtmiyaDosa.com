import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Utensils, 
  Plus, 
  Trash2, 
  QrCode, 
  Clock, 
  Users, 
  CheckCircle2, 
  X,
  LayoutGrid,
  Map,
  ArrowRightLeft,
  Receipt,
  Check,
  Sparkles,
  IndianRupee,
  AlertCircle,
  Eye,
  Coffee,
  Printer,
  Download,
  Copy,
  ExternalLink,
  Wifi,
  Share2
} from 'lucide-react';
import { getTranslation } from '../../lib/translations';
import { playSound } from '../../lib/sound';

export default function TablesView({ 
  tables, 
  orders = [],
  restaurantSettings = {},
  onAddTable, 
  onDeleteTable, 
  onUpdateTable,
  onSettleTableBill,
  onShiftTable,
  onSelectQRTable, 
  onSimulateCustomer, 
  currentLang 
}) {
  const [selectedZone, setSelectedZone] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'floorplan'
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState('form'); // 'form' or 'created'
  const [createdTable, setCreatedTable] = useState(null);
  const [previewQRTable, setPreviewQRTable] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftTargetTable, setShiftTargetTable] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(null);
  
  const [newTable, setNewTable] = useState({ number: '', capacity: 4, zone: 'Main Hall' });

  const t = (key) => getTranslation(currentLang, key);
  const zones = ['All', 'Main Hall', 'AC Section', 'Patio Garden', 'Family Section'];

  const filteredTables = selectedZone === 'All' 
    ? tables 
    : tables.filter(t => t.zone === selectedZone);

  // Financial and occupancy telemetry
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const vacantTables = totalTables - occupiedTables;
  const totalCapacity = tables.reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);
  const activeFloorRevenue = orders
    .filter(o => o.status !== 'Completed' && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || o.total_amount || 0), 0);

  // Helper to get active order for a table
  const getTableActiveOrder = (tableNum) => {
    return orders.find(o => 
      (o.table_number === tableNum || o.table_number === `Table ${tableNum}` || o.table_number === tableNum.replace('T', 'Table ')) &&
      o.status !== 'Completed' && 
      o.status !== 'Cancelled'
    );
  };

  // Auto-calculate next table code (e.g. T17)
  const getNextTableNumber = () => {
    const nums = tables
      .map(t => {
        const match = (t.number || '').match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    const nextNum = max + 1;
    return `T${nextNum < 10 ? '0' + nextNum : nextNum}`;
  };

  const handleOpenAddModal = () => {
    const autoNum = getNextTableNumber();
    setNewTable({ number: autoNum, capacity: 4, zone: 'Main Hall' });
    setAddStep('form');
    setCreatedTable(null);
    setShowAddModal(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const cleanNumber = (newTable.number || '').trim().toUpperCase();
    if (!cleanNumber) return;

    // Check duplicate
    const exists = tables.some(t => t.number.toUpperCase() === cleanNumber);
    if (exists) {
      alert(`Table "${cleanNumber}" already exists in the system. Please use a distinct table code.`);
      return;
    }

    const tableObj = {
      ...newTable,
      number: cleanNumber,
      capacity: parseInt(newTable.capacity, 10) || 4
    };

    onAddTable(tableObj);
    setCreatedTable(tableObj);
    setAddStep('created');
    playSound('success');
  };

  const handleDownloadQR = (tableNum, svgId = 'qr-svg-new-table') => {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `AtmiyaDosa-QR-Table-${tableNum}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleQuickSettle = (table, method = 'Cash') => {
    const activeOrder = getTableActiveOrder(table.number);
    if (onSettleTableBill && activeOrder) {
      onSettleTableBill(activeOrder.id, table.number, method);
    } else {
      // Fallback: clear table status
      if (onUpdateTable) {
        onUpdateTable(table.id, { status: 'available', current_order_id: null, timing: null });
      }
    }
    playSound('cash');
    setSelectedTable(null);
  };

  const handleShiftTableSubmit = (e) => {
    e.preventDefault();
    if (!shiftTargetTable || !selectedTable) return;
    if (onShiftTable) {
      onShiftTable(selectedTable.number, shiftTargetTable);
    }
    playSound('success');
    setShowShiftModal(false);
    setSelectedTable(null);
    setShiftTargetTable('');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & TELEMETRY */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 font-heading">
                Floor Plan & Live Table Management
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Real-time visual table map with dining duration counters, party capacity, and QR codes.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Add Table Action */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('floorplan')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition ${
                viewMode === 'floorplan' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>2D Floor Map</span>
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table & QR</span>
          </button>
        </div>
      </div>

      {/* 2. STATS KPI PILLS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Tables</span>
            <div className="text-xl font-black text-slate-900 font-heading mt-0.5">{totalTables}</div>
            <span className="text-[10px] text-slate-400 font-semibold">{totalCapacity} Total Seats</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold font-mono">
            🪑
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Available</span>
            <div className="text-xl font-black text-emerald-600 font-heading mt-0.5">{vacantTables}</div>
            <span className="text-[10px] text-emerald-600/80 font-bold">Ready for Seating</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold font-mono">
            🟢
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-orange-700 uppercase">Dining Active</span>
            <div className="text-xl font-black text-orange-600 font-heading mt-0.5">{occupiedTables}</div>
            <span className="text-[10px] text-orange-600/80 font-bold">Orders in Progress</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold font-mono">
            ⏱️
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-700 uppercase">Floor Running Bill</span>
            <div className="text-xl font-black text-blue-700 font-heading mt-0.5">₹{activeFloorRevenue}</div>
            <span className="text-[10px] text-blue-600/80 font-bold">Unsettled Value</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. ZONE TABS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {zones.map(z => {
          const count = z === 'All' ? tables.length : tables.filter(t => t.zone === z).length;
          return (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-2 ${
                selectedZone === z 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{z}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedZone === z ? 'bg-slate-800 text-orange-400' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. MAIN TABLE RENDERING */}
      {viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredTables.map(table => {
            const isOccupied = table.status === 'occupied';
            const activeOrder = getTableActiveOrder(table.number);
            const orderTotal = activeOrder ? (activeOrder.total || activeOrder.total_amount || 0) : null;

            return (
              <div 
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`p-5 rounded-3xl border-2 transition space-y-3 cursor-pointer hover:shadow-lg relative overflow-hidden flex flex-col justify-between group ${
                  isOccupied 
                    ? 'bg-orange-50/40 border-orange-300 hover:border-orange-500' 
                    : 'bg-white border-slate-200 hover:border-emerald-400'
                }`}
              >
                {/* Status Indicator Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black font-heading text-slate-900">{table.number}</span>
                    {isOccupied && (
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
                    )}
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isOccupied 
                      ? 'bg-orange-100 text-orange-800 border border-orange-300' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {isOccupied ? 'Dining' : 'Vacant'}
                  </span>
                </div>

                {/* Table Metadata */}
                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Zone:</span>
                    <span className="font-bold text-slate-800">{table.zone}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Capacity:</span>
                    <span className="font-bold text-slate-800 flex items-center space-x-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{table.capacity} Guests</span>
                    </span>
                  </div>

                  {isOccupied && (
                    <div className="flex items-center justify-between text-orange-600 font-bold font-mono pt-1 border-t border-orange-100">
                      <span className="flex items-center space-x-1 text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{table.timing || '18m'}</span>
                      </span>
                      {orderTotal !== null && (
                        <span className="text-xs font-black text-slate-900">₹{orderTotal}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Bottom Quick Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setPreviewQRTable(table)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="View & Print QR Standee"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSimulateCustomer(table.number)}
                    className="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[11px] flex-1 text-center transition truncate"
                  >
                    Customer Menu
                  </button>

                  <button
                    onClick={() => onDeleteTable(table.id)}
                    className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition"
                    title="Delete Table"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* 2D VISUAL FLOOR MAP MODE */
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 text-white">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Restaurant Floor Visualizer</span>
              <h3 className="text-lg font-black font-heading text-white">Atmiya Dosa Hub Floor Plan</h3>
            </div>
            <div className="flex items-center space-x-4 text-xs font-bold text-slate-400">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span>Vacant</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500 inline-block animate-pulse"></span>
                <span>Occupied</span>
              </span>
            </div>
          </div>

          {/* Graphical Zones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Main Hall', 'AC Section', 'Patio Garden', 'Family Section'].map(zoneName => {
              const zoneTables = tables.filter(t => t.zone === zoneName);
              return (
                <div key={zoneName} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-heading font-black text-sm text-slate-200">{zoneName}</span>
                    <span className="text-xs text-slate-500 font-mono">{zoneTables.length} Tables</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {zoneTables.map(tbl => {
                      const occ = tbl.status === 'occupied';
                      return (
                        <div
                          key={tbl.id}
                          onClick={() => setSelectedTable(tbl)}
                          className={`p-3 rounded-2xl border text-center cursor-pointer transition transform hover:scale-105 ${
                            occ 
                              ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-lg shadow-orange-500/10' 
                              : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-emerald-500'
                          }`}
                        >
                          <div className="text-base font-black font-heading">{tbl.number}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{tbl.capacity}P</div>
                          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            occ ? 'bg-orange-500 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {occ ? 'Eating' : 'Free'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE TABLE OPERATIONS DRAWER / MODAL */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-xl font-black font-heading shadow-md">
                  {selectedTable.number}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-heading">
                    Table {selectedTable.number} Details
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedTable.zone} • {selectedTable.capacity} Seating Capacity
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedTable(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Ticket Status */}
            {(() => {
              const activeOrder = getTableActiveOrder(selectedTable.number);
              if (!activeOrder) {
                return (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <span className="text-2xl">🟢</span>
                    <h4 className="text-sm font-black text-emerald-900 font-heading">Table is Currently Vacant</h4>
                    <p className="text-xs text-emerald-700">Ready for walk-in seating or QR customer self-order.</p>
                    <div className="pt-2 flex items-center justify-center gap-2">
                      <button
                        onClick={() => onSimulateCustomer(selectedTable.number)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow flex items-center space-x-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open QR Menu</span>
                      </button>
                      <button
                        onClick={() => setPreviewQRTable(selectedTable)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 border border-slate-200"
                      >
                        <QrCode className="w-3.5 h-3.5 text-orange-600" />
                        <span>View QR Standee</span>
                      </button>
                    </div>
                  </div>
                );
              }

              const orderItems = activeOrder.items || [];
              const totalAmt = activeOrder.total || activeOrder.total_amount || 0;

              return (
                <div className="space-y-4">
                  {/* Order Overview Header */}
                  <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/90 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-orange-900 font-mono">{activeOrder.id}</span>
                      <div className="text-[11px] text-orange-700">{activeOrder.customer_name || 'Guest'}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-orange-200 text-orange-900 font-black text-[10px] uppercase">
                        {activeOrder.status}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{activeOrder.time || '12m ago'}</div>
                    </div>
                  </div>

                  {/* Itemized Bill Preview */}
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 text-xs">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="pt-1.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold font-mono text-orange-600">{item.qty}x</span>
                          <span className="font-bold text-slate-800">{item.name}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">₹{(item.price || 0) * (item.qty || 1)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total Bar */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900 font-heading">
                    <span>Total Outstanding:</span>
                    <span className="text-lg text-orange-600 font-mono">₹{totalAmt}</span>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => handleQuickSettle(selectedTable, 'Cash')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow flex items-center justify-center space-x-1.5 transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Settle Bill (Cash)</span>
                    </button>

                    <button
                      onClick={() => handleQuickSettle(selectedTable, 'UPI')}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow flex items-center justify-center space-x-1.5 transition"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Settle Bill (UPI)</span>
                    </button>

                    <button
                      onClick={() => setShowShiftModal(true)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Shift Table</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print KOT / Bill</span>
                    </button>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => setPreviewQRTable(selectedTable)}
                      className="w-full py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center space-x-1.5 border border-orange-200 transition"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View & Print Table Standee QR</span>
                    </button>
                  </div>

                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* 6. SHIFT TABLE MODAL */}
      {showShiftModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 font-heading">
              Transfer Table {selectedTable.number}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Select destination vacant table to move the running order:
            </p>

            <form onSubmit={handleShiftTableSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination Table</label>
                <select
                  required
                  value={shiftTargetTable}
                  onChange={(e) => setShiftTargetTable(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-orange-500"
                >
                  <option value="">Choose target table...</option>
                  {tables
                    .filter(t => t.number !== selectedTable.number && t.status !== 'occupied')
                    .map(t => (
                      <option key={t.id} value={t.number}>
                        {t.number} ({t.zone} - {t.capacity} seats)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!shiftTargetTable}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs shadow-md"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. DYNAMIC ADD TABLE & QR STANDEE GENERATOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-4xl w-full border border-slate-200 shadow-2xl space-y-6 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-black uppercase tracking-wider mb-1">
                    Touchless Dining QR System
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
                    {addStep === 'created' ? 'Table Created with Dynamic QR Code' : 'Add Dining Table & Generate QR Standee'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {addStep === 'created' 
                      ? 'The new dining table is live. Scan the QR code below to test customer ordering.'
                      : 'Assign table number and capacity — a live touchless QR standee is instantly generated.'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setAddStep('form');
                  setCreatedTable(null);
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Configuration Form & Real-time Live Preview */}
            {addStep === 'form' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side: Table Setup Form (6 cols) */}
                <form onSubmit={handleAddSubmit} className="lg:col-span-6 space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Table Identifier / Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. T17, VIP-1, P04"
                        value={newTable.number}
                        onChange={(e) => setNewTable({ ...newTable, number: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-orange-500 transition uppercase font-mono"
                      />
                      <span className="absolute right-3.5 top-3.5 text-[11px] font-bold text-slate-400">
                        Floor Code
                      </span>
                    </div>
                    {tables.some(t => t.number.toUpperCase() === (newTable.number || '').trim().toUpperCase()) && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Table code already taken on floor plan!</span>
                      </p>
                    )}
                  </div>

                  {/* Seating Capacity with Quick Pills */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Seating Capacity
                      </label>
                      <span className="text-xs font-bold text-orange-600 font-mono">
                        {newTable.capacity} Guests
                      </span>
                    </div>

                    <div className="grid grid-cols-6 gap-1.5 mb-2">
                      {[2, 4, 6, 8, 10, 12].map(seats => (
                        <button
                          key={seats}
                          type="button"
                          onClick={() => setNewTable({ ...newTable, capacity: seats })}
                          className={`py-1.5 rounded-xl text-xs font-black transition border ${
                            Number(newTable.capacity) === seats 
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {seats}P
                        </button>
                      ))}
                    </div>

                    <input
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={newTable.capacity}
                      onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-orange-500 transition"
                      placeholder="Custom capacity count"
                    />
                  </div>

                  {/* Floor Zone Selection */}
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Floor Zone Section
                    </label>
                    <select
                      value={newTable.zone}
                      onChange={(e) => setNewTable({ ...newTable, zone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-orange-500 cursor-pointer bg-white"
                    >
                      <option value="Main Hall">Main Hall</option>
                      <option value="AC Section">AC Section</option>
                      <option value="Patio Garden">Patio Garden</option>
                      <option value="Family Section">Family Section</option>
                      <option value="Rooftop Lounge">Rooftop Lounge</option>
                    </select>
                  </div>

                  {/* Touchless QR Guest Flow Highlight Card */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Same Touchless QR Purpose & Flow</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-emerald-800 font-medium">
                      <li className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Direct URL: <code className="font-mono bg-emerald-100 px-1 rounded">/?table={(newTable.number || 'T00').trim().toUpperCase()}</code></span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Bypasses admin login screen — guests land directly on live menu.</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Jain & dietary filter toggles + live cooking cart.</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Service buttons (Call Waiter, Water, Bill) & Kitchen KDS dispatch.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTable.number || tables.some(t => t.number.toUpperCase() === (newTable.number || '').trim().toUpperCase())}
                      className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-orange-500/20 flex items-center space-x-1.5 transition"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Confirm & Add Table with QR</span>
                    </button>
                  </div>
                </form>

                {/* Right Side: Dynamic Acrylic Standee Card Live Preview (6 cols) */}
                <div className="lg:col-span-6 flex flex-col items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <div className="w-full text-center space-y-1 mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Live Acrylic Standee Preview
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Dynamic preview updates instantly as you customize table code.
                    </p>
                  </div>

                  {/* Printable Standee Card */}
                  <div className="bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-xl text-center space-y-3.5 max-w-xs w-full relative printable-area">
                    <div className="space-y-1">
                      <div className="inline-block px-3 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider">
                        Touchless Dining
                      </div>
                      <h4 className="text-xl font-black text-slate-950 font-heading">
                        {restaurantSettings?.restaurantName || 'Atmiya Dosa Hub'}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500">
                        {restaurantSettings?.tagline || 'Pure Veg • Authentic Taste'}
                      </p>
                    </div>

                    {/* QR Code Container */}
                    <div className="p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 inline-block shadow-inner">
                      <QRCodeSVG
                        id="qr-svg-new-table"
                        value={`${window.location.origin}/?table=${encodeURIComponent((newTable.number || 'T00').trim().toUpperCase())}`}
                        size={160}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-base font-black text-slate-950 font-heading bg-slate-100 py-1 px-4 rounded-xl inline-block border border-slate-200 font-mono">
                        TABLE {(newTable.number || 'T00').trim().toUpperCase()}
                      </div>
                      <p className="text-[11px] font-black text-orange-600">
                        Scan to View Menu, Order & Pay
                      </p>
                      <div className="text-[9px] font-mono text-slate-400">
                        Wi-Fi: <span className="font-bold text-slate-600">Atmiya_Guest</span> | Pass: <span className="font-bold text-slate-600">delicious123</span>
                      </div>
                    </div>

                    <div className="text-[8px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                      Powered by Appwrite Real-Time Cloud
                    </div>
                  </div>

                  {/* Standee Action Buttons Bar */}
                  <div className="w-full grid grid-cols-2 gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => handleDownloadQR((newTable.number || 'T00').trim().toUpperCase(), 'qr-svg-new-table')}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-200 shadow-sm transition"
                    >
                      <Download className="w-3.5 h-3.5 text-orange-600" />
                      <span>Download PNG</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-200 shadow-sm transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-700" />
                      <span>Print Standee</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(`${window.location.origin}/?table=${(newTable.number || 'T00').trim().toUpperCase()}`)}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-200 shadow-sm transition"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{copiedUrl ? 'Copied Link' : 'Copy Menu URL'}</span>
                    </button>

                    <a
                      href={`${window.location.origin}/?table=${(newTable.number || 'T00').trim().toUpperCase()}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center space-x-1.5 border border-orange-200 shadow-sm transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test Live Menu</span>
                    </a>
                  </div>

                </div>

              </div>
            )}

            {/* Step 2: Table Successfully Created Celebration Screen */}
            {addStep === 'created' && createdTable && (
              <div className="space-y-6 text-center animate-fadeIn">
                
                {/* Celebration Badge */}
                <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 max-w-lg mx-auto space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 className="text-lg font-black text-emerald-950 font-heading">
                    Table {createdTable.number} is Live on the Floor Plan!
                  </h4>
                  <p className="text-xs text-emerald-800 font-medium">
                    The dining table has been provisioned ({createdTable.zone}, {createdTable.capacity} Guests). Its dedicated QR code is ready for customer table ordering.
                  </p>
                </div>

                {/* Standee Preview */}
                <div className="flex justify-center">
                  <div className="bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-2xl text-center space-y-3.5 max-w-xs w-full relative printable-area">
                    <div className="space-y-1">
                      <div className="inline-block px-3 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider">
                        Touchless Dining
                      </div>
                      <h4 className="text-xl font-black text-slate-950 font-heading">
                        {restaurantSettings?.restaurantName || 'Atmiya Dosa Hub'}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500">
                        {restaurantSettings?.tagline || 'Pure Veg • Authentic Taste'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 inline-block shadow-inner">
                      <QRCodeSVG
                        id="qr-svg-created-table"
                        value={`${window.location.origin}/?table=${encodeURIComponent(createdTable.number)}`}
                        size={170}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-lg font-black text-slate-950 font-heading bg-slate-100 py-1.5 px-4 rounded-xl inline-block border border-slate-200 font-mono">
                        TABLE {createdTable.number}
                      </div>
                      <p className="text-xs font-black text-orange-600">
                        Scan to View Menu, Order & Pay
                      </p>
                      <div className="text-[10px] font-mono text-slate-400">
                        Wi-Fi: <span className="font-bold text-slate-600">Atmiya_Guest</span> | Pass: <span className="font-bold text-slate-600">delicious123</span>
                      </div>
                    </div>

                    <div className="text-[9px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                      Powered by Appwrite Real-Time Cloud
                    </div>
                  </div>
                </div>

                {/* Final Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleDownloadQR(createdTable.number, 'qr-svg-created-table')}
                    className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 flex items-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Standee PNG</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow flex items-center space-x-2 transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Standee Card</span>
                  </button>

                  <a
                    href={`${window.location.origin}/?table=${createdTable.number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 flex items-center space-x-1.5 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Test Customer Menu</span>
                  </a>

                  <button
                    onClick={() => {
                      const autoNum = getNextTableNumber();
                      setNewTable({ number: autoNum, capacity: 4, zone: 'Main Hall' });
                      setAddStep('form');
                      setCreatedTable(null);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Table</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setAddStep('form');
                      setCreatedTable(null);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow transition"
                  >
                    <span>Done (View Floor Map)</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* 8. QUICK QR STANDEE MODAL FOR ANY TABLE */}
      {previewQRTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-heading">
                    Table {previewQRTable.number} QR Standee
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {previewQRTable.zone} • {previewQRTable.capacity} Guests
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewQRTable(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Standee Preview */}
            <div className="flex justify-center">
              <div className="bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-xl text-center space-y-3.5 max-w-xs w-full relative printable-area">
                <div className="space-y-1">
                  <div className="inline-block px-3 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider">
                    Touchless Dining
                  </div>
                  <h4 className="text-xl font-black text-slate-950 font-heading">
                    {restaurantSettings?.restaurantName || 'Atmiya Dosa Hub'}
                  </h4>
                  <p className="text-[11px] font-bold text-slate-500">
                    {restaurantSettings?.tagline || 'Pure Veg • Authentic Taste'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 inline-block shadow-inner">
                  <QRCodeSVG
                    id="qr-svg-preview-table"
                    value={`${window.location.origin}/?table=${encodeURIComponent(previewQRTable.number)}`}
                    size={170}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="text-lg font-black text-slate-950 font-heading bg-slate-100 py-1.5 px-4 rounded-xl inline-block border border-slate-200 font-mono">
                    TABLE {previewQRTable.number}
                  </div>
                  <p className="text-xs font-black text-orange-600">
                    Scan to View Menu, Order & Pay
                  </p>
                  <div className="text-[10px] font-mono text-slate-400">
                    Wi-Fi: <span className="font-bold text-slate-600">Atmiya_Guest</span> | Pass: <span className="font-bold text-slate-600">delicious123</span>
                  </div>
                </div>

                <div className="text-[9px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                  Powered by Appwrite Real-Time Cloud
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleDownloadQR(previewQRTable.number, 'qr-svg-preview-table')}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow flex items-center justify-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow flex items-center justify-center space-x-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Standee</span>
              </button>

              <button
                onClick={() => handleCopyLink(`${window.location.origin}/?table=${previewQRTable.number}`)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>

              <a
                href={`${window.location.origin}/?table=${previewQRTable.number}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center space-x-1.5 border border-orange-200 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Live Menu</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
