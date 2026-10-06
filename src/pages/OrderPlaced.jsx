import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Mail } from 'lucide-react';
import { formatPrice } from '../lib/format';
import { useMeta } from '../lib/useMeta';
import { STORE } from '../config/store';

/** Thank-you page after checkout. Details come from the order API's reply (kept for this tab only). */
export default function OrderPlaced() {
  const { number } = useParams();
  const order = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(`forauls.order.${number}`) ?? 'null');
    } catch {
      return null;
    }
  }, [number]);

  useMeta(`Order #${number} placed — ${STORE.name}`);

  return (
    <div className="mx-auto max-w-xl px-4 pt-12 pb-20 sm:px-6">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 18 } }}
        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success text-paper"
      >
        <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden />
      </motion.div>
      <h1 className="mt-6 text-center text-3xl font-extrabold tracking-tight">
        {order?.name ? `Thank you, ${order.name.split(' ')[0]}!` : 'Thank you!'}
      </h1>
      <p className="mt-2 text-center text-muted">
        Order <strong className="text-ink">#{number}</strong> is confirmed. Pay in cash when it arrives.
        {STORE.policies.dispatch && ` ${STORE.policies.dispatch}.`}
      </p>

      {order && (
        <p className="mt-6 flex items-start gap-3 rounded-2xl bg-ink/[0.04] px-4 py-3 text-sm">
          <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            {order.emailSent
              ? `A confirmation email is on its way to ${order.email}.`
              : `We couldn’t send the confirmation email to ${order.email} — don’t worry, your order is saved.`}
          </span>
        </p>
      )}

      {order?.items?.length > 0 && (
        <div className="mt-6 rounded-2xl border border-line p-5">
          <ul className="divide-y divide-line">
            {order.items.map((l) => (
              <li key={`${l.slug}|${l.color}|${l.size}`} className="flex justify-between gap-4 py-2.5">
                <span>
                  <span className="font-semibold">{l.name}</span>
                  <span className="block text-sm text-muted">
                    {l.colorName} · Size {l.size} · Qty {l.qty}
                  </span>
                </span>
                <span className="font-semibold">{formatPrice(l.total)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>{order.shipping ? formatPrice(order.shipping) : 'Free'}</dd>
            </div>
            <div className="flex justify-between pt-1 text-base font-bold">
              <dt>Total · cash on delivery</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>
      )}

      {STORE.contactEmail && (
        <p className="mt-6 text-center text-sm text-muted">
          Questions? Write to{' '}
          <a href={`mailto:${STORE.contactEmail}`} className="font-medium text-ink underline underline-offset-4">
            {STORE.contactEmail}
          </a>
        </p>
      )}

      <div className="mt-8 flex justify-center">
        <Link to="/#shop" className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-paper">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
