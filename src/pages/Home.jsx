import { useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Rotate3d, Sparkles } from 'lucide-react';
import { collections, getProduct, products } from '../data/products';
import { formatPrice } from '../lib/format';
import TeeViewer, { hasWebGPU } from '../components/TeeViewer';
import ProductCard from '../components/ProductCard';
import FeatureIcon from '../components/FeatureIcon';
import { STORE } from '../config/store';

const { gsm } = STORE.fabric;
const { returnsDays, freeShippingAbove } = STORE.policies;

const featured = getProduct('tiger-lily');

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.7, ease: [0.16, 1, 0.3, 1] } }),
};

export default function Home() {
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const active = collections.includes(params.get('c')) ? params.get('c') : 'All';
  const list = active === 'All' ? products : products.filter((p) => p.collection === active);

  useEffect(() => {
    document.title = 'FORAULS — Oversized Graphic Tees';
  }, []);

  useEffect(() => {
    if (hash === '#shop') document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  }, [hash, active]);

  return (
    <>
      <Hero />
      <Marquee />

      <section id="shop" className="mx-auto max-w-7xl scroll-mt-16 px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="shop-title">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-muted uppercase">Drop 02 · {products.length} designs</p>
            <h2 id="shop-title" className="mt-2 font-display text-5xl leading-none uppercase sm:text-6xl">
              The collection
            </h2>
          </div>
          <div className="flex flex-wrap gap-1 rounded-full bg-ink/5 p-1" role="group" aria-label="Filter by collection">
            {collections.map((c) => (
              <button
                key={c}
                onClick={() => setParams(c === 'All' ? {} : { c }, { replace: true, preventScrollReset: true })}
                aria-pressed={active === c}
                className="relative h-11 rounded-full px-5 text-sm font-semibold"
              >
                {active === c && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full bg-ink shadow"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className={`relative transition-colors ${active === c ? 'text-paper' : 'text-ink-2 hover:text-ink'}`}>{c}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.ul layout className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((p, i) => (
              <motion.li
                key={p.slug}
                layout
                variants={rise}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                custom={i % 3}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
              >
                <ProductCard product={p} eager={i < 3} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </section>

      <Features />
    </>
  );
}

function Hero() {
  const c = featured.colors[0];

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 pt-8 pb-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-14 lg:pb-16">
        <div className="relative z-10">
          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold tracking-wider uppercase"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> New drop
          </motion.p>
          <motion.h1
            variants={rise}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-5 font-display text-[clamp(3.6rem,11vw,8.75rem)] leading-[0.88] uppercase"
          >
            Beauty is
            <br />
            <span className="text-zinc-400">untamed.</span>
          </motion.h1>
          <motion.p variants={rise} initial="hidden" animate="show" custom={2} className="mt-6 max-w-md text-lg leading-relaxed text-ink-2">
            Art-driven oversized tees. Inspired by nature, made for the few — and every piece spins in full 3D before it&apos;s yours.
          </motion.p>
          <motion.div variants={rise} initial="hidden" animate="show" custom={3} className="mt-8 flex flex-wrap gap-3">
            <a
              href="#shop"
              className="group inline-flex h-13 items-center gap-2 rounded-full bg-ink px-7 font-semibold text-paper shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)] transition-colors hover:bg-ink-2"
            >
              {STORE.commerce ? 'Shop the drop' : 'Explore the drop'}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
            </a>
            <Link
              to={`/product/${featured.slug}`}
              className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-ink px-7 font-semibold transition-colors hover:bg-ink/5"
            >
              <Rotate3d className="h-5 w-5" aria-hidden /> Open in 3D
            </Link>
          </motion.div>
          <motion.dl variants={rise} initial="hidden" animate="show" custom={4} className="mt-10 flex gap-8 text-sm sm:gap-12">
            {[
              ['Oversized', 'Drop-shoulder fit'],
              [String(gsm), 'GSM cotton'],
              returnsDays != null && [`${returnsDays}-day`, 'Easy returns'],
            ]
              .filter(Boolean)
              .map(([v, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="text-2xl font-bold">{v}</dd>
                <dd className="text-muted">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="tee-stage relative h-[440px] overflow-hidden rounded-[2rem] sm:h-[520px] lg:h-[620px]"
        >
          <TeeViewer
            className="absolute inset-0"
            colorway={c}
            mode="mannequin"
            autoSpin={-0.35}
            initialAngle={200}
            framing={{ dy: -0.09, dist: 0.88 }}
            poster={c.back.src}
            label={`${featured.short} in 3D`}
          />
          {hasWebGPU && (
            <p className="pointer-events-none absolute top-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-paper/70 px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-ink-2 backdrop-blur">
              <Rotate3d className="h-4 w-4" aria-hidden /> Drag to spin
            </p>
          )}
          <Link
            to={`/product/${featured.slug}`}
            className="absolute right-4 bottom-4 left-4 flex items-center justify-between gap-3 rounded-2xl bg-paper/85 p-3 pl-4 shadow-lg backdrop-blur-md transition hover:bg-paper sm:right-auto sm:left-5 sm:w-80"
          >
            <span>
              <span className="block font-semibold">{featured.short}</span>
              <span className="text-sm text-muted">{formatPrice(featured.price)} · Oversized</span>
            </span>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-paper">
              <ArrowRight className="h-5 w-5" aria-hidden />
              <span className="sr-only">View {featured.short}</span>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    'Oversized fit',
    `${gsm} GSM heavyweight cotton`,
    freeShippingAbove != null && `Free shipping over ₹${freeShippingAbove.toLocaleString('en-IN')}`,
    returnsDays != null && `Easy ${returnsDays}-day returns`,
    'Spin every tee in 3D',
  ].filter(Boolean);
  const row = (hidden) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <span key={t} className="flex items-center gap-6 pr-6 font-display text-xl tracking-wide uppercase sm:text-2xl">
          {t}
          <Sparkles className="h-4 w-4 text-zinc-500" aria-hidden />
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden bg-ink py-4 text-paper">
      <div className="animate-marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

function Features() {
  const items = [
    { icon: 'leaf', title: `${gsm} GSM cotton`, body: 'Heavyweight, pre-shrunk combed cotton that holds its shape wash after wash.' },
    { icon: 'shirt', title: 'Oversized block', body: 'Dropped shoulders, boxy body and a relaxed sleeve for that effortless drape.' },
    { icon: 'image', title: 'HD print quality', body: 'Dense, vivid prints engineered for detail — every stitch-look and fine line.' },
    returnsDays != null && {
      icon: 'package',
      title: `Easy ${returnsDays}-day returns`,
      body: `Not the one? Return or exchange within ${returnsDays} days, no questions asked.`,
    },
  ].filter(Boolean);
  return (
    <section className="bg-zinc-100" aria-labelledby="features-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 id="features-title" className="max-w-2xl font-display text-4xl leading-none uppercase sm:text-5xl">
          Made for the few. Built to last.
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((f, i) => (
            <motion.li
              key={f.title}
              variants={rise}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              custom={i}
              className="rounded-2xl bg-paper p-6 shadow-sm ring-1 ring-line"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-paper">
                <FeatureIcon name={f.icon} />
              </span>
              <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
