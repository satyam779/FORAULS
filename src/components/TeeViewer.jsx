import { useEffect, useRef, useState } from 'react';

export const hasWebGPU = typeof navigator !== 'undefined' && !!navigator.gpu;

/**
 * React host for the WebGPU cloth-simulated tee (src/tee3d/engine.js, generated
 * from forauls-tiger-tee.html). One canvas, one simulated shirt; the colourway's
 * prints and fabric tone are painted onto it.
 *
 * `rotation` (optional MotionValue) receives the turntable angle in degrees.
 * `apiRef` exposes the engine API (setYaw, zoom, setWind, shake, …).
 */
export default function TeeViewer({
  colorway,
  mode = 'mannequin',
  autoSpin = 0,
  initialAngle = 0,
  framing,
  rotation,
  apiRef,
  paused = false,
  onStatus,
  onInteract,
  poster,
  label = '3D T-shirt',
  className = 'relative h-full w-full',
}) {
  const canvasRef = useRef(null);
  const api = useRef(null);
  const applied = useRef({ colorway: null, mode: null });
  const [status, setStatus] = useState(hasWebGPU ? 'loading' : 'unsupported');

  const latest = useRef(null);
  latest.current = { colorway, mode, autoSpin, initialAngle, framing, rotation, onStatus, onInteract };

  // mount / unmount the engine (StrictMode-safe: a cancelled init destroys itself)
  useEffect(() => {
    if (!hasWebGPU) {
      latest.current.onStatus?.('unsupported');
      return;
    }
    let cancelled = false;
    let instance = null;
    (async () => {
      try {
        const { createTeeViewer } = await import('../tee3d/engine.js');
        if (cancelled) return;
        const L = latest.current;
        instance = await createTeeViewer(canvasRef.current, {
          front: L.colorway.prints.front,
          back: L.colorway.prints.back,
          colour: L.colorway.tone,
          mode: L.mode,
          autoSpin: L.autoSpin,
          yaw: (-L.initialAngle * Math.PI) / 180,
          framing: L.framing,
          onYaw: (rad) => latest.current.rotation?.set((-rad * 180) / Math.PI),
          onInteract: () => latest.current.onInteract?.(),
          onError: () => {
            setStatus('error');
            latest.current.onStatus?.('error');
          },
        });
        if (cancelled) {
          instance.destroy();
          return;
        }
        applied.current = { colorway: L.colorway, mode: L.mode };
        api.current = instance;
        if (apiRef) apiRef.current = instance;
        setStatus('ready');
        latest.current.onStatus?.('ready');
      } catch (err) {
        if (cancelled) return;
        console.warn('[3D tee]', err);
        setStatus('error');
        latest.current.onStatus?.('error');
      }
    })();
    return () => {
      cancelled = true;
      instance?.destroy();
      api.current = null;
      if (apiRef) apiRef.current = null;
    };
    // the engine is created once; prop changes are pushed in below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // colourway: swap fabric tone + prints on the same simulated shirt
  useEffect(() => {
    if (status !== 'ready' || applied.current.colorway === colorway) return;
    applied.current.colorway = colorway;
    api.current.setColour(colorway.tone);
    api.current.setPrints(colorway.prints);
  }, [colorway, status]);

  useEffect(() => {
    if (status !== 'ready' || applied.current.mode === mode) return;
    applied.current.mode = mode;
    api.current.setMode(mode);
  }, [mode, status]);

  useEffect(() => {
    if (status === 'ready') api.current.setAutoSpin(autoSpin);
  }, [autoSpin, status]);

  // only simulate while on screen and not paused by the host
  const onScreen = useRef(true);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  useEffect(() => {
    if (status !== 'ready') return;
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen.current = e.isIntersecting;
        api.current?.setActive(e.isIntersecting && !pausedRef.current);
      },
      { threshold: 0.01 },
    );
    io.observe(canvasRef.current);
    return () => io.disconnect();
  }, [status]);
  useEffect(() => {
    if (status === 'ready') api.current.setActive(onScreen.current && !paused);
  }, [paused, status]);

  const onKeyDown = (e) => {
    const a = api.current;
    if (!a) return;
    const step = (e.shiftKey ? 90 : 30) * (Math.PI / 180);
    if (e.key === 'ArrowLeft') a.setYaw(a.getYaw() + step);
    else if (e.key === 'ArrowRight') a.setYaw(a.getYaw() - step);
    else if (e.key === '+' || e.key === '=') a.zoom(0.85);
    else if (e.key === '-') a.zoom(1 / 0.85);
    else return;
    e.preventDefault();
    latest.current.onInteract?.();
  };

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={`${label}. Drag the background to rotate, drag the shirt to pull the fabric, or use the arrow keys.`}
        className={`tee-canvas absolute inset-0 h-full w-full transition-opacity duration-700 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent ${
          status === 'ready' ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {status !== 'ready' && poster && (
        <img
          src={poster}
          alt=""
          aria-hidden
          className={`animate-float pointer-events-none absolute inset-0 m-auto h-[62%] w-[62%] object-contain drop-shadow-[0_24px_28px_rgba(0,0,0,0.3)] ${
            status === 'loading' ? 'opacity-60 blur-[1px]' : ''
          }`}
        />
      )}
      {status === 'loading' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[38%] flex justify-center" role="status">
          <span className="inline-flex items-center gap-2 rounded-full bg-paper/85 px-3.5 py-1.5 text-sm font-medium text-ink-2 shadow-sm backdrop-blur">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/20 border-t-ink" aria-hidden />
            Loading 3D…
          </span>
        </div>
      )}
    </div>
  );
}
