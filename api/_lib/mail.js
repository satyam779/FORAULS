import nodemailer from 'nodemailer';
import { STORE } from '../../src/config/store.js';
import { formatPrice } from '../../src/lib/format.js';

/**
 * Order emails over SMTP. Works with a Gmail account (SMTP_USER = the address,
 * SMTP_PASS = an App Password) or any provider's SMTP settings.
 */
export const mailConfigured = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

let transport = null;
function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

const lineText = (l) => `${l.qty} × ${l.name} (${l.colorName}, ${l.size}) — ${formatPrice(l.total)}`;
const addressText = (o) => `${o.name}\n${o.address}\n${o.city}, ${o.state} ${o.pincode}\nPhone: ${o.phone}`;
const totalsText = (o) =>
  [`Subtotal: ${formatPrice(o.subtotal)}`, `Shipping: ${o.shipping ? formatPrice(o.shipping) : 'Free'}`, `Total: ${formatPrice(o.total)}`].join('\n');

function itemsTable(o) {
  const rows = o.items
    .map(
      (l) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e4e4e7">
          <strong>${esc(l.name)}</strong><br>
          <span style="color:#52525b;font-size:13px">${esc(l.colorName)} · Size ${esc(l.size)} · Qty ${l.qty}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #e4e4e7;text-align:right;white-space:nowrap">${formatPrice(l.total)}</td>
      </tr>`,
    )
    .join('');
  const sum = (label, value, bold) =>
    `<tr><td style="padding:4px 0;${bold ? 'font-weight:700;font-size:16px' : 'color:#52525b'}">${label}</td>
     <td style="padding:4px 0;text-align:right;${bold ? 'font-weight:700;font-size:16px' : ''}">${value}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
    ${rows}
    <tr><td colspan="2" style="height:8px"></td></tr>
    ${sum('Subtotal', formatPrice(o.subtotal))}
    ${sum('Shipping', o.shipping ? formatPrice(o.shipping) : 'Free')}
    ${sum('Total (Cash on delivery)', formatPrice(o.total), true)}
  </table>`;
}

const layout = (body) => `<!doctype html>
<html><body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#09090b">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#fff;border-radius:16px;padding:28px 24px">
      <p style="margin:0 0 20px;font-size:22px;font-weight:800;letter-spacing:4px">${esc(STORE.name)}</p>
      ${body}
    </div>
  </div>
</body></html>`;

function customerEmail(o) {
  const contact = STORE.contactEmail ? ` Questions? Just reply to this email or write to ${STORE.contactEmail}.` : ' Questions? Just reply to this email.';
  const html = layout(`
    <h1 style="margin:0 0 8px;font-size:20px">Thanks for your order, ${esc(o.name.split(' ')[0])}!</h1>
    <p style="margin:0 0 20px;color:#52525b;line-height:1.5">
      We've received order <strong style="color:#09090b">#${o.number}</strong>.
      ${esc(STORE.policies.dispatch ? `${STORE.policies.dispatch}.` : '')}
      Please keep ${formatPrice(o.total)} ready — you pay in cash when it arrives.
    </p>
    ${itemsTable(o)}
    <p style="margin:24px 0 4px;font-weight:700">Delivering to</p>
    <p style="margin:0;color:#3f3f46;line-height:1.5">${esc(addressText(o)).replace(/\n/g, '<br>')}</p>
    <p style="margin:24px 0 0;color:#52525b;font-size:13px;line-height:1.5">${esc(contact.trim())}</p>`);
  const text = [
    `Thanks for your order, ${o.name}!`,
    `Order #${o.number} — cash on delivery.`,
    '',
    ...o.items.map(lineText),
    '',
    totalsText(o),
    '',
    'Delivering to:',
    addressText(o),
    '',
    contact.trim(),
  ].join('\n');
  return { subject: `Order confirmed — ${STORE.name} #${o.number}`, html, text };
}

function ownerEmail(o) {
  const html = layout(`
    <h1 style="margin:0 0 16px;font-size:20px">New order #${o.number} · ${formatPrice(o.total)} COD</h1>
    ${itemsTable(o)}
    <p style="margin:24px 0 4px;font-weight:700">Customer</p>
    <p style="margin:0;color:#3f3f46;line-height:1.5">${esc(addressText(o)).replace(/\n/g, '<br>')}<br>${esc(o.email)}</p>
    ${o.note ? `<p style="margin:16px 0 4px;font-weight:700">Note</p><p style="margin:0;color:#3f3f46">${esc(o.note)}</p>` : ''}`);
  const text = [
    `New order #${o.number} — ${formatPrice(o.total)} (cash on delivery)`,
    '',
    ...o.items.map(lineText),
    '',
    totalsText(o),
    '',
    addressText(o),
    o.email,
    o.note ? `\nNote: ${o.note}` : '',
  ].join('\n');
  return { subject: `New order #${o.number} — ${formatPrice(o.total)} COD`, html, text };
}

/** Sends the customer confirmation (and a copy to ORDER_NOTIFY_EMAIL). Resolves true if the customer's email went out. */
export async function sendOrderEmails(order) {
  const t = getTransport();
  const from = process.env.MAIL_FROM || `${STORE.name} <${process.env.SMTP_USER}>`;
  const notify = process.env.ORDER_NOTIFY_EMAIL;
  const jobs = [t.sendMail({ from, to: order.email, replyTo: STORE.contactEmail || notify || undefined, ...customerEmail(order) })];
  if (notify) jobs.push(t.sendMail({ from, to: notify, replyTo: order.email, ...ownerEmail(order) }));
  const [customer, owner] = await Promise.allSettled(jobs);
  if (customer.status === 'rejected') console.error('[mail] customer email failed:', customer.reason);
  if (owner?.status === 'rejected') console.error('[mail] owner email failed:', owner.reason);
  return customer.status === 'fulfilled';
}
