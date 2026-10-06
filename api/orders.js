import { STORE } from '../src/config/store.js';
import { dbConfigured, getProducts, insertOrder, markEmailed } from './_lib/db.js';
import { mailConfigured, sendOrderEmails } from './_lib/mail.js';
import { OrderError, priceOrder, validateOrder } from './_lib/order.js';

function withTimeout(promise, ms) {
  let timer;
  const expiry = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms} ms`)), ms);
  });
  return Promise.race([promise, expiry]).finally(() => clearTimeout(timer));
}

/**
 * POST /api/orders — places a cash-on-delivery order.
 * Body: { customer: { name, email, phone, address, city, state, pincode }, items: [{ slug, color, size, qty }],
 *         note?, expectedTotal? }
 * Re-prices the cart from Supabase, saves the order and emails a confirmation.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!STORE.commerce || !dbConfigured()) {
    return res.status(503).json({ error: 'Online ordering isn’t open yet. Please try again later.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  if (body?.website) return res.status(400).json({ error: 'Something went wrong. Please try again.' }); // bot trap

  const { errors, customer, items, note, expectedTotal } = validateOrder(body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ error: errors.items || 'Please check the highlighted fields.', fields: errors });
  }

  try {
    const rows = await getProducts([...new Set(items.map((i) => i.slug))]);
    const priced = priceOrder(items, rows);
    if (expectedTotal != null && expectedTotal !== priced.total) {
      throw new OrderError('Prices in your bag have changed. Please review the new total and place the order again.');
    }

    const order = await insertOrder({
      ...customer,
      note: note || null,
      items: priced.lines,
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      total: priced.total,
      payment: 'cod',
    });

    let emailSent = false;
    if (mailConfigured()) {
      try {
        emailSent = await withTimeout(sendOrderEmails(order), 9000);
        if (emailSent) await markEmailed(order.id).catch((e) => console.error('[orders] marking email_sent failed:', e));
      } catch (e) {
        console.error('[orders] confirmation email failed:', e);
      }
    } else {
      console.warn('[orders] SMTP not configured — no confirmation email sent');
    }

    return res.status(201).json({
      number: order.number,
      email: order.email,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      emailSent,
    });
  } catch (e) {
    if (e instanceof OrderError) return res.status(409).json({ error: e.message, reload: true });
    console.error('[orders]', e);
    return res.status(500).json({ error: 'We couldn’t place your order just now. Please try again in a minute.' });
  }
}
