# FORAULS store

React + Tailwind + framer-motion storefront. Each product opens in a **3D View**: the WebGPU
cloth-simulated tee from `forauls-tiger-tee.html`, with that product's prints and fabric colour
painted onto it. **Photo View** shows the real product photos.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
```

The 3D view needs WebGPU (Chrome or Edge 113+, Safari 26+). Other browsers fall back to Photo View automatically.

## How it fits together

| Path | What it is |
| --- | --- |
| `src/tee3d/engine.js` | The cloth engine, **generated** from `forauls-tiger-tee.html`. Don't edit it by hand. |
| `src/components/TeeViewer.jsx` | Mounts the engine on a canvas. Passes in prints, colour and mode, and pauses it when off screen. |
| `src/pages/Product.jsx` | Product page: 3D/Photo toggle, auto-rotate/wind/shake/zoom, On body/Hanger/Drop. |
| `src/data/products.js` | Catalog: names, prices, colourways (fabric `tone` and `prints`). |
| `src/data/manifest.json`, `prints.json` | Generated image metadata (cutouts, print placement). |
| `public/products/<slug>/` | Cutouts (cards and gallery), photos, and transparent `print-*.webp` artwork. |

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
3. Add an entry to `src/data/products.js`.

The Python tools need `opencv-python`, `numpy`, `scipy` and `Pillow`.
