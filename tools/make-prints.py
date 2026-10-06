"""Extract transparent print artwork from the tee cutouts for the WebGPU 3D tee.

The 3D engine paints prints onto its own simulated fabric, so it needs the ink
only — not a photo of the shirt. For each cutout this script keys out the
fabric (inside the torso; the engine does not print on sleeves), cleans the
matte, and works out where the print sits on the garment pattern.

Pattern coordinates (metres) follow the engine: origin at the hem centre,
body half-width 0.31, neck ~0.745. A rect is [cx, cy, w, h]; front cx is
+viewer-right, back cx is mirrored.

Usage: python -P tools/make-prints.py   (run from the project root)
"""
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PROD = ROOT / "public" / "products"
PRINTS = ROOT / "public" / "prints"
MANIFEST = json.loads((ROOT / "src" / "data" / "manifest.json").read_text())

BODY_HALF = 0.31
BODY_TOP = 0.725      # average of shoulder (0.705) and neck (0.745)
PRINT_TOP = {"front": 0.62, "back": 0.675}   # the original engine tops the back print at 0.675
PRINT_BOTTOM = 0.075
MAX_W = 0.42          # wider prints wrap round the sides of the body


def smoothstep(a, b, x):
    t = np.clip((x - a) / max(b - a, 1e-6), 0, 1)
    return t * t * (3 - 2 * t)


def robust(v):
    """median and a MAD-based sigma"""
    med = float(np.median(v))
    sig = float(np.median(np.abs(v - med)) * 1.4826) + 1e-3
    return med, sig


def extract(slug, role, chest=False):
    meta = MANIFEST[slug][role]
    im = np.array(Image.open(PROD / slug / f"{role}.webp").convert("RGBA")).astype(np.float32)
    rgb, a = im[..., :3], im[..., 3] / 255.0
    h, w = a.shape
    side = "front" if role == "front" else "back"
    light = role.endswith("white")

    lab = cv2.cvtColor(rgb.astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)
    L = lab[..., 0]
    C = np.hypot(lab[..., 1] - 128, lab[..., 2] - 128)

    cx = w / 2
    T = meta["torso"] * w / 2
    hem = meta["hem"] * h
    Y, X = np.mgrid[0:h, 0:w]
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(w * 0.03) | 1,) * 2)
    interior = cv2.erode((a > 0.9).astype(np.uint8), k).astype(bool)
    collar = (0.13 if side == "front" else 0.06) * h
    body = interior & (np.abs(X - cx) < T * 0.96) & (Y > collar) & (Y < hem - 0.03 * h)
    if side == "front":  # inside-neck brand label shows through the neckline
        body &= ~((np.abs(X - cx) < T * 0.18) & (Y < 0.24 * h))

    # fabric statistics from the lower side panels (rarely printed on)
    probe = body & (np.abs(X - cx) > T * 0.72) & (Y > hem - 0.16 * h)
    Lf, Ls = robust(L[probe])
    Cf, Cs = robust(C[probe])
    if chest:  # small chest logo: search the upper chest only
        body &= (Y > 0.12 * h) & (Y < 0.36 * h) & (np.abs(X - cx) < T * 0.62)

    if light:
        lo = 4.5 * Ls + 6
        ink = np.maximum(smoothstep(lo, lo + 22, Lf - L), smoothstep(Cf + 4 * Cs + 5, Cf + 4 * Cs + 18, C))
    else:
        lo = (2.6 * Ls + 4) if side == "front" else (4.0 * Ls + 8)
        ink = np.maximum(smoothstep(Lf + lo, Lf + lo + 28, L), smoothstep(Cf + 4 * Cs + 5, Cf + 4 * Cs + 18, C))
    ink *= body

    # drop wash speckle. Backs: keep big blobs, blobs near them, and any small mark
    # inked at full strength (fabric wash never gets there). Fronts: keep only the
    # cluster around the largest blob, so stray folds don't widen a chest logo.
    solid = (ink > 0.5).astype(np.uint8)
    n, lbl, stats, _ = cv2.connectedComponentsWithStats(solid, 8)
    if n <= 1:
        return None
    areas = stats[1:, cv2.CC_STAT_AREA]
    big = np.zeros_like(solid)
    if side == "front":
        big[lbl == int(np.argmax(areas)) + 1] = 1
        radius = int(w * 0.24)  # kernel diameter
    else:
        min_big = max(60, int(h * w * 0.0006))
        for i in range(1, n):
            if areas[i - 1] >= min_big:
                big[lbl == i] = 1
        radius = int(w * 0.05)
    near = cv2.dilate(big, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (radius | 1,) * 2))
    keep = np.zeros_like(solid)
    for i in range(1, n):
        if areas[i - 1] < 6:
            continue
        m = lbl == i
        strong = side == "back" and ink[m].max() >= 0.97 and ink[m].mean() >= 0.6
        if near[m].any() or strong:
            keep[m] = 1
    support = cv2.dilate(keep, np.ones((5, 5), np.uint8)).astype(bool)
    alpha = np.where(support, ink, 0.0)
    if alpha.max() < 0.5:
        return None

    # un-mix the fabric from soft edges so ink keeps its true colour
    fab = np.array([int(meta["fabric"][i:i + 2], 16) for i in (1, 3, 5)], np.float32)
    al = np.clip(alpha, 0.25, 1)[..., None]
    colour = np.clip((rgb - (1 - al) * fab) / al, 0, 255)

    ys, xs = np.where(alpha > 0.04)
    pad = 4
    y0, y1 = max(0, ys.min() - pad), min(h, ys.max() + pad + 1)
    x0, x1 = max(0, xs.min() - pad), min(w, xs.max() + pad + 1)
    out = np.dstack([colour, alpha * 255])[y0:y1, x0:x1].astype(np.uint8)
    path = PROD / slug / f"print-{role}.webp"
    Image.fromarray(out, "RGBA").save(path, "WEBP", quality=92, method=6)

    # ---- placement on the pattern
    cols = np.where((a > 0.5)[:, int(cx - 0.45 * T):int(cx + 0.45 * T)].any(axis=1))[0]
    top = float(cols.min())
    s = BODY_HALF / T
    pw, ph = (x1 - x0) * s, (y1 - y0) * s
    pcx = ((x0 + x1) / 2 - cx) * s * (1 if side == "front" else -1)
    pcy = (hem - (y0 + y1) / 2) / (hem - top) * BODY_TOP
    # keep it on the body: shrink if needed, then nudge inside the printable band
    limit_h = PRINT_TOP[side] - PRINT_BOTTOM
    f = min(1.0, limit_h / ph, MAX_W / pw)
    pw, ph = pw * f, ph * f
    pcy = float(np.clip(pcy, PRINT_BOTTOM + ph / 2, PRINT_TOP[side] - ph / 2))
    pcx = float(np.clip(pcx, -BODY_HALF + pw / 2, BODY_HALF - pw / 2))
    rect = [round(pcx, 4), round(pcy, 4), round(pw, 4), round(ph, 4)]
    print(f"{slug:15s} {role:11s} fabric L={Lf:5.1f}±{Ls:4.1f} -> {out.shape[1]}x{out.shape[0]} rect={rect}")
    return {"src": f"products/{slug}/print-{role}.webp", "rect": rect}


def wordmark_variants():
    """The engine's FORAULS chest wordmark, plus a dark-ink version for light tees."""
    wm = Image.open(PRINTS / "forauls-wordmark.webp").convert("RGBA")
    arr = np.array(wm)
    arr[..., :3] = 24
    Image.fromarray(arr, "RGBA").save(PRINTS / "forauls-wordmark-dark.webp", "WEBP", lossless=True)
    aspect = wm.height / wm.width
    fw = 0.105
    return [0.135, 0.545, fw, round(fw * aspect, 4)]


def default_back_rect(path):
    """Same placement rule as the original engine's printRects()."""
    im = Image.open(path)
    aspect = im.height / im.width
    bw, bh = 0.46, 0.46 * aspect
    if bh > 0.6:
        bh, bw = 0.6, 0.6 / aspect
    return [0.0, round(0.675 - bh / 2, 4), round(bw, 4), round(bh, 4)]


JOBS = {
    "red-sun-cranes": ["back"],
    "monte-carlo": ["back"],
    "money-war": ["front:chest", "back"],
    "wander-beyond": ["back"],
    "paper-dreams": ["back"],
    "kraken": ["front", "back"],
    "sunset-rock": ["back", "back-white"],
    "brave-bird": ["back", "back-white"],
}

if __name__ == "__main__":
    wm_rect = wordmark_variants()
    prints = {
        "_wordmark": {
            "light": {"src": "prints/forauls-wordmark.webp", "rect": wm_rect},
            "dark": {"src": "prints/forauls-wordmark-dark.webp", "rect": wm_rect},
        },
        "tiger-lily": {
            "back": {"src": "prints/tiger-lily-back.webp", "rect": default_back_rect(PRINTS / "tiger-lily-back.webp")},
        },
    }
    for slug, roles in JOBS.items():
        prints.setdefault(slug, {})
        for job in roles:
            role, _, opt = job.partition(":")
            r = extract(slug, role, chest=opt == "chest")
            if r:
                prints[slug][role] = r
    (ROOT / "src" / "data" / "prints.json").write_text(json.dumps(prints, indent=2))
    print("wrote src/data/prints.json")
