/**
 * Supabase connection, configured by VITE_SUPABASE_URL and VITE_SUPABASE_KEY
 * (the project's publishable / anon key — safe to ship to browsers; row-level
 * security in supabase/schema.sql decides what it can do). When they're unset
 * the store runs on the bundled catalog and the admin page explains the setup.
 */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || '';
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Legacy keys are JWTs and also go in Authorization; the newer sb_… keys only in apikey. */
const headers = () => ({ apikey: SUPABASE_KEY, ...(SUPABASE_KEY.startsWith('eyJ') && { Authorization: `Bearer ${SUPABASE_KEY}` }) });

/** Active products, in shop order. Plain fetch keeps supabase-js out of the storefront bundle. */
export async function fetchProductRows(signal) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&active=eq.true&order=sort.asc,created_at.asc`, {
    headers: headers(),
    signal,
  });
  if (!res.ok) throw new Error(`Loading products failed (${res.status})`);
  return res.json();
}

let client = null;
/** Full supabase-js client (auth, storage) — loaded on demand by the admin pages. */
export async function getSupabase() {
  if (!hasSupabase) throw new Error('Supabase is not configured');
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, storageKey: 'forauls.admin.auth' } });
  }
  return client;
}
