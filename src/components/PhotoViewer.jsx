import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const slide = {
  enter: (dir) => ({ opacity: 0, x: dir * 60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir * -60 }),
};

/** Photo gallery: studio cutouts + real photos, swipe/arrows/keys, click to zoom. */
export default function PhotoViewer({ items, index, onIndex, title }) {
  const [dir, setDir] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const frameRef = useRef(null);
  const dragged = useRef(false);
  const item = items[index];

  const go = (delta) => {
    setDir(delta);
    setZoom(false);
    onIndex((index + delta + items.length) % items.length);
  };

  const track = (e) => {
    const r = frameRef.current.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div
      className="flex h-full flex-col"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
    >
      <div className="relative min-h-0 flex-1 px-4 sm:px-14">
        <div
          ref={frameRef}
          className={`relative h-full overflow-hidden rounded-2xl ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
          onPointerMove={zoom ? track : undefined}
          onClick={(e) => {
            if (dragged.current) {
              dragged.current = false;
              return;
            }
            track(e);
            setZoom((z) => !z);
          }}
        >
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={item.src}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              drag={zoom ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragStart={() => {
                dragged.current = true;
              }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                else if (info.offset.x > 60) go(-1);
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <img
                src={item.src}
                alt={`${title} — ${item.label}`}
                draggable={false}
                className={`max-h-full max-w-full object-contain transition-transform duration-300 ease-out ${
                  item.kind === 'photo' ? 'rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)]' : 'h-[88%] drop-shadow-[0_28px_30px_rgba(0,0,0,0.3)]'
                }`}
                style={{ transform: zoom ? 'scale(2.2)' : 'scale(1)', transformOrigin: origin }}
              />
            </motion.div>
          </AnimatePresence>
          {!zoom && (
            <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-medium text-paper backdrop-blur">
              <ZoomIn className="h-3.5 w-3.5" aria-hidden /> Click to zoom
            </span>
          )}
        </div>

        {items.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper/90 shadow-md backdrop-blur transition hover:scale-105 sm:left-3"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute top-1/2 right-2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper/90 shadow-md backdrop-blur transition hover:scale-105 sm:right-3"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <ul className="mt-4 flex justify-center gap-2 px-4 sm:gap-3" aria-label="Photos">
        {items.map((it, i) => (
          <li key={it.src}>
            <button
              onClick={() => {
                setDir(i > index ? 1 : -1);
                setZoom(false);
                onIndex(i);
              }}
              aria-label={`Show ${it.label}`}
              aria-current={i === index}
              className={`block h-16 w-16 overflow-hidden rounded-xl bg-white/70 ring-2 transition sm:h-[84px] sm:w-[84px] ${
                i === index ? 'ring-ink' : 'ring-transparent hover:ring-white'
              }`}
            >
              <img
                src={it.thumb ?? it.src}
                alt=""
                loading="lazy"
                className={`h-full w-full ${it.kind === 'photo' ? 'object-cover' : 'object-contain p-1.5'}`}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
