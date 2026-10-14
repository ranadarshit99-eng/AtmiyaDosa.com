import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, Download, ExternalLink, Sparkles, Check } from 'lucide-react';

export default function QRStudio({ tables, selectedQRTable, onClose }) {
  const [activeTable, setActiveTable] = useState(selectedQRTable || tables[0] || null);
  const [copied, setCopied] = useState(false);

  if (!activeTable) return null;

  const tableUrl = `${window.location.origin}/?table=${activeTable.number}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-slide-up">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <QrCode className="w-6 h-6 text-amber-400" />
            Smart Table QR Code Generator & Printing Suite
          </h2>
          <p className="text-xs text-slate-400">Generate, customize, and print high-resolution acrylic table standees for digital ordering.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print HD Table Standee</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table Selector List */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Select Table to Generate QR</h3>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => setActiveTable(table)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                  activeTable.id === table.id 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <span className="font-extrabold text-sm text-white block">{table.number}</span>
                  <span className="text-[11px] text-slate-400">{table.zone} • {table.capacity} Seats</span>
                </div>

                <span className="text-xs font-mono font-bold text-amber-400">SELECT</span>
              </button>
            ))}
          </div>
        </div>

        {/* Printable Standee Preview Card */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col items-center justify-center space-y-6">
          
          <div className="printable-qr-area max-w-sm w-full bg-white text-slate-950 p-8 rounded-3xl shadow-2xl border-4 border-slate-900 text-center space-y-5">
            
            {/* Standee Header */}
            <div>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl mb-2">
                GP
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-950">GRAND PALACE HOTEL</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fine Dining & Lounge</p>
            </div>

            {/* QR SVG */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 inline-block shadow-inner">
              <QRCodeSVG 
                value={tableUrl} 
                size={200} 
                bgColor={"#ffffff"} 
                fgColor={"#0f172a"} 
                level={"H"} 
              />
            </div>

            {/* Table Details */}
            <div className="border-t-2 border-dashed border-slate-300 pt-4 space-y-1">
              <span className="text-3xl font-black tracking-tight text-slate-950 block">{activeTable.number}</span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full inline-block">
                SCAN TO ORDER FOOD & CALL WAITER
              </span>
              <p className="text-[10px] text-slate-500 font-mono pt-1">Free Guest Wi-Fi: GrandPalace_Guest</p>
            </div>

          </div>

          {/* Quick Copy Link Box */}
          <div className="w-full max-w-md bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
            <span className="font-mono text-slate-300 truncate pl-2">{tableUrl}</span>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl shrink-0"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
