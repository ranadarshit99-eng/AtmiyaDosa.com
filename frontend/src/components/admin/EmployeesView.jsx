import React, { useState } from 'react';
import { Users, Plus, Phone, ShieldCheck, UserCheck, Trash2, X } from 'lucide-react';
import { getTranslation } from '../../lib/translations';

export default function EmployeesView({ employees, onAddEmployee, currentLang }) {
  const [showModal, setShowModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: '',
    role: 'Senior Waiter',
    phone: '',
    shift: 'Morning Shift'
  });

  const t = (key) => getTranslation(currentLang, key);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.phone) return;
    onAddEmployee({
      ...newEmp,
      id: `emp_${Date.now()}`,
      active: true
    });
    setShowModal(false);
    setNewEmp({ name: '', role: 'Senior Waiter', phone: '', shift: 'Morning Shift' });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-slate-900 font-heading">
              {t('employees')} & Restaurant Staff Roster
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage floor managers, line chefs, kitchen staff, and service waiters with active shift tracking.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 font-black flex items-center justify-center font-heading text-base shadow-sm">
                {emp.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900 font-heading">{emp.name}</h3>
                <div className="text-[11px] font-bold text-orange-600">{emp.role}</div>
                <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{emp.phone}</span>
                </div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Active
              </span>
              <div className="text-[10px] font-semibold text-slate-400">{emp.shift}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 font-heading">Add Staff Member</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Kumar"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={newEmp.role}
                  onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="Head Chef">Head Chef</option>
                  <option value="Kitchen Helper">Kitchen Helper</option>
                  <option value="Senior Waiter">Senior Waiter</option>
                  <option value="Cashier & POS Lead">Cashier & POS Lead</option>
                  <option value="Floor Manager">Floor Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98250 00000"
                  value={newEmp.phone}
                  onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shift</label>
                <select
                  value={newEmp.shift}
                  onChange={(e) => setNewEmp({ ...newEmp, shift: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="Morning Shift">Morning Shift (8 AM - 4 PM)</option>
                  <option value="Evening Shift">Evening Shift (4 PM - 12 AM)</option>
                  <option value="Full Day">Full Day (10 AM - 10 PM)</option>
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
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
