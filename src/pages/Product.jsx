import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  Check,
  Pause,
  Play,
  Plus,
  Rotate3d,
  RotateCcw,
  Ruler,
  ShoppingBag,
  Waves,
  Wind,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { getProduct, products } from '../data/products';
import { STORE } from '../config/store';
import { useMeta } from '../lib/useMeta';
import { useCart } from '../lib/cart';
import { discount, formatPrice } from '../lib/format';
import TeeViewer, { hasWebGPU } from '../components/TeeViewer';
import PhotoViewer from '../components/PhotoViewer';
import TryOnModal from '../components/TryOnModal';
import Modal from '../components/Modal';
import FeatureIcon from '../components/FeatureIcon';
import ProductCard from '../components/ProductCard';
import NotFound from './NotFound';

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const rad = (deg) => (deg * Math.PI) / 180;

const SIM_MODES = [
  ['mannequin', 'On body'],
  ['hanger', 'Hanger'],
  ['free', 'Drop'],
];

export default function Product() {
  const { slug } = useParams();
  const product = getProduct(slug);
  if (!product) return <NotFound />;
  return <ProductView key={slug} product={product} />;
}

function ProductView({ product }) {
  const { add, setOpen } = useCart();
  const reduced = useReducedMotion();
  const [colorId, setColorId] = useState(product.colors[0].id);
  const colorway = product.colors.find((c) => c.id === colorId);
  const [size, setSize] = useState(null);
  const [sizeError, setSizeError] = useState(0);
  const [mode, setMode] = useState(hasWebGPU ? '3d' : 'photo');
  const [photo, setPhoto] = useState(0);
  const [added, setAdded] = useState(false);
  const [tryOn, setTryOn] = useState(false);
  const [guide, setGuide] = useState(false);

  // 3D tee state
  const apiRef = useRef(null);
  const rotation = useMotionValue(0);
  const tween = useRef(null);
  const [viewer, setViewer] = useState(hasWebGPU ? 'loading' : 'unsupported');
  const [simMode, setSimMode] = useState('mannequin');
  const [spinning, setSpinning] = useState(false);
  const [wind, setWind] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const can3d = viewer === 'loading' || viewer === 'ready';

  useMeta(`${product.name} — ${STORE.name}`, product.blurb);

  useEffect(() => () => tween.current?.stop(), []);

  /** Turn the tee to `deg` (display degrees, unwrapped). */
  const turnTo = (deg, duration = 0.9) => {
    const a = apiRef.current;
    if (!a) return;
    tween.current?.stop();
    if (reduced) {
      a.setYaw(-rad(deg), true);
      return;
    }
    tween.current = animate(rotation.get(), deg, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => a.setYaw(-rad(v), true),
    });
  };
  const onViewer = (s) => {
    setViewer(s);
    if (s === 'ready') turnTo(product.cardFace === 'front' ? 360 : 540, 2.2);
    if (s === 'unsupported' || s === 'error') setMode('photo');
  };

  const interact = () => {
    tween.current?.stop();
    setInteracted(true);
  };

  const gallery = useMemo(() => {
    const main = product.cardFace;
    const other = main === 'front' ? 'back' : 'front';
    return [
      { kind: 'cutout', src: colorway[main].src, thumb: colorway[main].srcSm, label: `${cap(main)} view` },
      { kind: 'cutout', src: colorway[other].src, thumb: colorway[other].srcSm, label: `${cap(other)} view` },
      ...product.photos.map((p, i) => ({ kind: 'photo', src: p.src, thumb: p.srcSm, label: `Photo ${i + 1}` })),
    ];
  }, [product, colorway]);

  const details = useMemo(() => {
    const f = STORE.fabric;
    const p = STORE.policies;
    const shipping = [
      p.freeShippingAbove != null && `Free shipping on orders over ${formatPrice(p.freeShippingAbove)}.`,
      p.dispatch && `${p.dispatch}.`,
      p.cod && 'Cash on delivery available.',
      p.returnsDays != null && `Easy ${p.returnsDays}-day returns and exchanges.`,
    ].filter(Boolean);
    return [
      ['About this design', product.blurb],
      ['Fabric & care', `${f.composition}, ${f.gsm} GSM heavyweight jersey. Pre-shrunk, drop-shoulder oversized block. ${f.care}`],
      shipping.length > 0 && ['Shipping & returns', shipping.join(' ')],
    ].filter(Boolean);
  }, [product]);

  const related = useMemo(() => {
    const others = products.filter((p) => p.slug !== product.slug);
    return [...others.filter((p) => p.collection === product.collection), ...others.filter((p) => p.collection !== product.collection)].slice(0, 3);
  }, [product]);

  const openPhoto = (i) => {
    setPhoto(i);
    setMode('photo');
  };

  const addToCart = () => {
    if (!size) {
      setSizeError((n) => n + 1);
      return;
    }
    add(product.slug, colorId, size);
    setAdded(true);
    setTimeout(() => setOpen(true), 500);
    setTimeout(() => setAdded(false), 2000);
  };

  const tools = [
    {
      label: spinning ? 'Pause auto-rotate' : 'Auto-rotate',
      icon: spinning ? Pause : Play,
      pressed: spinning,
      run: () => setSpinning((s) => !s),
    },
    {
      label: wind ? 'Turn wind off' : 'Turn wind on',
      icon: Wind,
      pressed: wind,
      run: () => {
        apiRef.current?.setWind(!wind);
        setWind(!wind);
      },
    },
    { label: 'Shake the tee', icon: Waves, run: () => apiRef.current?.shake() },
    { label: 'Zoom in', icon: ZoomIn, run: () => apiRef.current?.zoom(0.85) },
    { label: 'Zoom out', icon: ZoomOut, run: () => apiRef.current?.zoom(1 / 0.85) },
    { label: 'Reset fabric', icon: RotateCcw, run: () => apiRef.current?.reset() },
  ];

  return (
    <>
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[minmax(360px,440px)_1fr]">
        {/* ---------- Viewer ---------- */}
        <section
          aria-label="Product viewer"
          className="tee-stage relative order-1 h-[88svh] max-h-[800px] min-h-[620px] overflow-hidden lg:sticky lg:top-16 lg:order-2 lg:h-[calc(100svh-4rem)] lg:max-h-none lg:min-h-[680px]"
        >
          {hasWebGPU && (
            <TeeViewer
              className="absolute inset-0"
              colorway={colorway}
              mode={simMode}
              autoSpin={spinning ? -0.6 : 0}
              framing={{ dy: 0.0, dist: 1.04 }}
              rotation={rotation}
              apiRef={apiRef}
              paused={mode !== '3d'}
              onStatus={onViewer}
              onInteract={interact}
              poster={colorway[product.cardFace].src}
              label={`${product.short} in 3D`}
            />
          )}

          {/* top: mode toggle + hint */}
          <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex flex-col items-center gap-3 px-4">
            <div
              className="pointer-events-auto inline-flex rounded-full bg-zinc-900/10 p-1 shadow-inner backdrop-blur-md"
              role="group"
              aria-label="Viewer mode"
            >
              {[
                ['3d', '3D View'],
                ['photo', 'Photo View'],
              ].map(([id, text]) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  aria-pressed={mode === id}
                  disabled={id === '3d' && !can3d}
                  title={id === '3d' && !can3d ? '3D view needs a WebGPU browser (Chrome, Edge or Safari 26+)' : undefined}
                  className="relative h-11 rounded-full px-5 text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-45 sm:px-7"
                >
                  {mode === id && (
                    <motion.span
                      layoutId="mode-pill"
                      className="absolute inset-0 rounded-full bg-ink shadow-lg ring-2 ring-white"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className={`relative transition-colors ${mode === id ? 'text-paper' : 'text-ink-2 hover:text-ink'}`}>{text}</span>
                </button>
              ))}
            </div>
            {mode === '3d' ? (
              <p className="flex items-center gap-2 text-center text-sm font-medium text-ink-2 sm:text-[15px]">
                <Rotate3d className="h-5 w-5 shrink-0" aria-hidden />
                <span>
                  Drag to rotate 360°
                  <span className="hidden sm:inline"> · grab the tee to pull the fabric</span>
                </span>
              </p>
            ) : (
              !can3d && (
                <p className="rounded-full bg-paper/80 px-3 py-1 text-xs font-medium text-ink-2 backdrop-blur">
                  3D view needs a WebGPU browser — showing photos
                </p>
              )
            )}
          </div>

          {mode === '3d' && (
            <>
              <OrbitArrows hidden={interacted} />

              {/* right toolbar */}
              <div className="absolute top-28 right-3 z-20 flex flex-col gap-2 sm:right-4" role="toolbar" aria-label="3D controls" aria-orientation="vertical">
                {tools.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => {
                      interact();
                      t.run();
                    }}
                    disabled={viewer !== 'ready'}
                    aria-label={t.label}
                    aria-pressed={t.pressed}
                    title={t.label}
                    className={`grid h-11 w-11 place-items-center rounded-full shadow-md backdrop-blur transition disabled:opacity-40 ${
                      t.pressed ? 'bg-ink text-paper' : 'bg-paper/85 text-ink hover:bg-paper'
                    }`}
                  >
                    <t.icon className="h-[18px] w-[18px]" />
                  </button>
                ))}
              </div>

              {/* bottom: display mode */}
              <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20">
                <div className="flex justify-center">
                  <div className="pointer-events-auto inline-flex rounded-full bg-paper/75 p-1 shadow-sm backdrop-blur" role="group" aria-label="Display">
                    {SIM_MODES.map(([id, text]) => (
                      <button
                        key={id}
                        onClick={() => {
                          interact();
                          setSimMode(id);
                        }}
                        disabled={viewer !== 'ready'}
                        aria-pressed={simMode === id}
                        className={`h-9 rounded-full px-3.5 text-[13px] font-semibold transition-colors disabled:opacity-50 ${
                          simMode === id ? 'bg-ink text-paper' : 'text-ink-2 hover:text-ink'
                        }`}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <AnimatePresence initial={false}>
            {mode === 'photo' && (
              <motion.div
                key="photo"
                className="stage-bg absolute inset-0 z-10 pt-20 pb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                <PhotoViewer items={gallery} index={photo} onIndex={setPhoto} title={product.short} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ---------- Details ---------- */}
        <section className="order-2 px-4 pt-6 pb-12 sm:px-8 lg:order-1 lg:pt-8">
          <Link
            to="/#shop"
            className="-ml-2 inline-flex h-11 items-center gap-2 rounded-full px-2 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> All tees
          </Link>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <p className="mt-4 text-xs font-semibold tracking-[0.25em] text-muted uppercase">{product.collection} collection</p>
            <h1 className="mt-2 text-[2rem] leading-[1.08] font-extrabold tracking-tight text-balance sm:text-[2.4rem]">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
            </div>
            <p className="mt-1.5 text-sm text-muted">
              {product.mrp > product.price && (
                <>
                  MRP <span className="line-through">{formatPrice(product.mrp)}</span>{' '}
                  <span className="font-semibold text-success">{discount(product.price, product.mrp)}% off</span> ·{' '}
                </>
              )}
              Inclusive of all taxes
            </p>
          </motion.div>

          {/* gallery */}
          <div className="mt-6 grid grid-cols-6 gap-2.5">
            {gallery.map((g, i) => {
              const active = mode === 'photo' && photo === i;
              return (
                <button
                  key={g.src}
                  onClick={() => openPhoto(i)}
                  aria-label={`Open ${g.label}`}
                  className={`stage-bg overflow-hidden rounded-xl border-2 transition ${
                    i < 2 ? 'col-span-3 aspect-square' : 'col-span-2 aspect-square'
                  } ${active ? 'border-accent' : 'border-transparent hover:border-line'}`}
                >
                  <img
                    src={g.thumb}
                    alt=""
                    loading="lazy"
                    className={`h-full w-full transition-transform duration-500 hover:scale-105 ${g.kind === 'photo' ? 'object-cover' : 'object-contain p-2.5'}`}
                  />
                </button>
              );
            })}
          </div>

          {/* colour */}
          <div className="mt-7">
            <p id="color-label" className="text-base font-semibold">
              Color <span className="font-normal text-muted">— {colorway.name}</span>
            </p>
            <div className="mt-3 flex gap-3" role="group" aria-labelledby="color-label">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColorId(c.id)}
                  aria-label={c.name}
                  aria-pressed={c.id === colorId}
                  className={`grid h-12 w-12 place-items-center rounded-full border-2 transition ${
                    c.id === colorId ? 'border-accent' : 'border-transparent hover:border-line'
                  }`}
                >
                  <span className="h-9 w-9 rounded-full border border-ink/15 shadow-inner" style={{ background: c.hex }} />
                </button>
              ))}
            </div>
          </div>

          {STORE.commerce ? (
            <>
            {/* size */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p id="size-label" className="text-base font-semibold">
                  Size {size && <span className="font-normal text-muted">— {size}</span>}
                </p>
                <button
                  onClick={() => setGuide(true)}
                  className="-mr-2 inline-flex h-11 items-center gap-1.5 rounded-full px-2 text-sm font-medium underline-offset-4 hover:underline"
                >
                  <Ruler className="h-4 w-4" aria-hidden /> Size guide
                </button>
              </div>
              <motion.div
                key={sizeError}
                animate={sizeError ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="mt-2 grid grid-cols-5 gap-2"
                role="group"
                aria-labelledby="size-label"
                aria-describedby={sizeError && !size ? 'size-error' : undefined}
              >
                {STORE.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSize(s);
                      setSizeError(0);
                    }}
                    aria-pressed={size === s}
                    className={`h-12 rounded-xl border-2 text-base font-semibold transition ${
                      size === s ? 'border-accent bg-accent/5' : 'border-line hover:border-ink/40'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
              {sizeError > 0 && !size && (
                <p id="size-error" role="alert" className="mt-2 text-sm font-medium text-danger">
                  Please select a size to continue.
                </p>
              )}
            </div>

            {/* actions */}
            <div className="mt-7 space-y-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={addToCart}
                className="relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-ink text-lg font-semibold text-paper shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)] transition-colors hover:bg-ink-2"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={added ? 'ok' : 'add'}
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -18, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-2.5"
                  >
                    {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                    {added ? 'Added to bag' : 'Add to Cart'}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
              <button
                onClick={() => setTryOn(true)}
                className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-ink text-lg font-semibold transition-colors hover:bg-ink/5"
              >
                <Camera className="h-5 w-5" /> Virtual Try-On
              </button>
            </div>
            </>
          ) : (
            <>
              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="text-base font-semibold">
                  Sizes <span className="font-normal text-muted">— {STORE.sizes.join(' · ')}</span>
                </p>
                <button
                  onClick={() => setGuide(true)}
                  className="-mr-2 inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-2 text-sm font-medium underline-offset-4 hover:underline"
                >
                  <Ruler className="h-4 w-4" aria-hidden /> Size guide
                </button>
              </div>
              <div className="mt-6 space-y-3">
                <p className="flex items-center justify-center gap-2.5 rounded-2xl bg-ink/[0.05] px-4 py-4 text-center font-semibold">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500 motion-safe:animate-pulse" aria-hidden />
                  Coming soon — this drop isn&apos;t on sale yet
                </p>
                <button
                  onClick={() => setTryOn(true)}
                  className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-ink text-lg font-semibold text-paper shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)] transition-colors hover:bg-ink-2"
                >
                  <Camera className="h-5 w-5" /> Virtual Try-On
                </button>
              </div>
            </>
          )}

          <ul className="mt-8 space-y-4">
            {product.features.map((f) => (
              <li key={f.label} className="flex items-center gap-4 text-ink-2">
                <FeatureIcon name={f.icon} />
                {f.label}
              </li>
            ))}
          </ul>

          <div className="mt-8 divide-y divide-line border-y border-line">
            {details.map(([title, body], i) => (
              <details key={title} className="group py-1" open={i === 0}>
                <summary className="flex h-12 cursor-pointer list-none items-center justify-between font-semibold [&::-webkit-details-marker]:hidden">
                  {title}
                  <Plus className="h-5 w-5 transition-transform duration-300 group-open:rotate-45" aria-hidden />
                </summary>
                <p className="pb-4 leading-relaxed text-ink-2">{body}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {/* related */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-labelledby="related-title">
        <h2 id="related-title" className="font-display text-4xl uppercase sm:text-5xl">
          You may also like
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-6 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <TryOnModal open={tryOn} onClose={() => setTryOn(false)} colorway={colorway} product={product} />

      <Modal open={guide} onClose={() => setGuide(false)} title="Size guide">
        <p className="-mt-2 mb-4 text-sm text-muted">Garment measurements in inches. Oversized block — size down for a regular fit.</p>
        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/[0.04]">
              <tr>
                {['Size', 'Chest', 'Length', 'Shoulder'].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {STORE.sizeChart.map((r) => (
                <tr key={r.size} className={r.size === size ? 'bg-accent/5' : ''}>
                  <th scope="row" className="px-4 py-3 font-semibold">
                    {r.size}
                  </th>
                  <td className="px-4 py-3 tabular-nums">{r.chest}</td>
                  <td className="px-4 py-3 tabular-nums">{r.length}</td>
                  <td className="px-4 py-3 tabular-nums">{r.shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}

/** Decorative orbit arrows either side of the tee, like the reference design. */
function OrbitArrows({ hidden }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 600 120"
      className="pointer-events-none absolute inset-x-[3%] top-[47%] z-10 w-[94%]"
      initial={false}
      animate={{ opacity: hidden ? 0 : 0.9 }}
      transition={{ duration: 0.6 }}
    >
      <defs>
        <marker id="orbit-head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#fff" />
        </marker>
      </defs>
      {['M181.7 103.5 A280 48 0 0 1 70.6 32.5', 'M418.3 103.5 A280 48 0 0 0 529.4 32.5'].map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          markerEnd="url(#orbit-head)"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
        />
      ))}
    </motion.svg>
  );
}
