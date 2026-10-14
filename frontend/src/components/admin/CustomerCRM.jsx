import React, { useState } from 'react';
import { Users, Star, Award, Phone, Search, Gift, Send, Sparkles } from 'lucide-react';

export default function CustomerCRM({ customers, onAddPoints }) {
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchesTier = selectedTier === 'All' || c.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'VIP Platinum':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-900 text-white border border-slate-700 shadow-sm flex items-center space-x-1"><Sparkles className="w-3 h-3 text-amber-400" /><span>Platinum VIP</span></span>;
      case 'VIP Gold':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-400 flex items-center space-x-1"><Star className="w-3 h-3 text-amber-600" /><span>Gold VIP</span></span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-300">Silver Member</span>;
    }
  };

  const handleSendWhatsApp = (customer) => {
    const text = encodeURIComponent(`Hello ${customer.name}! Greetings from Grand Palace Hotel & Dining. You have ${customer.loyalty_points} loyalty reward points waiting! Use promo code DIWALI20 on your next visit to enjoy 20% OFF.`);
    window.open(`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-black text-slate-950 font-heading">
              VIP Guest Loyalty & CRM Database
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Reward recurring diners, allocate loyalty bonus points, and launch personalized WhatsApp promotions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phone or guest name..."
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500 w-56"
            />
          </div>
        </div>
      </div>

      {/* Guest Roster Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1">
            {['All', 'VIP Platinum', 'VIP Gold', 'Silver'].map(tier => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                  selectedTier === tier 
                    ? 'bg-slate-950 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-bold">
            Showing {filteredCustomers.length} registered guests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Guest Name</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4">Loyalty Tier</th>
                <th className="p-4">Visit Frequency</th>
                <th className="p-4">Lifetime Spent</th>
                <th className="p-4">Reward Balance</th>
                <th className="p-4 text-right">Loyalty Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-black text-slate-950 font-heading text-sm">
                    {customer.name}
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-600">
                    {customer.phone}
                  </td>
                  <td className="p-4">
                    {getTierBadge(customer.tier)}
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-900">
                    {customer.visits} Dining Visits
                  </td>
                  <td className="p-4 font-mono font-black text-slate-950">
                    ${customer.total_spent?.toFixed(2)}
                  </td>
                  <td className="p-4 font-mono font-black text-amber-700">
                    {customer.loyalty_points} Pts
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => onAddPoints(customer.id, 100)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] shadow-sm inline-flex items-center space-x-1"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>+100 Pts</span>
                    </button>
                    <button
                      onClick={() => handleSendWhatsApp(customer)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shadow-sm inline-flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp Offer</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
