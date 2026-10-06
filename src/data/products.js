import manifest from './manifest.json';
import printData from './prints.json';
import { STORE } from '../config/store';

const BASE = import.meta.env.BASE_URL;

/** Resolve a path inside public/products, respecting Vite's base URL. */
export const asset = (p) => `${BASE}products/${p}`;

const shared = manifest._shared;
const P = printData;
const WORDMARK = P._wordmark; // FORAULS chest wordmark from the 3D tee (light + dark ink)

const print = (p) => (p ? { src: `${BASE}${p.src}`, rect: p.rect } : null);

/**
 * A colourway pairs photo cutouts (cards, gallery) with the 3D tee setup:
 * `tone` is the engine's fabric (jet = solid black, black = washed black, bone)
 * and `prints` are the transparent artworks painted onto the simulated cloth.
 */
function colorway(id, name, hex, tone, front, back, prints) {
  return {
    id,
    name,
    hex,
    tone,
    front: cutout(front),
    back: cutout(back),
    prints: { front: print(prints.front), back: print(prints.back) },
  };
}

/** Cutout image plus its 480px variant (`srcSm`, `wSm`) for cards and thumbnails. */
const cutout = (c) => ({
  ...c,
  src: asset(c.src),
  srcSm: asset(c.src.replace(/\.webp$/, '-sm.webp')),
  wSm: Math.round(c.w * Math.min(1, 480 / Math.max(c.w, c.h))),
});

const FEATURES = [
  { icon: 'leaf', label: `Premium ${STORE.fabric.gsm} GSM Cotton` },
  { icon: 'shirt', label: 'Oversized Fit' },
  { icon: 'image', label: 'HD Print Quality' },
  STORE.policies.returnsDays != null && { icon: 'package', label: `Easy ${STORE.policies.returnsDays} Day Returns` },
].filter(Boolean);

/** Feature bullets for a product; `fit` replaces the default "Oversized Fit" line. */
export const featuresFor = (fit) => (fit ? FEATURES.map((f) => (f.icon === 'shirt' ? { ...f, label: fit } : f)) : FEATURES);

const raw = [
  {
    slug: 'tiger-lily',
    name: 'Tiger Lily Oversized T-Shirt',
    short: 'Tiger Lily',
    price: 899,
    mrp: 1299,
    collection: 'Wild',
    badge: 'Bestseller',
    blurb: 'A tiger prowls through pink stargazer lilies in a dense, embroidered-look print. Minimal FORAULS mark up front.',
    colors: (m) => [
      colorway('black', 'Jet Black', '#111214', 'jet', m.front, m.back, { front: WORDMARK.light, back: P['tiger-lily'].back }),
    ],
  },
  {
    slug: 'red-sun-cranes',
    name: 'Red Sun Cranes Oversized T-Shirt',
    short: 'Red Sun Cranes',
    price: 999,
    mrp: 1399,
    collection: 'Wild',
    badge: 'New',
    blurb: 'Two cranes circle a stitched red sun over a windswept pine — a Japanese embroidery study, printed in high definition.',
    colors: (m) => [
      colorway('black', 'Jet Black', '#111214', 'jet', shared['front-black'], m.back, { front: WORDMARK.light, back: P['red-sun-cranes'].back }),
    ],
  },
  {
    slug: 'monte-carlo',
    name: 'Monte Carlo GP Washed T-Shirt',
    short: 'Monte Carlo GP',
    price: 1099,
    mrp: 1499,
    collection: 'Retro',
    badge: 'Trending',
    blurb: 'Circuit de Monaco, turn by turn. A motorsport poster tee on vintage acid-washed cotton.',
    colors: (m) => [
      colorway('washed', 'Washed Black', '#2b2b2d', 'black', shared['front-washed'], m.back, { front: WORDMARK.light, back: P['monte-carlo'].back }),
    ],
  },
  {
    slug: 'money-war',
    name: 'Money / War Washed T-Shirt',
    short: 'Money / War',
    price: 999,
    mrp: 1399,
    collection: 'Statement',
    blurb: '“Stop wasting money to war in vain.” Banknote engraving collage in indigo tones on washed black.',
    colors: (m) => [
      colorway('washed', 'Washed Black', '#2b2b2d', 'black', m.front, m.back, { front: P['money-war'].front, back: P['money-war'].back }),
    ],
  },
  {
    slug: 'wander-beyond',
    name: 'Wander Beyond Washed T-Shirt',
    short: 'Wander Beyond',
    price: 949,
    mrp: 1299,
    collection: 'Wild',
    blurb: 'A humpback breaches through clouds and starlight. Depth is freedom — bone-ink print on washed black.',
    colors: (m) => [
      colorway('washed', 'Washed Black', '#2b2b2d', 'black', shared['front-washed'], m.back, { front: WORDMARK.light, back: P['wander-beyond'].back }),
    ],
  },
  {
    slug: 'paper-dreams',
    name: 'Paper Dreams Oversized T-Shirt',
    short: 'Paper Dreams',
    price: 949,
    mrp: 1299,
    collection: 'Statement',
    badge: 'New',
    blurb: 'A two-dollar bill folded into flight. Value is temporary — fold, fly, fade.',
    colors: (m) => [
      colorway('black', 'Jet Black', '#111214', 'jet', shared['front-black'], m.back, { front: WORDMARK.light, back: P['paper-dreams'].back }),
    ],
  },
  {
    slug: 'kraken',
    name: 'Kraken Boxy Crop T-Shirt',
    short: 'Kraken',
    price: 1049,
    mrp: 1499,
    collection: 'Wild',
    badge: 'Limited',
    cardFace: 'front',
    fit: 'Boxy Cropped Fit',
    blurb: 'A vintage-engraved octopus wraps from chest to shoulder and spills its tentacles across the back.',
    colors: (m) => [
      colorway('washed', 'Washed Black', '#2b2b2d', 'black', m.front, m.back, { front: P.kraken.front, back: P.kraken.back }),
    ],
  },
  {
    slug: 'sunset-rock',
    name: 'Sunset Rock Tour T-Shirt',
    short: 'Sunset Rock',
    price: 899,
    mrp: 1199,
    collection: 'Retro',
    blurb: 'A 1985 summer tour poster with a radiant glass heart. Get ready for an unforgettable summer.',
    colors: (m) => [
      colorway('black', 'Jet Black', '#111214', 'black', shared['front-black'], m.back, { front: WORDMARK.light, back: P['sunset-rock'].back }),
      colorway('white', 'Bone White', '#e7e3dc', 'bone', shared['front-white'], m['back-white'], {
        front: WORDMARK.dark,
        back: P['sunset-rock']['back-white'],
      }),
    ],
  },
  {
    slug: 'brave-bird',
    name: 'Be Brave Oversized T-Shirt',
    short: 'Be Brave',
    price: 899,
    mrp: 1199,
    collection: 'Wild',
    blurb: 'A sparrow takes flight through crimson blooms. Be brave in your life — enjoy the moment, express your art.',
    colors: (m) => [
      colorway('black', 'Jet Black', '#111214', 'jet', shared['front-black'], m.back, { front: WORDMARK.light, back: P['brave-bird'].back }),
      colorway('white', 'Bone White', '#e7e3dc', 'bone', shared['front-white'], m['back-white'], {
        front: WORDMARK.dark,
        back: P['brave-bird']['back-white'],
      }),
    ],
  },
];

/**
 * The built-in catalog. It's bundled so pages render instantly, and it seeds the
 * Supabase `products` table (scripts/make-seed.mjs). Once Supabase is connected
 * the live catalog replaces it — see src/lib/catalog.jsx.
 */
export const products = raw.map((p, i) => {
  const m = manifest[p.slug];
  return {
    ...p,
    cardFace: p.cardFace ?? 'back',
    features: featuresFor(p.fit),
    colors: p.colors(m),
    photos: m.photos.map((ph) => ({ ...ph, src: asset(ph.src), srcSm: asset(ph.src.replace(/\.webp$/, '-sm.webp')) })),
    sort: (i + 1) * 10,
  };
});
