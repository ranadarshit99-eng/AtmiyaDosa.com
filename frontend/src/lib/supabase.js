import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cwdsurzzcvsrycklkhrz.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3ZHN1cnp6Y3Zzcnlja2xraHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMDI1MjcsImV4cCI6MjEwNzg3ODUyN30.DjxPvDPBvVpOFc_GWJvO5zHReY-sRDT87iI3FXGmido';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';

// ---------------------------------------------------------------------------
// DATA ACCESS HELPERS (SUPABASE + LOCAL STORAGE CACHE FALLBACK)
// ---------------------------------------------------------------------------

export const getLocalStore = (key, fallback) => {
  try {
    const item = localStorage.getItem(`atmiya_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Storage Read Error:', e);
    return fallback;
  }
};

export const setLocalStore = (key, value) => {
  try {
    localStorage.setItem(`atmiya_${key}`, JSON.stringify(value));
    window.dispatchEvent(new Event('atmiya_data_updated'));
  } catch (e) {
    console.error('Storage Write Error:', e);
  }
};

// Log action to audit_logs
export const recordEmployeeActivity = async (
  employeeName,
  employeeRole,
  actionType,
  details,
  tableNumber = null,
  orderId = null
) => {
  const payload = {
    restaurant_id: RESTAURANT_ID,
    employee_name: employeeName || 'Staff',
    employee_role: employeeRole || 'Admin',
    action_type: actionType,
    details: details || '',
    table_number: tableNumber,
    order_id: orderId,
  };

  try {
    const { error } = await supabase.from('audit_logs').insert([payload]);
    if (error) console.warn('[SUPABASE] Audit log insert notice:', error.message);
  } catch (err) {
    console.warn('[SUPABASE] Audit network fallback:', err);
  }

  // Also cache locally
  const localLogs = getLocalStore('audit_logs', []);
  localLogs.unshift({ ...payload, id: `log_${Date.now()}`, created_at: new Date().toISOString() });
  setLocalStore('audit_logs', localLogs.slice(0, 100));
};
