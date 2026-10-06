import { Link } from 'react-router-dom';
import { useCatalog } from '../lib/catalog';
import { STORE, policyLines } from '../config/store';

export default function Footer() {
  const { collections } = useCatalog();
  return (
    <footer className="bg-ink text-zinc-300">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-4xl tracking-[0.14em] text-paper">{STORE.name}</p>
          <p className="mt-3 max-w-sm text-zinc-400">{STORE.tagline}</p>
          {STORE.social.instagram && (
            <a
              href={STORE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-paper transition-colors hover:bg-white/10"
            >
              Follow on Instagram
            </a>
          )}
        </div>
        <nav aria-label="Footer">
          <p className="text-sm font-semibold tracking-wider text-paper uppercase">Shop</p>
          <ul className="mt-4 space-y-3">
            {collections.map((c) => (
              <li key={c}>
                <Link to={c === 'All' ? '/#shop' : `/?c=${c}#shop`} className="transition-colors hover:text-paper">
                  {c === 'All' ? 'All tees' : c}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {policyLines.length > 0 && (
          <div>
            <p className="text-sm font-semibold tracking-wider text-paper uppercase">Good to know</p>
            <ul className="mt-4 space-y-3 text-zinc-400">
              {policyLines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-sm text-zinc-500 sm:px-6">
          © {new Date().getFullYear()} {STORE.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
