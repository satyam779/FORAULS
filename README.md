# FORAULS store

React + Tailwind + framer-motion storefront. Each product opens in a **3D View**: the WebGPU
cloth-simulated tee from `forauls-tiger-tee.html`, with that product's prints and fabric colour
painted onto it. **Photo View** shows the real product photos.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/ (includes per-page share previews)
npm run preview   # serve the production build locally
```

The 3D view needs WebGPU (Chrome or Edge 113+, Safari 26+). Other browsers fall back to Photo View automatically.

## Before launch: `src/config/store.js`

Everything customer-facing that isn't a product lives in this one file:

| Setting | What it does |
| --- | --- |
| `siteUrl` | Your live address, e.g. `https://forauls.com`. Needed for WhatsApp/Instagram link previews and the sitemap. Vercel and Netlify fill it in automatically if left empty. |
| `commerce` | `false` = lookbook (no cart; products say "Coming soon"). Set `true` once a checkout is connected. The cart and its drawer are already built. |
| `policies` | Free-shipping threshold, returns window, dispatch time, COD. Set any of them to `null` to hide it everywhere. |
| `fabric`, `sizes`, `sizeChart` | Fabric details, available sizes and measurements shown on product pages. |
| `social.instagram` | Adds a "Follow on Instagram" button to the footer. |

Product names, prices, MRPs, badges and descriptions are in `src/data/products.js`. An MRP is
only shown when it's higher than the price.

## Deploying

The build output is a static site in `dist/`. Config for the common hosts is included:

- **Vercel**: import the repo. `vercel.json` sets the build, deep-link fallback, caching and security headers.
- **Netlify**: build command `npm run build`, publish directory `dist`. `_redirects` and `_headers` are included.
- **Hostinger / cPanel (Apache)**: run `npm run build` and upload the *contents* of `dist/` to `public_html`. `.htaccess` handles HTTPS, deep links, caching and headers.

Every product has its own pre-built page (`/product/<slug>`) with its title, description and share
image, so links pasted into WhatsApp or Instagram preview correctly. A Content Security Policy is
added to production builds.

## How it fits together

| Path | What it is |
| --- | --- |
| `src/tee3d/engine.js` | The cloth engine, **generated** from `forauls-tiger-tee.html`. Don't edit it by hand. |
| `src/components/TeeViewer.jsx` | Mounts the engine on a canvas. Passes in prints, colour and mode, and pauses it when off screen. |
| `src/pages/Product.jsx` | Product page: 3D/Photo toggle, auto-rotate/wind/shake/zoom, On body/Hanger/Drop. |
| `src/data/products.js` | Catalog: names, prices, colourways (fabric `tone` and `prints`). |
| `src/data/manifest.json`, `prints.json` | Generated image metadata (cutouts, print placement). |
| `public/products/<slug>/` | Cutouts (with `-sm` variants for phones), photos, and transparent `print-*.webp` artwork. |
| `public/og/`, `public/icons/` | Share-preview images and app icons. |
| `scripts/prerender.mjs` | Post-build step: per-page HTML, 404 page, robots.txt, sitemap.xml. |

## Updating the 3D engine

Edit `forauls-tiger-tee.html` as before, then regenerate the module:

```bash
python -P tools/build-engine.py
```

## Adding a product

1. Add the photo to `SOURCES` in `tools/make-cutouts.py`, then run
   `python -P tools/make-cutouts.py <photos-folder> public/products`.
2. Add the product to `JOBS` in `tools/make-prints.py`, then run `python -P tools/make-prints.py`.
   This keys the print off the fabric and works out where it sits on the shirt. If you already
   have a clean transparent PNG of the print, put it in `public/prints/` and reference it in
   `prints.json` instead.
3. Add an entry to `src/data/products.js`, and its name to `PRODUCTS` in `tools/make-og.py`. Then
   run `python -P tools/make-og.py` to create its share image.

The Python tools need `opencv-python`, `numpy`, `scipy` and `Pillow`.
