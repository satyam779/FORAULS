import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Rotate3d } from 'lucide-react';
import { discount, formatPrice } from '../lib/format';

const spring = { stiffness: 220, damping: 22, mass: 0.6 };

/** Card images: 2 columns on phones, 3 on desktop (≈340px wide inside the card). */
const SIZES = '(min-width: 1024px) 340px, 45vw';
const srcSet = (c) => `${c.srcSm} ${c.wSm}w, ${c.src} ${c.w}w`;

export default function ProductCard({ product, eager = false }) {
  const c = product.colors[0];
  const hero = product.cardFace === 'front' ? c.front : c.back;
  const alt = product.cardFace === 'front' ? c.back : c.front;

  // pointer-follow tilt (mouse/pen only — touch keeps the card still)
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-14, 14]), spring);
  const rotateX = useSpring(useTransform(py, [0, 1], [9, -9]), spring);

  const onMove = (e) => {
    if (e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <article className="group relative">
      <Link to={`/product/${product.slug}`} className="block rounded-2xl" aria-label={`${product.short}, ${formatPrice(product.price)}`}>
        <div
          className="stage-bg relative aspect-[4/5] overflow-hidden rounded-2xl"
          style={{ perspective: 900 }}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          <motion.div className="absolute inset-[7%]" style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
            <img
              src={hero.src}
              srcSet={srcSet(hero)}
              sizes={SIZES}
              alt={`${product.short} — ${product.cardFace} print`}
              width={hero.w}
              height={hero.h}
              loading={eager ? 'eager' : 'lazy'}
              fetchPriority={eager ? 'high' : undefined}
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_22px_24px_rgba(0,0,0,0.28)] transition-opacity duration-500 ease-out group-hover:opacity-0"
            />
            <img
              src={alt.src}
              srcSet={srcSet(alt)}
              sizes={SIZES}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain opacity-0 drop-shadow-[0_22px_24px_rgba(0,0,0,0.28)] transition-opacity duration-500 ease-out group-hover:opacity-100"
            />
          </motion.div>

          {product.badge && (
            <span className="absolute top-3 left-3 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] font-bold tracking-wider text-ink uppercase shadow-sm backdrop-blur">
              {product.badge}
            </span>
          )}

          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1.5 text-xs font-semibold text-paper backdrop-blur transition-transform duration-300 group-hover:-translate-y-0.5">
            <Rotate3d className="h-3.5 w-3.5" aria-hidden />
            View in 3D
          </span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3 px-0.5">
          <div className="min-w-0">
            <h3 className="truncate font-semibold tracking-tight">{product.short}</h3>
            <p className="mt-0.5 text-sm text-muted">
              {product.collection} · {product.colors.length} colour{product.colors.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-bold">{formatPrice(product.price)}</p>
            {product.mrp > product.price && (
              <p className="text-xs text-muted">
                <span className="line-through">{formatPrice(product.mrp)}</span>{' '}
                <span className="font-semibold text-success">{discount(product.price, product.mrp)}% off</span>
              </p>
            )}
          </div>
        </div>
        <div className="mt-2 flex gap-1.5 px-0.5" aria-hidden>
          {product.colors.map((col) => (
            <span key={col.id} className="h-3.5 w-3.5 rounded-full ring-1 ring-ink/15 ring-offset-1" style={{ background: col.hex }} />
          ))}
        </div>
      </Link>
    </article>
  );
}
