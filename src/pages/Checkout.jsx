import { cloneElement, useEffect, useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, Loader2, ShieldCheck } from 'lucide-react';
import { useCart } from '../lib/cart';
import { useCatalog } from '../lib/catalog';
import { formatPrice } from '../lib/format';
import { useMeta } from '../lib/useMeta';
import { STORE, shippingFor } from '../config/store';

const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const SAVED = 'forauls.checkout.v1';
const EMPTY = { name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' };

function savedDetails() {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(SAVED) ?? '{}') };
  } catch {
    return EMPTY;
  }
}

/** Same rules as the order API (api/_lib/order.js), so most mistakes are caught before sending. */
function check(f) {
  const e = {};
  const phone = f.phone.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  if (f.name.trim().length < 2) e.name = 'Enter your full name.';
  if (!/^[6-9]\d{9}$/.test(phone)) e.phone = 'Enter a 10-digit mobile number.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (f.address.trim().length < 8) e.address = 'Enter your full address (house, street, area).';
  if (f.city.trim().length < 2) e.city = 'Enter your city.';
  if (!f.state) e.state = 'Choose your state.';
  if (!/^[1-9]\d{5}$/.test(f.pincode.trim())) e.pincode = 'Enter a 6-digit PIN code.';
  return e;
}

export default function Checkout() {
  const { lines, subtotal, clear } = useCart();
  const { reload } = useCatalog();
  const navigate = useNavigate();
  const [form, setForm] = useState(savedDetails);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ busy: false, error: '' });
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  useMeta(`Checkout — ${STORE.name}`);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED, JSON.stringify(form));
    } catch {
      /* not saved — fine */
    }
  }, [form]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(({ [k]: _, ...rest }) => rest);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (status.busy) return;
    const found = check(form);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`f-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setStatus({ busy: true, error: '' });
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          note,
          website: e.target.website.value,
          items: lines.map((l) => ({ slug: l.slug, color: l.colorway.id, size: l.size, qty: l.qty })),
          expectedTotal: total,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        if (data.reload) reload();
        setStatus({ busy: false, error: data.error || 'We couldn’t place your order. Please try again.' });
        return;
      }
      try {
        sessionStorage.setItem(`forauls.order.${data.number}`, JSON.stringify({ ...data, name: form.name }));
      } catch {
        /* the confirmation page falls back to a generic message */
      }
      clear();
      navigate(`/order/${data.number}`, { replace: true });
    } catch {
      setStatus({ busy: false, error: 'You seem to be offline. Check your connection and try again.' });
    }
  };

  if (!lines.length) {
    return (
      <div className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold">Your bag is empty</h1>
        <p className="mt-2 text-muted">Add a tee or two, then come back to check out.</p>
        <Link to="/#shop" className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-paper">
          Shop the drop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:px-6 lg:pt-10">
      <Link
        to="/#shop"
        className="-ml-2 inline-flex h-11 items-center gap-2 rounded-full px-2 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Continue shopping
      </Link>
      <h1 className="mt-2 font-display text-5xl leading-none uppercase">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
        <form onSubmit={submit} noValidate className="order-2 space-y-8 lg:order-1">
          <fieldset className="space-y-4">
            <legend className="mb-4 text-lg font-bold">Contact</legend>
            <Field id="name" label="Full name" error={errors.name}>
              <input id="f-name" value={form.name} onChange={set('name')} autoComplete="name" maxLength={80} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="phone" label="Mobile number" hint="For delivery updates" error={errors.phone}>
                <input id="f-phone" value={form.phone} onChange={set('phone')} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={14} />
              </Field>
              <Field id="email" label="Email" hint="Your order confirmation goes here" error={errors.email}>
                <input id="f-email" value={form.email} onChange={set('email')} type="email" autoComplete="email" maxLength={120} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-4 text-lg font-bold">Delivery address</legend>
            <Field id="address" label="Address" hint="House / flat no., street, area, landmark" error={errors.address}>
              <textarea id="f-address" value={form.address} onChange={set('address')} rows={3} autoComplete="street-address" maxLength={300} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="city" label="City" error={errors.city}>
                <input id="f-city" value={form.city} onChange={set('city')} autoComplete="address-level2" maxLength={60} />
              </Field>
              <Field id="state" label="State" error={errors.state}>
                <select id="f-state" value={form.state} onChange={set('state')} autoComplete="address-level1">
                  <option value="">Select…</option>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field id="pincode" label="PIN code" error={errors.pincode}>
                <input id="f-pincode" value={form.pincode} onChange={set('pincode')} inputMode="numeric" autoComplete="postal-code" maxLength={6} />
              </Field>
            </div>
            <Field id="note" label="Order note (optional)">
              <textarea id="f-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} />
            </Field>
            {/* bot trap: hidden from people, filled in by form-spamming scripts */}
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          </fieldset>

          <fieldset>
            <legend className="mb-4 text-lg font-bold">Payment</legend>
            <div className="flex items-center gap-4 rounded-2xl border-2 border-ink p-4">
              <Banknote className="h-6 w-6 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">Cash on delivery</p>
                <p className="text-sm text-muted">Pay {formatPrice(total)} in cash when your order arrives.</p>
              </div>
            </div>
          </fieldset>

          {status.error && (
            <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
              {status.error}
            </p>
          )}

          <button
            type="submit"
            disabled={status.busy}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-ink text-lg font-semibold text-paper shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)] transition-colors hover:bg-ink-2 disabled:opacity-70"
          >
            {status.busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Placing order…
              </>
            ) : (
              `Place order · ${formatPrice(total)}`
            )}
          </button>
          <p className="flex items-center justify-center gap-2 text-sm text-muted">
            <ShieldCheck className="h-4 w-4" aria-hidden /> Your details are only used to deliver this order.
          </p>
        </form>

        <aside className="order-1 lg:order-2" aria-label="Order summary">
          <div className="rounded-2xl border border-line bg-white/60 p-5 lg:sticky lg:top-24">
            <h2 className="font-bold">Order summary</h2>
            <ul className="mt-4 divide-y divide-line">
              {lines.map((l) => {
                const face = l.product.cardFace === 'front' ? l.colorway.front : l.colorway.back;
                return (
                  <li key={l.key} className="flex gap-3 py-3">
                    <div className="stage-bg relative grid h-16 w-14 shrink-0 place-items-center rounded-lg">
                      <img src={face.srcSm} alt="" className="h-[85%] w-[85%] object-contain" />
                      <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold text-paper">
                        {l.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{l.product.short}</p>
                      <p className="text-sm text-muted">
                        {l.colorway.name} · Size {l.size}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(l.total)}</p>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd>{shipping ? formatPrice(shipping) : 'Free'}</dd>
              </div>
              {shipping > 0 && STORE.policies.freeShippingAbove != null && (
                <p className="text-xs text-muted">
                  Free shipping on orders of {formatPrice(STORE.policies.freeShippingAbove)} or more.
                </p>
              )}
              <div className="flex justify-between pt-2 text-lg font-bold">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ id, label, hint, error, children }) {
  const hintId = useId();
  const describedBy = [hint && hintId, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={`f-${id}`} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {cloneElement(children, {
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        className: `w-full rounded-xl border bg-white px-4 text-base outline-none transition-colors focus:border-ink ${
          error ? 'border-danger' : 'border-line'
        } ${children.type === 'textarea' ? 'py-3' : 'h-12'}`,
      })}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
