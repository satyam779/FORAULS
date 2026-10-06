import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../lib/cart';
import { useCatalog } from '../lib/catalog';
import { STORE } from '../config/store';

export default function Header() {
  const { count, setOpen } = useCart();
  const { collections } = useCatalog();
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="font-display text-[26px] leading-none tracking-[0.16em]" aria-label="FORAULS home">
          FORAULS
        </Link>

        <nav aria-label="Collections" className="hidden items-center gap-1 md:flex">
          {collections.map((c) => (
            <NavLink
              key={c}
              to={c === 'All' ? '/#shop' : `/?c=${c}#shop`}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-ink/5 hover:text-ink"
            >
              {c === 'All' ? 'Shop all' : c}
            </NavLink>
          ))}
        </nav>

        {STORE.commerce ? (
          <button
            onClick={() => setOpen(true)}
            aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
            className="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/5"
          >
            <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.8} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 18 } }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  className="absolute top-1 right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold text-paper"
                  aria-hidden
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ) : (
          <span className="w-11" aria-hidden />
        )}
      </div>
    </header>
  );
}
