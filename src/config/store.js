/**
 * Store-wide settings. Edit these before launch — everything customer-facing
 * (policies, sizes, links) reads from here. Products are managed in the admin
 * (/admin) once Supabase is connected; src/data/products.js is the built-in catalog.
 */
export const STORE = {
  name: 'FORAULS',
  tagline: 'Inspired by nature. Made for the few. Grown different, built forever.',
  description: 'FORAULS — art-driven oversized heavyweight tees. Spin every design in 3D before it’s yours.',

  /**
   * Public URL of the live site, e.g. 'https://forauls.com' (no trailing slash).
   * Used for the sitemap, canonical links and WhatsApp/Instagram link previews.
   * On Vercel or Netlify it is picked up automatically when left empty.
   */
  siteUrl: '',

  /**
   * Online ordering. false = lookbook: no cart, no checkout, products marked
   * "Coming soon". true = cart + cash-on-delivery checkout (needs Supabase and
   * the email settings — see README).
   */
  commerce: true,

  /** Shown in order emails and on the order confirmation page. */
  contactEmail: '', // e.g. 'hello@forauls.com'

  // Policies shown on product pages, the footer and the marquee.
  // Set a value to null to hide that line.
  policies: {
    freeShippingAbove: 999, // ₹ — orders at or above this ship free
    shippingFee: 79, // ₹ — charged below the free-shipping threshold
    returnsDays: 7,
    dispatch: 'Dispatched within 24–48 hours',
    cod: true,
  },

  fabric: {
    gsm: 240,
    composition: '100% combed cotton',
    care: 'Machine wash cold, inside out. Do not iron directly on the print.',
  },

  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  /** Garment measurements in inches (oversized block). */
  sizeChart: [
    { size: 'S', chest: 44, length: 28, shoulder: 21.5 },
    { size: 'M', chest: 46, length: 29, shoulder: 22.5 },
    { size: 'L', chest: 48, length: 30, shoulder: 23.5 },
    { size: 'XL', chest: 50, length: 31, shoulder: 24.5 },
    { size: 'XXL', chest: 52, length: 32, shoulder: 25.5 },
  ],

  /** Social links shown in the footer; leave empty to hide. */
  social: {
    instagram: '', // e.g. 'https://instagram.com/forauls'
  },
};

const P = STORE.policies;

/** Shipping charge for a cart subtotal (₹). Used by checkout and by the order API. */
export const shippingFor = (subtotal) =>
  P.freeShippingAbove != null && subtotal >= P.freeShippingAbove ? 0 : (P.shippingFee ?? 0);

/** Short policy lines for the footer / marquee, built from the settings above. */
export const policyLines = [
  P.freeShippingAbove != null && `Free shipping over ₹${P.freeShippingAbove.toLocaleString('en-IN')}`,
  P.returnsDays != null && `Easy ${P.returnsDays}-day returns`,
  P.dispatch,
  P.cod && 'Cash on delivery available',
].filter(Boolean);
