import { useId, useMemo, useRef } from 'react';
import { AlignCenterHorizontal } from 'lucide-react';

/*
 * Flat-pattern placement editor. Coordinates are the 3D engine's pattern plane
 * (metres, origin at the hem centre, +y up, +x = viewer's right when facing the
 * front), so a rect [cx, cy, w, h] set here is exactly what the engine paints.
 * The back is drawn as seen from behind, i.e. mirrored in x.
 * Keep these numbers in step with PAT in forauls-tiger-tee.html.
 */
const PAT = { W: 0.31, Hs: 0.705, Hn: 0.745, Nw: 0.1, dropF: 0.085, dropB: 0.024, nR: 46, jA: 28, theta: (28 * Math.PI) / 180, Ltop: 0.24, cuffW: 0.21 };
const ARMPIT = (PAT.Hs * PAT.jA) / PAT.nR;
const DIR = [Math.cos(PAT.theta), -Math.sin(PAT.theta)];
const PERP = [Math.sin(PAT.theta), Math.cos(PAT.theta)];
const P2 = [PAT.W + PAT.Ltop * DIR[0], PAT.Hs + PAT.Ltop * DIR[1]];
const Q2 = [P2[0] - PAT.cuffW * PERP[0], P2[1] - PAT.cuffW * PERP[1]];

function topEdge(x, drop) {
  const ax = Math.abs(x);
  if (ax < PAT.Nw) {
    const t = ax / PAT.Nw;
    return PAT.Hn - drop * Math.pow(Math.max(0, 1 - t * t), 0.75);
  }
  return PAT.Hn + ((PAT.Hs - PAT.Hn) * (ax - PAT.Nw)) / (PAT.W - PAT.Nw);
}

const pt = ([x, y]) => `${x.toFixed(4)} ${(-y).toFixed(4)}`;

function outlines(drop) {
  const top = [];
  for (let i = 0; i <= 60; i++) {
    const x = PAT.W - (2 * PAT.W * i) / 60;
    top.push([x, topEdge(x, drop)]);
  }
  const body = [[-PAT.W, 0], [PAT.W, 0], ...top];
  const shirt = [[-PAT.W, 0], [PAT.W, 0], [PAT.W, ARMPIT], Q2, P2, ...top, [-P2[0], P2[1]], [-Q2[0], Q2[1]], [-PAT.W, ARMPIT]];
  const path = (pts) => `M${pts.map(pt).join('L')}Z`;
  return { body: path(body), shirt: path(shirt) };
}

const round = (v) => Math.round(v * 10000) / 10000;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Fits a print of aspect `a` (h/w) into width `w`, capped at height `maxH`; `top` is its top edge. */
function place(a, w, maxH, top, cx = 0) {
  let h = w * a;
  if (h > maxH) {
    h = maxH;
    w = h / a;
  }
  return [cx, top - h / 2, w, h].map(round);
}

export const PRESETS = {
  front: [
    ['Left chest', (a) => place(a, 0.1, 0.1, 0.585, 0.135)],
    ['Centre chest', (a) => place(a, 0.24, 0.24, 0.6)],
    ['Full front', (a) => place(a, 0.42, 0.5, 0.6)],
  ],
  back: [
    ['Neck', (a) => place(a, 0.12, 0.07, 0.675)],
    ['Upper back', (a) => place(a, 0.3, 0.2, 0.66)],
    ['Full back', (a) => place(a, 0.46, 0.6, 0.675)],
  ],
};

/** Where a freshly uploaded print starts: wordmark-shaped art on the chest, everything else centred/full. */
export const defaultRect = (side, aspect) =>
  side === 'front' ? (aspect < 0.35 ? PRESETS.front[0][1](aspect) : PRESETS.front[1][1](aspect)) : PRESETS.back[2][1](aspect);

/**
 * Drag the print to move it, drag the corner handle to resize (aspect locked),
 * or use the arrow keys / +/- when it's focused.
 * print = { src, rect: [cx, cy, w, h] }; onChange(rect).
 */
export default function PrintPlacer({ side, print, fabric, onChange }) {
  const svgRef = useRef(null);
  const drag = useRef(null);
  const clipId = useId();
  const mirror = side === 'back' ? -1 : 1;
  const shapes = useMemo(() => outlines(side === 'front' ? PAT.dropF : PAT.dropB), [side]);
  const [cx, cy, w, h] = print.rect;
  const aspect = h / w;
  const sx = cx * mirror;
  const dark = parseInt(fabric.slice(1, 3), 16) + parseInt(fabric.slice(3, 5), 16) + parseInt(fabric.slice(5, 7), 16) < 300;
  const ink = dark ? 'rgba(255,255,255,0.85)' : 'rgba(9,9,11,0.8)';

  const local = (e) => {
    const p = svgRef.current.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return p.matrixTransform(svgRef.current.getScreenCTM().inverse());
  };

  const set = (ncx, ncy, nw) => {
    const W = clamp(nw, 0.02, 0.62);
    let X = clamp(ncx, -PAT.W, PAT.W);
    if (Math.abs(X) < 0.006) X = 0; // snap to the centre line
    onChange([round(X), round(clamp(ncy, 0, PAT.Hn)), round(W), round(W * aspect)]);
  };

  const start = (mode) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { mode, from: local(e), rect: print.rect };
  };
  const move = (e) => {
    const d = drag.current;
    if (!d) return;
    const p = local(e);
    const [x0, y0, w0] = d.rect;
    if (d.mode === 'move') set(x0 + (p.x - d.from.x) * mirror, y0 - (p.y - d.from.y), w0);
    else set(x0, y0, 2 * Math.max(Math.abs(p.x - x0 * mirror), Math.abs(p.y + y0) / aspect));
  };
  const end = () => {
    drag.current = null;
  };

  const onKey = (e) => {
    const step = e.shiftKey ? 0.02 : 0.005;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[e.key]) set(cx + moves[e.key][0] * mirror, cy + moves[e.key][1], w);
    else if (e.key === '+' || e.key === '=') set(cx, cy, w * 1.05);
    else if (e.key === '-') set(cx, cy, w / 1.05);
    else return;
    e.preventDefault();
  };

  const handle = 0.016;
  return (
    <div>
      <div className="rounded-xl bg-zinc-100 p-2">
        <svg
          ref={svgRef}
          viewBox="-0.58 -0.8 1.16 0.83"
          className="block w-full touch-none select-none"
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          role="img"
          aria-label={`${side === 'front' ? 'Front' : 'Back'} of the tee, flat. The print is ${(w * 100).toFixed(1)} by ${(h * 100).toFixed(1)} cm.`}
        >
          <defs>
            <clipPath id={clipId}>
              <path d={shapes.body} />
            </clipPath>
          </defs>
          <path d={shapes.shirt} fill={fabric} stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="0.01" x2="0" y2="-0.78" stroke={ink} strokeOpacity={sx === 0 ? 0.7 : 0.2} strokeDasharray="4 4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <image href={print.src} x={sx - w / 2} y={-(cy + h / 2)} width={w} height={h} preserveAspectRatio="none" clipPath={`url(#${clipId})`} />
          <g
            tabIndex={0}
            onKeyDown={onKey}
            aria-label="Print — drag to move, arrow keys to nudge, plus and minus to resize"
            className="cursor-move outline-none [&:focus-visible>rect]:stroke-accent"
            onPointerDown={start('move')}
          >
            <rect
              x={sx - w / 2}
              y={-(cy + h / 2)}
              width={w}
              height={h}
              fill="transparent"
              stroke={ink}
              strokeWidth="1.5"
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
            />
          </g>
          <circle
            cx={sx + w / 2}
            cy={-(cy - h / 2)}
            r={handle}
            fill="#2563eb"
            stroke="#fff"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="cursor-nwse-resize"
            onPointerDown={start('resize')}
          />
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {PRESETS[side].map(([label, fn]) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(fn(aspect))}
            className="h-8 rounded-full border border-line bg-white px-3 text-xs font-semibold hover:border-ink/40"
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => set(0, cy, w)}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-xs font-semibold hover:border-ink/40"
        >
          <AlignCenterHorizontal className="h-3.5 w-3.5" aria-hidden /> Centre
        </button>
      </div>
      <label className="mt-3 flex items-center gap-3 text-sm">
        <span className="w-14 shrink-0 font-semibold">Size</span>
        <input type="range" min={2} max={60} step={0.5} value={Math.round(w * 200) / 2} onChange={(e) => set(cx, cy, e.target.value / 100)} className="flex-1 accent-ink" />
        <span className="w-28 shrink-0 text-right text-muted tabular-nums">
          {(w * 100).toFixed(1)} × {(h * 100).toFixed(1)} cm
        </span>
      </label>
    </div>
  );
}
