import { featuresFor } from './products';

/**
 * Converts between the storefront's product objects and rows of the Supabase
 * `products` table (see supabase/schema.sql). Plain functions so the browser,
 * the prerender script and the seed script all share them.
 */

/** Fabric tones the 3D engine can render (keys of COLOURWAYS in the engine). */
export const TONES = [
  { id: 'jet', label: 'Jet Black (solid)', hex: '#111214' },
  { id: 'black', label: 'Washed Black', hex: '#2b2b2d' },
  { id: 'bone', label: 'Bone White', hex: '#e7e3dc' },
  { id: 'olive', label: 'Olive', hex: '#4a4d2c' },
  { id: 'burgundy', label: 'Burgundy', hex: '#5c1820' },
];

const smWidth = (w, h) => Math.round(w * Math.min(1, 480 / Math.max(w, h)));

/** Product image ({ src, srcSm?, w, h }) with the small variant cards and thumbnails use. */
function image(img) {
  if (!img?.src) return null;
  const w = img.w || 800;
  const h = img.h || 900;
  return { ...img, w, h, srcSm: img.srcSm || img.src, wSm: img.wSm || (img.srcSm ? smWidth(w, h) : w) };
}

/** A colourway always needs a front and a back image; fall back to whichever exists. */
function colorway(c) {
  const front = image(c.front);
  const back = image(c.back);
  const stand = front || back || image({ src: c.prints?.back?.src || c.prints?.front?.src, w: 800, h: 900 });
  return {
    id: c.id,
    name: c.name,
    hex: c.hex,
    tone: c.tone,
    front: front || stand,
    back: back || stand,
    prints: { front: c.prints?.front ?? null, back: c.prints?.back ?? null },
  };
}

export function fromRow(r) {
  return {
    slug: r.slug,
    name: r.name,
    short: r.short || r.name,
    price: r.price,
    mrp: r.mrp ?? undefined,
    collection: r.collection,
    badge: r.badge || undefined,
    blurb: r.blurb || '',
    fit: r.fit || undefined,
    cardFace: r.card_face === 'front' ? 'front' : 'back',
    features: featuresFor(r.fit),
    colors: (r.colors || []).map(colorway),
    photos: (r.photos || []).map(image).filter(Boolean),
    active: r.active !== false,
    sort: r.sort ?? 100,
  };
}

const strip = (img) => img && { src: img.src, srcSm: img.srcSm, w: img.w, h: img.h, wSm: img.wSm };

export function toRow(p) {
  return {
    slug: p.slug,
    name: p.name,
    short: p.short,
    price: p.price,
    mrp: p.mrp ?? null,
    collection: p.collection,
    badge: p.badge || null,
    blurb: p.blurb || '',
    fit: p.fit || null,
    card_face: p.cardFace || 'back',
    colors: p.colors.map((c) => ({
      id: c.id,
      name: c.name,
      hex: c.hex,
      tone: c.tone,
      front: strip(c.front),
      back: strip(c.back),
      prints: { front: c.prints.front ?? null, back: c.prints.back ?? null },
    })),
    photos: (p.photos || []).map((ph) => ({ src: ph.src, srcSm: ph.srcSm, w: ph.w, h: ph.h })),
    active: p.active !== false,
    sort: p.sort ?? 100,
  };
}

/** Filter list for the shop: 'All' plus every collection in catalog order. */
export const collectionsOf = (list) => ['All', ...new Set(list.map((p) => p.collection))];

/** URL-safe slug from a product name. */
export const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
