import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Globe,
  CheckCircle2,
  QrCode
} from 'lucide-react';
import { getTranslation } from '../../lib/translations';

export default function AuthPage({ onLoginSuccess, currentLang, onLanguageChange, onOpenCustomerPreview }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Darshit Rana',
    email: 'admin@atmiyadosa.com',
    password: 'password123',
    restaurantName: 'Atmiya Dosa',
    role: 'Admin'
  });
  const [error, setError] = useState('');

  const t = (key) => getTranslation(currentLang, key);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all required credentials.');
      return;
    }

    const userObj = {
      id: `usr_${Date.now()}`,
      name: formData.name || 'Darshit Rana',
      email: formData.email,
      role: formData.role || 'Admin',
      restaurantName: formData.restaurantName || 'Atmiya Dosa'
    };

    onLoginSuccess(userObj);
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 'usr_admin',
      name: 'Darshit Rana',
      email: 'admin@atmiyadosa.com',
      role: 'Admin',
      restaurantName: 'Atmiya Dosa'
    };
    onLoginSuccess(demoUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar with Language Selector */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 flex items-center space-x-3 z-20">
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold">
          <Globe className="w-3.5 h-3.5 text-orange-400" />
          <select 
            value={currentLang} 
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
          >
            <option value="en" className="bg-slate-900 text-white">English (EN)</option>
            <option value="hi" className="bg-slate-900 text-white">हिन्दी (HI)</option>
            <option value="gu" className="bg-slate-900 text-white">ગુજરાતી (GU)</option>
            <option value="hinglish" className="bg-slate-900 text-white">Hinglish</option>
          </select>
        </div>

        <button
          onClick={onOpenCustomerPreview}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500 hover:text-white transition text-xs font-black"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Guest Menu Preview</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-xl shadow-orange-500/20">
          <UtensilsCrossed className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-black text-white font-heading tracking-tight">
          {formData.restaurantName}
        </h2>
        <p className="text-xs font-semibold text-slate-400">
          {t('adminPanel')} • {t('restaurantTagline')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800 space-y-6">
          
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => { setIsSignUp(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition ${
                !isSignUp ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition ${
                isSignUp ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('signup')}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{t('fullName')}</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-orange-500 transition"
                      placeholder="e.g. Darshit Rana"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{t('restaurantName')}</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.restaurantName}
                      onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-orange-500 transition"
                      placeholder="e.g. Atmiya Dosa"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{t('role')}</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-orange-500 transition cursor-pointer"
                  >
                    <option value="Admin">{t('ownerAdmin')}</option>
                    <option value="Manager">{t('manager')}</option>
                    <option value="Chef">{t('kitchenStaff')}</option>
                    <option value="Waiter">{t('waiterStaff')}</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{t('emailAddress')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-orange-500 transition"
                  placeholder="admin@atmiyadosa.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{t('password')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-orange-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/20 transition flex items-center justify-center space-x-2"
            >
              <span>{isSignUp ? t('createAccount') : t('login')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition border border-slate-700 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Demo Login (Darshit Rana)</span>
            </button>
          </div>

          <div className="text-center text-[10px] text-slate-500 font-semibold">
            {t('poweredByAppwrite')} • {t('builtWithLove')}
          </div>

        </div>
      </div>

    </div>
  );
}
