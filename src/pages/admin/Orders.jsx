import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Mail, MessageCircle, Phone, RefreshCw, Search } from 'lucide-react';
import { formatPrice } from '../../lib/format';
import { Button, Card, STATUS, StatusBadge, useSupabase } from './ui';

const when = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
const FILTERS = ['all', ...Object.keys(STATUS)];

export default function Orders() {
  const supabase = useSupabase();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    const { data, error: err } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500);
    setBusy(false);
    if (err) return setError(err.message);
    setError('');
    setOrders(data);
  }, [supabase]);

  useEffect(() => {
    load();
    const onFocus = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onFocus);
    return () => document.removeEventListener('visibilitychange', onFocus);
  }, [load]);

  const setStatus = async (order, status) => {
    setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status } : o)));
    const { error: err } = await supabase.from('orders').update({ status }).eq('id', order.id);
    if (err) {
      setError(`Couldn’t update #${order.number}: ${err.message}`);
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: order.status } : o)));
    }
  };

  const counts = useMemo(() => {
    const c = { all: orders?.length ?? 0 };
    for (const o of orders ?? []) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const stats = useMemo(() => {
    const live = (orders ?? []).filter((o) => o.status !== 'cancelled');
    const today = new Date().toDateString();
    return {
      today: live.filter((o) => new Date(o.created_at).toDateString() === today).length,
      open: live.filter((o) => o.status === 'new' || o.status === 'confirmed').length,
      revenue: live.reduce((n, o) => n + o.total, 0),
    };
  }, [orders]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, '');
    return (orders ?? []).filter(
      (o) =>
        (filter === 'all' || o.status === filter) &&
        (!q || String(o.number).includes(q) || o.name.toLowerCase().includes(q) || o.phone.includes(q) || o.email.includes(q)),
    );
  }, [orders, filter, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Orders</h1>
        <Button variant="secondary" onClick={load} busy={busy}>
          {!busy && <RefreshCw className="h-4 w-4" aria-hidden />} Refresh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ['Today', stats.today],
          ['To ship', stats.open],
          ['Revenue', formatPrice(stats.revenue)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 overflow-x-auto rounded-full bg-white p-1 ring-1 ring-line" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`h-8 shrink-0 rounded-full px-3 text-sm font-semibold ${filter === f ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-ink/5'}`}
            >
              {f === 'all' ? 'All' : STATUS[f].label} <span className="opacity-60">{counts[f] ?? 0}</span>
            </button>
          ))}
        </div>
        <label className="relative sm:ml-auto sm:w-72">
          <span className="sr-only">Search orders</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, phone, email or #"
            className="h-10 w-full rounded-full border border-line bg-white pr-3 pl-9 text-sm outline-none focus:border-ink"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      {orders === null ? (
        <p className="py-12 text-center text-muted">Loading orders…</p>
      ) : shown.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-muted">{orders.length ? 'No orders match.' : 'No orders yet. They’ll show up here as soon as someone checks out.'}</p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {shown.map((o) => (
            <OrderRow key={o.id} order={o} open={open === o.id} onToggle={() => setOpen(open === o.id ? null : o.id)} onStatus={setStatus} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderRow({ order: o, open, onToggle, onStatus }) {
  const qty = o.items.reduce((n, l) => n + l.qty, 0);
  return (
    <li className="overflow-hidden rounded-2xl border border-line bg-white">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-ink/[0.02]">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-bold">#{o.number}</span>
            <StatusBadge status={o.status} />
            <span className="text-sm text-muted">{when.format(new Date(o.created_at))}</span>
          </p>
          <p className="mt-0.5 truncate text-sm">
            <span className="font-medium">{o.name}</span>
            <span className="text-muted">
              {' '}
              · {o.city} · {qty} item{qty === 1 ? '' : 's'}
            </span>
          </p>
        </div>
        <p className="font-bold tabular-nums">{formatPrice(o.total)}</p>
        <ChevronDown className={`h-5 w-5 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {open && (
        <div className="grid gap-5 border-t border-line px-4 py-4 md:grid-cols-[1.3fr_1fr]">
          <div>
            <ul className="divide-y divide-line">
              {o.items.map((l) => (
                <li key={`${l.slug}|${l.color}|${l.size}`} className="flex justify-between gap-3 py-2 text-sm">
                  <span>
                    <span className="font-semibold">{l.name}</span>
                    <span className="text-muted">
                      {' '}
                      — {l.colorName}, size <strong className="text-ink">{l.size}</strong> × {l.qty}
                    </span>
                  </span>
                  <span className="tabular-nums">{formatPrice(l.total)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-0.5 border-t border-line pt-2 text-sm">
              <div className="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(o.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Shipping</dt>
                <dd className="tabular-nums">{o.shipping ? formatPrice(o.shipping) : 'Free'}</dd>
              </div>
              <div className="flex justify-between font-bold">
                <dt>Collect (COD)</dt>
                <dd className="tabular-nums">{formatPrice(o.total)}</dd>
              </div>
            </dl>
            {o.note && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm">
                <span className="font-semibold">Note:</span> {o.note}
              </p>
            )}
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold">Ship to</p>
              <p className="mt-1 leading-relaxed whitespace-pre-line text-ink-2">
                {o.name}
                {'\n'}
                {o.address}
                {'\n'}
                {o.city}, {o.state} {o.pincode}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href={`tel:+91${o.phone}`} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 font-medium hover:border-ink/40">
                  <Phone className="h-3.5 w-3.5" aria-hidden /> {o.phone}
                </a>
                <a
                  href={`https://wa.me/91${o.phone}?text=${encodeURIComponent(`Hi ${o.name.split(' ')[0]}, about your order #${o.number}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 font-medium hover:border-ink/40"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden /> WhatsApp
                </a>
                <a href={`mailto:${o.email}`} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 font-medium hover:border-ink/40">
                  <Mail className="h-3.5 w-3.5" aria-hidden /> {o.email}
                </a>
              </div>
              {!o.email_sent && <p className="mt-2 text-xs text-muted">Confirmation email was not sent for this order.</p>}
            </div>
            <div>
              <p className="mb-2 font-semibold">Status</p>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Status of order ${o.number}`}>
                {Object.entries(STATUS).map(([id, s]) => (
                  <button
                    key={id}
                    onClick={() => o.status !== id && onStatus(o, id)}
                    aria-pressed={o.status === id}
                    className={`h-8 rounded-full px-3 text-xs font-semibold ring-1 transition ${
                      o.status === id ? `${s.className} ring-transparent` : 'text-ink-2 ring-line hover:ring-ink/40'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
