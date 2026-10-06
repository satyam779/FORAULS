import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { products as builtin } from '../data/products';
import { collectionsOf, fromRow } from '../data/catalog';
import { fetchProductRows, hasSupabase } from './supabase';

const CatalogContext = createContext(null);
const CACHE = 'forauls.catalog.v1';

function cached() {
  try {
    const rows = JSON.parse(localStorage.getItem(CACHE) ?? 'null');
    return Array.isArray(rows) && rows.length ? rows.map(fromRow) : null;
  } catch {
    return null;
  }
}

/**
 * The product catalog. Renders straight away from the last fetched catalog (or
 * the bundled one on a first visit), then swaps in the live Supabase products.
 * `ready` turns true once the live list has been fetched (or failed, or Supabase
 * isn't configured) — until then an unknown slug may still be loading.
 */
export function CatalogProvider({ children }) {
  const [list, setList] = useState(() => (hasSupabase && cached()) || builtin);
  const [ready, setReady] = useState(!hasSupabase);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!hasSupabase) return;
    const ac = new AbortController();
    fetchProductRows(ac.signal)
      .then((rows) => {
        // an empty table means the seed hasn't been run yet — keep the bundled catalog
        if (!rows.length) return;
        setList(rows.map(fromRow));
        try {
          localStorage.setItem(CACHE, JSON.stringify(rows));
        } catch {
          /* storage unavailable — fine, we just refetch next time */
        }
      })
      .catch((err) => {
        if (!ac.signal.aborted) console.warn('[catalog]', err);
      })
      .finally(() => {
        if (!ac.signal.aborted) setReady(true);
      });
    return () => ac.abort();
  }, [version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const value = useMemo(() => {
    const bySlug = new Map(list.map((p) => [p.slug, p]));
    return { products: list, collections: collectionsOf(list), getProduct: (slug) => bySlug.get(slug), ready, reload };
  }, [list, ready, reload]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);
