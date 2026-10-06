import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { useCart } from '../lib/cart';
import { useDialog } from './Modal';
import { formatPrice } from '../lib/format';
import { STORE } from '../config/store';

const FREE_AT = STORE.policies.freeShippingAbove;

export default function CartDrawer() {
  const { lines, subtotal, count, setQty, open, setOpen } = useCart();
  const close = () => setOpen(false);
  const panelRef = useDialog(open, close);
  const [note, setNote] = useState(false);
  const remaining = FREE_AT != null ? Math.max(0, FREE_AT - subtotal) : 0;
  const progress = FREE_AT ? Math.min(1, subtotal / FREE_AT) : 1;

  return (
    <AnimatePresence onExitComplete={() => setNote(false)}>
      {open && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={close} aria-hidden />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0, transition: { type: 'spring', stiffness: 320, damping: 34 } }}
            exit={{ x: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="text-lg font-bold">
                Your bag <span className="font-medium text-muted">({count})</span>
              </h2>
              <button
                data-autofocus
                onClick={close}
                aria-label="Close cart"
                className="-mr-2 grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-ink/5">
                  <ShoppingBag className="h-7 w-7 text-muted" />
                </div>
                <p className="text-lg font-semibold">Your bag is empty</p>
                <p className="text-muted">Spin a few designs in 3D and find your next favourite tee.</p>
                <Link
                  to="/#shop"
                  onClick={close}
                  className="mt-2 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-paper"
                >
                  Shop the drop
                </Link>
              </div>
            ) : (
              <>
                {FREE_AT != null && (
                  <div className="border-b border-line px-6 py-4">
                    <p className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4" />
                      {remaining > 0 ? (
                        <span>
                          You&apos;re <strong>{formatPrice(remaining)}</strong> away from free shipping
                        </span>
                      ) : (
                        <span className="font-semibold text-success">You&apos;ve unlocked free shipping</span>
                      )}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                      <motion.div
                        className="h-full rounded-full bg-ink"
                        initial={false}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                      />
                    </div>
                  </div>
                )}

                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => {
                      const face = l.product.cardFace === 'front' ? l.colorway.front : l.colorway.back;
                      return (
                        <motion.li
                          key={l.key}
                          layout
                          exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
                          className="flex gap-4 py-5"
                        >
                          <Link
                            to={`/product/${l.slug}`}
                            onClick={close}
                            className="stage-bg grid h-24 w-20 shrink-0 place-items-center overflow-hidden rounded-xl"
                          >
                            <img src={face.srcSm} alt="" className="h-[85%] w-[85%] object-contain" />
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex justify-between gap-3">
                              <Link
                                to={`/product/${l.slug}`}
                                onClick={close}
                                className="truncate font-semibold hover:underline"
                              >
                                {l.product.short}
                              </Link>
                              <p className="font-semibold">{formatPrice(l.total)}</p>
                            </div>
                            <p className="text-sm text-muted">
                              {l.colorway.name} · Size {l.size}
                            </p>
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <div className="flex items-center rounded-full border border-line">
                                <button
                                  onClick={() => setQty(l.key, l.qty - 1)}
                                  aria-label={`Decrease quantity of ${l.product.short}`}
                                  className="grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">
                                  {l.qty}
                                </span>
                                <button
                                  onClick={() => setQty(l.key, l.qty + 1)}
                                  disabled={l.qty >= 10}
                                  aria-label={`Increase quantity of ${l.product.short}`}
                                  className="grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-40"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => setQty(l.key, 0)}
                                aria-label={`Remove ${l.product.short} from bag`}
                                className="grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-danger"
                              >
                                <Trash2 className="h-[18px] w-[18px]" />
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>

                <div className="border-t border-line px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">Taxes included. Shipping calculated at checkout.</p>
                  <button
                    onClick={() => setNote(true)}
                    className="mt-4 h-14 w-full rounded-2xl bg-ink text-base font-semibold text-paper transition-transform active:scale-[0.98]"
                  >
                    Checkout
                  </button>
                  {note && (
                    <p role="status" className="mt-3 text-center text-sm text-muted">
                      Online checkout is coming soon.
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
