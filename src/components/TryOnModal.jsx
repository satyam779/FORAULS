import { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, RefreshCw, Upload } from 'lucide-react';
import Modal from './Modal';

/**
 * Client-side try-on preview: the shopper uploads a photo and positions the tee
 * cutout over it. Nothing is uploaded — the image stays in the browser.
 */
export default function TryOnModal({ open, onClose, colorway, product }) {
  const [photo, setPhoto] = useState(null);
  const [side, setSide] = useState(product.cardFace);
  const [scale, setScale] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const areaRef = useRef(null);
  const inputId = useId();
  const scaleId = useId();

  useEffect(() => () => photo && URL.revokeObjectURL(photo), [photo]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    setPhoto(URL.createObjectURL(f));
    setScale(1);
    setResetKey((k) => k + 1);
  };

  const tee = side === 'front' ? colorway.front : colorway.back;

  return (
    <Modal open={open} onClose={onClose} title="Virtual try-on" wide>
      <p className="-mt-2 mb-5 text-muted">
        Upload a photo of yourself, then drag and resize the tee into place. Your photo stays on your device.
      </p>

      {!photo ? (
        <label
          htmlFor={inputId}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-ink/[0.02] text-center transition-colors hover:border-ink/30 hover:bg-ink/[0.04]"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-ink text-paper">
            <Camera className="h-6 w-6" />
          </span>
          <span className="text-lg font-semibold">Upload a photo</span>
          <span className="text-sm text-muted">JPG or PNG · full upper body works best</span>
        </label>
      ) : (
        <div className="space-y-4">
          <div ref={areaRef} className="relative mx-auto aspect-[3/4] max-h-[58svh] overflow-hidden rounded-2xl bg-ink">
            <img src={photo} alt="Your uploaded photo" className="absolute inset-0 h-full w-full object-cover" />
            <motion.img
              key={resetKey}
              src={tee.src}
              alt={`${product.short} ${side}`}
              drag
              dragConstraints={areaRef}
              dragElastic={0.05}
              dragMomentum={false}
              draggable={false}
              className="absolute top-[22%] left-1/2 w-[62%] -translate-x-1/2 cursor-grab touch-none drop-shadow-[0_12px_18px_rgba(0,0,0,0.35)] active:cursor-grabbing"
              style={{ scale }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex rounded-full bg-ink/5 p-1" role="group" aria-label="Tee side">
              {['front', 'back'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  aria-pressed={side === s}
                  className={`h-10 rounded-full px-4 text-sm font-semibold capitalize transition-colors ${
                    side === s ? 'bg-ink text-paper' : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex min-w-48 flex-1 items-center gap-3">
              <label htmlFor={scaleId} className="text-sm font-medium">
                Size
              </label>
              <input
                id={scaleId}
                type="range"
                min={0.4}
                max={1.8}
                step={0.01}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="flex-1 accent-ink"
              />
            </div>
            <button
              onClick={() => {
                setScale(1);
                setResetKey((k) => k + 1);
              }}
              className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold hover:bg-ink/5"
            >
              <RefreshCw className="h-4 w-4" /> Reset
            </button>
            <label
              htmlFor={inputId}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold hover:bg-ink/5"
            >
              <Upload className="h-4 w-4" /> New photo
            </label>
          </div>
        </div>
      )}
      <input id={inputId} type="file" accept="image/*" className="sr-only" onChange={onFile} />
    </Modal>
  );
}
