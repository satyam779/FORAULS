import { STORE, shippingFor } from '../../src/config/store.js';

/** Thrown for problems the shopper can fix (sold-out item, changed price). */
export class OrderError extends Error {}

const text = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

/** Indian mobile number → 10 digits (accepts +91 / 0 prefixes, spaces, dashes). */
export function normalisePhone(v) {
  const d = String(v ?? '').replace(/\D/g, '');
  const local = d.length === 12 && d.startsWith('91') ? d.slice(2) : d.length === 11 && d.startsWith('0') ? d.slice(1) : d;
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

/**
 * Checks and tidies a checkout submission. Returns { errors, customer, items, note, expectedTotal };
 * `errors` maps field names to messages and is empty when everything is valid.
 */
export function validateOrder(body) {
  const errors = {};
  const c = body?.customer ?? {};
  const address =
    typeof c.address === 'string'
      ? c.address
          .split(/\n+/)
          .map((l) => text(l, 200))
          .filter(Boolean)
          .join(', ')
          .slice(0, 300)
      : '';
  const customer = {
    name: text(c.name, 80),
    email: text(c.email, 120).toLowerCase(),
    phone: normalisePhone(c.phone),
    address,
    city: text(c.city, 60),
    state: text(c.state, 60),
    pincode: text(c.pincode, 6),
  };
  if (customer.name.length < 2) errors.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email)) errors.email = 'Enter a valid email address.';
  if (!customer.phone) errors.phone = 'Enter a 10-digit mobile number.';
  if (customer.address.length < 8) errors.address = 'Enter your full address (house, street, area).';
  if (customer.city.length < 2) errors.city = 'Enter your city.';
  if (customer.state.length < 2) errors.state = 'Choose your state.';
  if (!/^[1-9]\d{5}$/.test(customer.pincode)) errors.pincode = 'Enter a 6-digit PIN code.';

  const raw = Array.isArray(body?.items) ? body.items.slice(0, 30) : [];
  const merged = new Map();
  for (const i of raw) {
    const slug = typeof i?.slug === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(i.slug) ? i.slug : null;
    const color = text(i?.color, 40);
    const size = STORE.sizes.includes(i?.size) ? i.size : null;
    const qty = Number.isInteger(i?.qty) && i.qty >= 1 && i.qty <= 10 ? i.qty : null;
    if (!slug || !size || !qty) {
      errors.items = 'Your bag has an item we couldn’t read. Please remove it and add it again.';
      continue;
    }
    const key = `${slug}|${color}|${size}`;
    const prev = merged.get(key);
    merged.set(key, { slug, color, size, qty: Math.min(10, (prev?.qty ?? 0) + qty) });
  }
  const items = [...merged.values()];
  if (!items.length && !errors.items) errors.items = 'Your bag is empty.';

  const expectedTotal = Number.isFinite(body?.expectedTotal) ? body.expectedTotal : null;
  return { errors, customer, items, note: text(body?.note, 500), expectedTotal };
}

/** Prices the cart from the database rows — the browser's prices are never trusted. */
export function priceOrder(items, rows) {
  const bySlug = new Map(rows.filter((r) => r.active).map((r) => [r.slug, r]));
  const lines = items.map((i) => {
    const p = bySlug.get(i.slug);
    if (!p) throw new OrderError('A tee in your bag is no longer available. Please review your bag.');
    const colors = Array.isArray(p.colors) ? p.colors : [];
    const c = colors.find((x) => x.id === i.color) ?? (colors.length === 1 ? colors[0] : null);
    if (!c) throw new OrderError(`The colour you picked for ${p.short || p.name} is no longer available.`);
    return {
      slug: p.slug,
      name: p.short || p.name,
      color: c.id,
      colorName: c.name,
      size: i.size,
      qty: i.qty,
      price: p.price,
      total: p.price * i.qty,
    };
  });
  const subtotal = lines.reduce((n, l) => n + l.total, 0);
  const shipping = shippingFor(subtotal);
  return { lines, subtotal, shipping, total: subtotal + shipping };
}
