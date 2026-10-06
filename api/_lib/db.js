/**
 * Minimal Supabase REST access for server functions, using the project's
 * secret (service-role) key — it bypasses row-level security, so it must never
 * reach the browser. Set SUPABASE_SECRET_KEY in the host's environment.
 */
const baseUrl = () => (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const secret = () => process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const dbConfigured = () => Boolean(baseUrl() && secret());

async function rest(path, { headers, ...init } = {}) {
  const key = secret();
  const res = await fetch(`${baseUrl()}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      ...(key.startsWith('eyJ') && { Authorization: `Bearer ${key}` }),
      'Content-Type': 'application/json',
      ...headers,
    },
  });
  const body = await res.text();
  let data = null;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = body;
  }
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${data?.message ?? body}`);
  return data;
}

/** Product rows for the given slugs (slugs are pre-validated to [a-z0-9-]). */
export const getProducts = (slugs) => rest(`products?select=slug,name,short,price,colors,active&slug=in.(${slugs.join(',')})`);

export const insertOrder = async (order) =>
  (await rest('orders', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(order) }))[0];

export const markEmailed = (id) =>
  rest(`orders?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ email_sent: true }) });
