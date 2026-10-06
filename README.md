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

## Orders, admin and products (Supabase)

Products and orders live in [Supabase](https://supabase.com). Shoppers check out with **cash on
delivery** and get a confirmation email. You manage everything at **`/admin`**.

### 1. Create the database

1. Create a Supabase project.
2. Open **SQL Editor → New query**, paste [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
   This creates the `products`, `orders` and `admins` tables, their security rules, and a public
   `products` storage bucket for images.
3. Run [`supabase/seed.sql`](supabase/seed.sql) the same way. It imports the current catalog.
   (To regenerate it after editing `src/data/products.js`, run `node scripts/make-seed.mjs`.)

### 2. Create your admin login

1. **Authentication → Users → Add user**: enter your email and a password (tick *Auto confirm*).
2. In the SQL Editor, run (with your email):
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
   ```
3. Recommended: **Authentication → Sign In / Providers → turn off "Allow new users to sign up"**.
   (Strangers who sign up still can't see anything, but there's no reason to let them.)

### 3. Set up order emails

Order emails go out over SMTP. The simplest option is a Gmail account:
turn on 2-Step Verification, then create an **App Password** (Google Account → Security → App
passwords) and use it as `SMTP_PASS`. To send from your own domain later, use any provider's SMTP
settings (Zoho, Brevo, Resend, …). Nothing in the code changes.

### 4. Environment variables

Copy [`.env.example`](.env.example) to `.env` for local development. Add the same variables in
**Vercel → Project → Settings → Environment Variables**, then redeploy.

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL (Project Settings → API) |
| `VITE_SUPABASE_KEY` | Publishable key, or the legacy `anon` key |
| `SUPABASE_SECRET_KEY` | Secret key, or the legacy `service_role` key. **Server only.** Never give it a `VITE_` prefix. |
| `SMTP_USER`, `SMTP_PASS` | Gmail address + App Password (or your provider's SMTP login) |
| `SMTP_HOST`, `SMTP_PORT` | Defaults: `smtp.gmail.com`, `465` |
| `ORDER_NOTIFY_EMAIL` | Optional: also email new orders to this address |
| `MAIL_FROM` | Optional: sender name/address shown to customers |

Checkout runs through the serverless function in [`api/orders.js`](api/orders.js). It re-prices the
cart from the database, so prices can't be tampered with in the browser, then saves the order and
sends the emails. `npm run dev` runs it locally too. On Netlify or Apache hosting there's no `/api`,
so ordering needs Vercel (or a port of that one function).

### Using the admin

- **Orders**: every order, newest first. Filter by status and search by name, phone, email or
  order number. Open an order to see the items, sizes and address, call or WhatsApp the customer,
  and move it through *New → Confirmed → Shipped → Delivered* (or *Cancelled*).
- **Products → New product**: fill in name, price and collection, then for each colour:
  1. pick the fabric colour the 3D tee should use,
  2. upload the **front** and/or **back** artwork (PNG or WebP with a transparent background),
  3. drag it on the flat tee to place it, drag the blue corner to resize, or use the presets
     (*Left chest*, *Full back*, …). The 3D preview updates live.

  When you **Save**, the admin renders the front and back product images from the 3D preview and
  uploads everything. Do this in Chrome or Edge, since the preview needs WebGPU. Real photos are optional.
- **Visible / Hidden** takes a product out of the shop without deleting it. Old orders keep their
  details either way.

New products appear in the shop straight away. Their share previews (WhatsApp / Instagram link
cards) are generated at build time, so redeploy on Vercel after adding products if you want those.

## Before launch: `src/config/store.js`

Everything customer-facing that isn't a product lives in this one file:

| Setting | What it does |
| --- | --- |
| `siteUrl` | Your live address, e.g. `https://forauls.com`. Needed for WhatsApp/Instagram link previews and the sitemap. Vercel and Netlify fill it in automatically if left empty. |
| `commerce` | `true` = cart + cash-on-delivery checkout. `false` = lookbook (no cart; products say "Coming soon"). |
| `contactEmail` | Shown in order emails and on the thank-you page. |
| `policies` | Free-shipping threshold, shipping fee below it, returns window, dispatch time, COD. Set any of them to `null` to hide it everywhere. |
| `fabric`, `sizes`, `sizeChart` | Fabric details, available sizes and measurements shown on product pages. |
| `social.instagram` | Adds a "Follow on Instagram" button to the footer. |

Products (names, prices, MRPs, badges, descriptions, artwork) are managed in the admin once Supabase
is connected. `src/data/products.js` is the built-in catalog: it renders the first visit instantly
and seeds the database. An MRP is only shown when it's higher than the price.

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
| `src/data/products.js` | Built-in catalog: names, prices, colourways (fabric `tone` and `prints`). |
| `src/data/catalog.js`, `src/lib/catalog.jsx` | Database row ↔ product conversion; the live catalog (cached, then fetched from Supabase). |
| `src/pages/Checkout.jsx`, `OrderPlaced.jsx` | Cash-on-delivery checkout and thank-you page. |
| `src/pages/admin/` | Admin: login, orders, products, product editor, flat-tee print placement (`PrintPlacer.jsx`). |
| `api/orders.js`, `api/_lib/` | Serverless order function: validation, pricing, saving, emails. |
| `supabase/schema.sql`, `seed.sql` | Database tables, security rules, storage bucket; the catalog as rows. |
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

Use **/admin → Products → New product** (see above). The steps below are the older offline
pipeline for building cutouts from real product photos into the built-in catalog:

1. Add the photo to `SOURCES` in `tools/make-cutouts.py`, then run
   `python -P tools/make-cutouts.py <photos-folder> public/products`.
2. Add the product to `JOBS` in `tools/make-prints.py`, then run `python -P tools/make-prints.py`.
   This keys the print off the fabric and works out where it sits on the shirt. If you already
   have a clean transparent PNG of the print, put it in `public/prints/` and reference it in
   `prints.json` instead.
3. Add an entry to `src/data/products.js`, and its name to `PRODUCTS` in `tools/make-og.py`. Then
   run `python -P tools/make-og.py` to create its share image.

The Python tools need `opencv-python`, `numpy`, `scipy` and `Pillow`.
