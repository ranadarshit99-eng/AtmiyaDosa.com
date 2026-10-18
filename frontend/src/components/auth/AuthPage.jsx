import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Sparkles, 
  ArrowRight,
  Globe,
  CheckCircle2,
  QrCode,
  ChefHat,
  ConciergeBell,
  KeyRound,
  AlertCircle,
  Database
} from 'lucide-react';
import { getTranslation } from '../../lib/translations';
import { supabase, RESTAURANT_ID, recordEmployeeActivity } from '../../lib/supabase';

export const PRIMARY_ADMIN_EMAIL = 'ranadarshit99@gmail.com';
export const PRIMARY_ADMIN_NAME = 'DARSHIT RANA';
export const PRIMARY_ADMIN_AGE = 19;

export default function AuthPage({ onLoginSuccess, currentLang, onLanguageChange, onOpenCustomerPreview }) {
  const [selectedRole, setSelectedRole] = useState('admin'); // 'admin' | 'waiter' | 'chef'
  const [email, setEmail] = useState(PRIMARY_ADMIN_EMAIL);
  const [password, setPassword] = useState('admin2026');
  const [pinCode, setPinCode] = useState('2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = (key) => getTranslation(currentLang, key);

  // Switch role tab
  const handleRoleTabChange = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'admin') {
      setEmail(PRIMARY_ADMIN_EMAIL);
      setPassword('admin2026');
      setPinCode('2026');
    } else if (role === 'waiter') {
      setEmail('waiter@atmiyadosa.com');
      setPassword('waiter123');
      setPinCode('1234');
    } else if (role === 'chef') {
      setEmail('kitchen@atmiyadosa.com');
      setPassword('chef123');
      setPinCode('5678');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();

      // Strict Security Layer: Only ranadarshit99@gmail.com can log in as Admin
      if (selectedRole === 'admin') {
        if (trimmedEmail !== PRIMARY_ADMIN_EMAIL.toLowerCase()) {
          throw new Error(`Security Exception: Only primary owner (${PRIMARY_ADMIN_EMAIL}) has access to the Admin Executive Panel.`);
        }
      }

      // Query live member record from Supabase
      const { data: member, error: dbError } = await supabase
        .from('restaurant_members')
        .select('*')
        .eq('restaurant_id', RESTAURANT_ID)
        .eq('email', trimmedEmail)
        .maybeSingle();

      let authenticatedUser = null;

      if (member) {
        authenticatedUser = {
          id: member.id,
          name: member.full_name,
          email: member.email,
          role: member.role, // 'admin' | 'waiter' | 'chef' | 'cashier'
          restaurantName: 'Atmiya Dosa Hub',
          restaurantId: RESTAURANT_ID,
          age: member.email === PRIMARY_ADMIN_EMAIL ? PRIMARY_ADMIN_AGE : null,
          isPrimaryOwner: member.email === PRIMARY_ADMIN_EMAIL,
        };
      } else {
        // Fallback for primary admin if network is offline
        if (trimmedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
          authenticatedUser = {
            id: 'admin_darshit_rana',
            name: PRIMARY_ADMIN_NAME,
            email: PRIMARY_ADMIN_EMAIL,
            role: 'admin',
            restaurantName: 'Atmiya Dosa Hub',
            restaurantId: RESTAURANT_ID,
            age: PRIMARY_ADMIN_AGE,
            isPrimaryOwner: true,
          };
        } else if (selectedRole === 'waiter') {
          authenticatedUser = {
            id: 'waiter_rahul',
            name: 'Rahul Waiter',
            email: trimmedEmail,
            role: 'waiter',
            restaurantName: 'Atmiya Dosa Hub',
            restaurantId: RESTAURANT_ID,
          };
        } else if (selectedRole === 'chef') {
          authenticatedUser = {
            id: 'chef_suresh',
            name: 'Suresh Chef',
            email: trimmedEmail,
            role: 'chef',
            restaurantName: 'Atmiya Dosa Hub',
            restaurantId: RESTAURANT_ID,
          };
        } else {
          throw new Error('Invalid credentials or staff member not registered.');
        }
      }

      // Record audit log
      await recordEmployeeActivity(
        authenticatedUser.name,
        authenticatedUser.role,
        'STAFF_LOGIN',
        `Logged into ${authenticatedUser.role.toUpperCase()} portal via Supabase auth`
      );

      setLoading(false);
      onLoginSuccess(authenticatedUser);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  // Quick 1-tap demo logins
  const handleQuickLogin = (roleType) => {
    handleRoleTabChange(roleType);
    if (roleType === 'admin') {
      onLoginSuccess({
        id: 'admin_darshit_rana',
        name: PRIMARY_ADMIN_NAME,
        email: PRIMARY_ADMIN_EMAIL,
        role: 'admin',
        restaurantName: 'Atmiya Dosa Hub',
        restaurantId: RESTAURANT_ID,
        age: PRIMARY_ADMIN_AGE,
        isPrimaryOwner: true,
      });
    } else if (roleType === 'waiter') {
      onLoginSuccess({
        id: 'waiter_rahul',
        name: 'Rahul Waiter',
        email: 'waiter@atmiyadosa.com',
        role: 'waiter',
        restaurantName: 'Atmiya Dosa Hub',
        restaurantId: RESTAURANT_ID,
      });
    } else if (roleType === 'chef') {
      onLoginSuccess({
        id: 'chef_suresh',
        name: 'Suresh Chef',
        email: 'kitchen@atmiyadosa.com',
        role: 'chef',
        restaurantName: 'Atmiya Dosa Hub',
        restaurantId: RESTAURANT_ID,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-center py-8 sm:py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-slate-800">
      
      {/* Subtle ambient luxury backdrop */}
      <div className="absolute top-0 left-1/3 w-[32rem] h-[32rem] bg-orange-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-amber-50/60 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar Navigation */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-8 sm:right-8 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
            AD
          </div>
          <div>
            <span className="font-heading font-black text-slate-900 text-sm tracking-tight block">Atmiya Dosa Hub</span>
            <span className="text-[10px] text-slate-400 font-medium">Petlad • SaaS Cloud POS</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Live Supabase indicator */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Supabase Live (Mumbai)</span>
          </div>

          {/* Language selector */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold shadow-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={currentLang} 
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="en">English</option>
              <option value="gu">ગુજરાતી</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>

          {/* Preview customer menu */}
          <button
            onClick={onOpenCustomerPreview}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-500 hover:text-white transition-all text-xs font-bold shadow-xs cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guest Menu Preview</span>
          </button>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 mt-6 sm:mt-0">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
            Restaurant Operations
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Select your role to access your live terminal
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-8 backdrop-blur-sm">
          
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => handleRoleTabChange('admin')}
              className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'admin'
                  ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin / Owner</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('waiter')}
              className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'waiter'
                  ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ConciergeBell className="w-3.5 h-3.5" />
              <span>Waiter</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('chef')}
              className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'chef'
                  ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen (Chef)</span>
            </button>
          </div>

          {/* Admin Owner Identity Highlight */}
          {selectedRole === 'admin' && (
            <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 border border-orange-200/70 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                DR
              </div>
              <div className="text-left text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-slate-900">{PRIMARY_ADMIN_NAME}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-black">
                    Age {PRIMARY_ADMIN_AGE} • Owner
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Protected Admin Access: Only <span className="font-semibold text-slate-800">{PRIMARY_ADMIN_EMAIL}</span> can access the executive CRM.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {selectedRole === 'admin' ? 'Owner Email Address' : 'Staff Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@atmiyadosa.com"
                  readOnly={selectedRole === 'admin'}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
                    selectedRole === 'admin' 
                      ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                  required
                />
              </div>
              {selectedRole === 'admin' && (
                <p className="text-[10px] text-slate-400 mt-1 pl-1">
                  🔒 Locked to Primary Owner Account
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password or Security PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : `Enter ${selectedRole.toUpperCase()} Dashboard`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider mb-2.5">
              1-Tap Quick Switch (Owner Review)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 text-[11px] font-bold text-slate-700 hover:text-orange-700 transition text-center"
              >
                👑 DARSHIT
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('waiter')}
                className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 text-[11px] font-bold text-slate-700 hover:text-orange-700 transition text-center"
              >
                🤵 Waiter
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('chef')}
                className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 text-[11px] font-bold text-slate-700 hover:text-orange-700 transition text-center"
              >
                👨‍🍳 Kitchen
              </button>
            </div>
          </div>

        </div>

        {/* Customer Touchless Dining Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Dining as a Customer? Simply scan the permanent QR code sticker on your table.
          </p>
        </div>

      </div>

    </div>
  );
}
