import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProduct } from '../data/products';

const CartContext = createContext(null);
const KEY = 'forauls.cart.v1';

function load() {
  try {
    const items = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(items) ? items.filter((i) => getProduct(i.slug)) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable (private mode) — cart still works in memory */
    }
  }, [items]);

  const add = useCallback((slug, color, size, qty = 1) => {
    const key = `${slug}|${color}|${size}`;
    setItems((prev) => {
      const hit = prev.find((i) => i.key === key);
      if (hit) return prev.map((i) => (i.key === key ? { ...i, qty: Math.min(10, i.qty + qty) } : i));
      return [...prev, { key, slug, color, size, qty }];
    });
  }, []);

  const setQty = useCallback((key, qty) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty: Math.min(10, qty) } : i)),
    );
  }, []);

  const value = useMemo(() => {
    const lines = items.map((i) => {
      const product = getProduct(i.slug);
      const color = product.colors.find((c) => c.id === i.color) ?? product.colors[0];
      return { ...i, product, colorway: color, total: product.price * i.qty };
    });
    return {
      lines,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.total, 0),
      add,
      setQty,
      open,
      setOpen,
    };
  }, [items, add, setQty, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
