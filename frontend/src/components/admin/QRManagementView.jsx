import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, Download, ExternalLink, Sparkles, Check, Copy } from 'lucide-react';
import { getTranslation } from '../../lib/translations';

export default function QRManagementView({ tables, restaurantSettings, currentLang }) {
  const [activeTable, setActiveTable] = useState(tables[0] || { number: 'T01' });
  const [copied, setCopied] = useState(false);

  const t = (key) => getTranslation(currentLang, key);

  // Real URL that bypasses the login wall for the guest
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
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <QrCode className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-slate-900 font-heading">
              {t('qrManagement')} & Digital Table Standees
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real dynamic QR codes for table-side touchless mobile ordering without login barriers.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition flex items-center space-x-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print Table Standee</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
            Select Dining Table
          </h3>

          <div className="grid grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => setActiveTable(table)}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                  activeTable.number === table.number
                    ? 'bg-orange-500 text-white border-orange-600 shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="text-base font-black font-heading">{table.number}</div>
                  <div className={`text-[10px] font-semibold ${activeTable.number === table.number ? 'text-orange-100' : 'text-slate-400'}`}>
                    {table.zone}
                  </div>
                </div>
                <QrCode className="w-4 h-4 opacity-70" />
              </button>
            ))}
          </div>
        </div>

        {/* Real QR Preview & Standee Designer (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* URL & Quick Actions Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 truncate w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0">Live URL:</span>
              <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg truncate border border-orange-200/80">
                {tableUrl}
              </span>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1 border border-slate-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <a
                href={tableUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs flex items-center space-x-1 border border-orange-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Live QR Menu</span>
              </a>
            </div>
          </div>

          {/* Printable Acrylic Standee Card Preview */}
          <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 flex justify-center printable-area">
            
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full border-4 border-slate-900 shadow-2xl text-center space-y-5 relative">
              
              <div className="space-y-1">
                <div className="inline-block px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                  Touchless Dining
                </div>
                <h3 className="text-2xl font-black text-slate-950 font-heading">
                  {restaurantSettings?.restaurantName || 'Atmiya Dosa'}
                </h3>
                <p className="text-xs font-bold text-slate-500">
                  {restaurantSettings?.tagline || 'Pure Veg • Authentic Taste'}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 inline-block shadow-inner">
                <QRCodeSVG 
                  value={tableUrl} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />
              </div>

              <div className="space-y-2">
                <div className="text-xl font-black text-slate-950 font-heading bg-slate-100 py-1.5 px-4 rounded-xl inline-block border border-slate-200">
                  TABLE {activeTable.number}
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

        </div>

      </div>

    </div>
  );
}
