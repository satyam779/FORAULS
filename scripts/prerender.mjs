/**
 * Post-build: writes an HTML entry per route with its own <title>, description,
 * canonical URL and Open Graph / Twitter tags, so shared product links show the
 * right preview and deep links load directly on any static host. Also writes
 * 404.html, robots.txt and (when the site URL is known) sitemap.xml.
 *
 * Run automatically by `npm run build`.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';

const DIST = new URL('../dist/', import.meta.url);

// Load the catalog through Vite so JSON imports and import.meta.env just work.
const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
const { products: builtin } = await vite.ssrLoadModule('/src/data/products.js');
const { fromRow } = await vite.ssrLoadModule('/src/data/catalog.js');
const { STORE } = await vite.ssrLoadModule('/src/config/store.js');
await vite.close();

// With Supabase configured, products added in the admin get pages too (as of this build).
async function liveProducts() {
  const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_KEY || '';
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/products?select=*&active=eq.true&order=sort.asc`, {
      headers: { apikey: key, ...(key.startsWith('eyJ') && { Authorization: `Bearer ${key}` }) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return rows.length ? rows.map(fromRow) : null;
  } catch (e) {
    console.warn(`⚠  Couldn't load products from Supabase (${e.message}); prerendering the bundled catalog.`);
    return null;
  }
}
const products = (await liveProducts()) ?? builtin;

const site = (
  STORE.siteUrl ||
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  process.env.URL || // Netlify
  ''
).replace(/\/+$/, '');

const abs = (path) => (/^https?:/.test(path) || !site ? path : site + path);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const shell = await readFile(new URL('index.html', DIST), 'utf8');

function render({ path, title, description, image, noindex = false }) {
  const tags = [
    `<meta name="description" content="${esc(description)}" />`,
    noindex && '<meta name="robots" content="noindex" />',
    site && !noindex && `<link rel="canonical" href="${abs(path)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    site && `<meta property="og:url" content="${abs(path)}" />`,
    `<meta property="og:image" content="${abs(image)}" />`,
    image.startsWith('/og/') && '<meta property="og:image:width" content="1200" />',
    image.startsWith('/og/') && '<meta property="og:image:height" content="630" />',
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${abs(image)}" />`,
  ].filter(Boolean);
  return shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/\s*<meta name="description"[^>]*>/, '')
    .replace('</head>', `  ${tags.join('\n    ')}\n  </head>`);
}

async function write(file, html) {
  const url = new URL(file, DIST);
  await mkdir(new URL('.', url), { recursive: true });
  await writeFile(url, html);
}

const pages = [
  { path: '/', file: 'index.html', title: `${STORE.name} — Oversized Graphic Tees`, description: STORE.description, image: '/og/home.jpg' },
  ...products.map((p) => ({
    path: `/product/${p.slug}`,
    file: `product/${p.slug}/index.html`,
    title: `${p.name} — ${STORE.name}`,
    description: p.blurb,
    // made-for-sharing card if there is one, else the product image
    image: existsSync(new URL(`og/${p.slug}.jpg`, DIST)) ? `/og/${p.slug}.jpg` : p.colors[0][p.cardFace].src,
  })),
];

for (const page of pages) await write(page.file, render(page));
await write(
  '404.html',
  render({ path: '/404', title: `Page not found — ${STORE.name}`, description: STORE.description, image: '/og/home.jpg', noindex: true }),
);

await writeFile(new URL('robots.txt', DIST), `User-agent: *\nAllow: /\nDisallow: /admin\n${site ?`\nSitemap: ${site}/sitemap.xml\n` : ''}`);
if (site) {
  const urls = pages.map((p) => `  <url><loc>${abs(p.path)}</loc></url>`).join('\n');
  await writeFile(
    new URL('sitemap.xml', DIST),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
}

console.log(`prerendered ${pages.length} pages + 404${site ? ` for ${site} (with sitemap)` : ''}`);
if (!site) {
  console.warn(
    '\n⚠  No site URL set: link previews need absolute image URLs, and no sitemap was written.\n' +
      '   Set STORE.siteUrl in src/config/store.js (or SITE_URL=https://… when building).\n' +
      '   Vercel and Netlify builds pick it up automatically.\n',
  );
}
