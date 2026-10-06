"""Cut shirts out of the product photos, build blank fronts, and emit a manifest.

Usage (from the project root): python -P tools/make-cutouts.py <photos_dir> public/products
Edit SOURCES below to map your photo files to product slugs.
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC = Path(sys.argv[1])
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

CUT_MAX = 900     # longest side of cutouts
CUT_SM = 480      # longest side of the small card/thumbnail variant
PHOTO_MAX = 1400  # longest side of photo-view images


def load(name):
    return cv2.imread(str(SRC / name), cv2.IMREAD_COLOR)


def crop(img, box):
    """box as fractions (x0, y0, x1, y1)."""
    h, w = img.shape[:2]
    x0, y0, x1, y1 = box
    return img[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)].copy()


def clean(fg, keep=1):
    lbl, n = ndi.label(fg)
    if n > keep:
        sizes = ndi.sum(fg, lbl, range(1, n + 1))
        ids = np.argsort(sizes)[::-1][:keep] + 1
        fg = np.isin(lbl, ids)
    fg = ndi.binary_fill_holes(fg)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    fg = cv2.morphologyEx(fg.astype(np.uint8), cv2.MORPH_OPEN, k)
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, k)
    fg = cv2.erode(fg, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
    return np.clip(cv2.GaussianBlur(fg.astype(np.float32), (0, 0), 1.1), 0, 1)


def runs(row):
    """Contiguous True runs in a 1-D bool array as (start, end_exclusive)."""
    d = np.diff(np.r_[0, row.astype(np.int8), 0])
    return list(zip(np.where(d == 1)[0], np.where(d == -1)[0]))


def mirror(mask, c):
    h, w = mask.shape
    src = np.round(2 * c - np.arange(w)).astype(int)
    ok = (src >= 0) & (src < w)
    out = np.zeros_like(mask)
    out[:, ok] = mask[:, src[ok]]
    return out


def split_pair(img, light_top=False):
    """Two tees side by side, the right one lying over the left one's sleeve.

    Each tee's outline is rebuilt from its clean outer half (tees are symmetric);
    the left tee's hidden sleeve is filled with mirrored fabric. With light_top
    (white tee over black) the top tee is separated by brightness instead.
    """
    fg = segment(img, keep=2) > 0.5
    h, w = fg.shape
    ys = np.where(fg.any(axis=1))[0]
    y0, y1 = ys.min(), ys.max()
    axes, halves = [], []
    for y in range(int(y0 + 0.72 * (y1 - y0)), int(y0 + 0.92 * (y1 - y0))):
        r = [s for s in runs(fg[y]) if s[1] - s[0] > w * 0.1]
        if len(r) == 2:
            axes.append([(r[0][0] + r[0][1]) / 2, (r[1][0] + r[1][1]) / 2])
            halves.append((r[0][1] - r[0][0]) / 2)
    c1, c2 = np.median(np.array(axes), axis=0)
    torso1 = float(np.median(halves))
    X = np.arange(w)[None, :].repeat(h, axis=0)
    grow = lambda m: cv2.dilate(m.astype(np.uint8), np.ones((11, 11), np.uint8)).astype(bool)

    right_half = fg & (X >= c2)
    if light_top:
        bright = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) > 120
        top = right_half | (fg & bright & (X < c2) & (X > c1))
        top = ndi.binary_opening(top, iterations=2)
        top = cv2.dilate(top.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & fg
    else:
        top = right_half | (fg & grow(mirror(right_half, c2)) & (X < c2))

    # Left tee: keep its own torso pixels (chest logo lives there) but rebuild the
    # whole right sleeve as a mirror of the clean left sleeve.
    left_half = fg & (X <= c1)
    mL = mirror(left_half, c1)
    sleeve = X > c1 + torso1 * 0.86
    torso_r = fg & grow(mL) & (X > c1) & ~sleeve & ~top
    hidden = mL & (X > c1) & (sleeve | top)
    under = left_half | torso_r | hidden
    img_l = img.copy()
    yy, xx = np.where(hidden)
    img_l[yy, xx] = img[yy, np.clip(np.round(2 * c1 - xx).astype(int), 0, w - 1)]
    return (img_l, clean(under)), (img, clean(top))


def segment(img, border=0.015, thresh=22.0, keep=1):
    """GrabCut seeded from distance-to-border-colour. Returns float alpha 0..1."""
    h, w = img.shape[:2]
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    b = max(4, int(min(h, w) * border))
    frame = np.concatenate([lab[:b].reshape(-1, 3), lab[-b:].reshape(-1, 3),
                            lab[:, :b].reshape(-1, 3), lab[:, -b:].reshape(-1, 3)])
    bg = np.median(frame, axis=0)
    dist = np.linalg.norm(lab - bg, axis=2)

    mask = np.where(dist > thresh, cv2.GC_PR_FGD, cv2.GC_PR_BGD).astype(np.uint8)
    mask[dist > thresh * 2.2] = cv2.GC_PR_FGD
    mask[:b, :] = cv2.GC_BGD
    mask[-b:, :] = cv2.GC_BGD
    mask[:, :b] = cv2.GC_BGD
    mask[:, -b:] = cv2.GC_BGD

    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    fg = np.isin(mask, (cv2.GC_FGD, cv2.GC_PR_FGD))
    return clean(fg, keep)


def trim(img, alpha, pad_y=0.01):
    """Crop tight to the tee. No side padding: the 3D view maps the sleeve tips
    onto the image's left/right edges."""
    ys, xs = np.where(alpha > 0.03)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    p = int((y1 - y0) * pad_y)
    h = alpha.shape[0]
    y0, y1 = max(0, y0 - p), min(h, y1 + p)
    return img[y0:y1, x0:x1], alpha[y0:y1, x0:x1]


def to_rgba(img, alpha):
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    a = (alpha * 255).astype(np.uint8)
    return Image.fromarray(np.dstack([rgb, a]), "RGBA")


def fit(im, longest):
    w, h = im.size
    s = longest / max(w, h)
    if s < 1:
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    return im


def shape_meta(alpha, img):
    """Torso half-width, armpit & hem (fractions of the image) and side fabric colour.

    Scans rows for the run that contains the centre line: above the armpit it spans
    sleeve to sleeve, below it only the torso.
    """
    h, w = alpha.shape
    solid = alpha > 0.5
    cx = w / 2
    half_w = np.full(h, np.nan)
    for y in range(h):
        for s, e in runs(solid[y]):
            if s <= cx < e:
                half_w[y] = min(cx - s, e - cx)
                break
    rows = np.where(~np.isnan(half_w))[0]
    span = np.nanmax(half_w)
    widest = int(np.nanargmax(half_w))
    below = rows[(half_w[rows] < 0.86 * span) & (rows > widest)]
    armpit = float(below.min()) if len(below) else 0.45 * h
    hem = float(rows.max())
    band = half_w[int(armpit + 0.08 * (hem - armpit)):int(hem - 0.06 * (hem - armpit))]
    half = float(np.nanpercentile(band, 20)) if np.isfinite(band).any() else 0.62 * w / 2
    # fabric colour sampled near the side seams, lower torso
    xs = np.r_[int(cx - half * 0.93):int(cx - half * 0.80), int(cx + half * 0.80):int(cx + half * 0.93)]
    ys = slice(int(0.70 * h), int(0.86 * h))
    patch = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)[ys][:, xs].reshape(-1, 3)
    pa = solid[ys][:, xs].reshape(-1)
    fabric = np.median(patch[pa], axis=0) if pa.any() else np.array([20, 20, 22])
    return {
        "torso": round(half / (w / 2), 4),
        "armpit": round(armpit / h, 4),
        "hem": round(hem / h, 4),
        "fabric": "#%02x%02x%02x" % tuple(int(c) for c in fabric),
    }


def save_cut(img, alpha, path):
    img, alpha = trim(img, alpha)
    meta = shape_meta(alpha, img)
    im = fit(to_rgba(img, alpha), CUT_MAX)
    im.save(path, "WEBP", quality=88, method=6)
    fit(im, CUT_SM).save(path.with_name(path.stem + "-sm.webp"), "WEBP", quality=84, method=6)  # cards/thumbnails
    meta.update({"w": im.size[0], "h": im.size[1]})
    return img, alpha, meta


def save_photo(img, path):
    im = fit(Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)), PHOTO_MAX)
    im.save(path, "WEBP", quality=84, method=6)
    fit(im, CUT_SM).save(path.with_name(path.stem + "-sm.webp"), "WEBP", quality=80, method=6)  # thumbnails
    return {"w": im.size[0], "h": im.size[1]}


def remove_logo(img, alpha, region, delta):
    """Inpaint a small chest logo: pixels brighter than local fabric inside region."""
    h, w = alpha.shape
    x0, y0, x1, y1 = (int(region[0] * w), int(region[1] * h), int(region[2] * w), int(region[3] * h))
    lum = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.int16)
    base = cv2.medianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 41).astype(np.int16)
    m = np.zeros((h, w), np.uint8)
    roi = (lum - base)[y0:y1, x0:x1] > delta
    m[y0:y1, x0:x1] = roi.astype(np.uint8) * 255
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    return cv2.inpaint(img, m, 7, cv2.INPAINT_TELEA)


def recolor_white(img, alpha, fabric_rgb):
    """Turn a black tee photo into an off-white tee while keeping its folds."""
    lum = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    inside = alpha > 0.9
    lo, hi = np.percentile(lum[inside], [3, 97])
    t = np.clip((lum - lo) / max(hi - lo, 1), 0, 1)
    shade = 0.80 + 0.22 * t
    rgb = np.clip(np.array(fabric_rgb, np.float32)[None, None, :] * shade[..., None], 0, 255)
    return cv2.cvtColor(rgb.astype(np.uint8), cv2.COLOR_RGB2BGR)


FULL = (0, 0, 1, 1)

# slug -> list of (kind, source, arg)
#   cut:   one tee in `box`, saved as role arg[1]
#   pair:  two tees side by side, saved as roles arg (left, right)
#   photo: kept as a photo only
SOURCES = {
    "tiger-lily": [("pair", "2.jpg", ("front", "back"))],
    "red-sun-cranes": [("cut", "3.jpg", (FULL, "back"))],
    "monte-carlo": [("cut", "4.jpg", ((0, 0, 0.497, 0.497), "back")),
                    ("photo", "4.jpg", (0.503, 0, 1, 0.497)),
                    ("photo", "4.jpg", (0, 0.503, 0.497, 1)),
                    ("photo", "4.jpg", (0.503, 0.503, 1, 1))],
    "money-war": [("pair", "5.jpg", ("front", "back"))],
    "wander-beyond": [("cut", "6.jpg", (FULL, "back"))],
    "paper-dreams": [("cut", "7.jpg", (FULL, "back"))],
    "kraken": [("cut", "8.jpg", ((0, 0, 1, 0.5), "front")),
               ("cut", "8.jpg", ((0, 0.5, 1, 1), "back")),
               ("photo", "8.jpg", FULL)],
    "sunset-rock": [("pair", "9.jpg", ("back", "back-white"))],
    "brave-bird": [("pair", "10.jpg", ("back", "back-white"))],
}

manifest = {}
cache = {}


def mirror_lower_right(img, alpha, torso):
    """Replace the lower right sleeve/side with a mirror of the clean left one.

    The tee underneath in a side-by-side photo has its right cuff folded under
    the other tee; that fold shows up as a lighter triangle. The region starts
    below the chest so a chest logo is never touched; edges are feathered.
    """
    h, w = alpha.shape
    cx = w / 2
    x0 = cx + torso * cx * 0.62
    y0 = 0.33 * h
    X = np.arange(w)[None, :].astype(np.float32)
    Y = np.arange(h)[:, None].astype(np.float32)
    feather = max(6.0, w * 0.02)
    wgt = np.clip((X - x0) / feather, 0, 1) * np.clip((Y - y0) / feather, 0, 1)
    src = np.clip(np.round(2 * cx - 1 - np.arange(w)).astype(int), 0, w - 1)
    m_img, m_a = img[:, src], alpha[:, src]
    img = (img * (1 - wgt[..., None]) + m_img * wgt[..., None]).astype(np.uint8)
    alpha = alpha * (1 - wgt) + m_a * wgt
    return img, alpha


def add_cut(slug, role, img, alpha, entry, fix_cuff=False):
    if fix_cuff:
        img, alpha = trim(img, alpha)
        img, alpha = mirror_lower_right(img, alpha, shape_meta(alpha, img)["torso"])
    img_t, a_t, cmeta = save_cut(img, alpha, OUT / slug / f"{role}.webp")
    cache[(slug, role)] = (img_t, a_t, cmeta)
    entry[role] = {"src": f"{slug}/{role}.webp", **cmeta}
    print(f"{slug:15s} {role:11s} {cmeta}")


for slug, items in SOURCES.items():
    (OUT / slug).mkdir(exist_ok=True)
    entry = {"photos": []}
    for kind, src, arg in items:
        whole = load(src)
        if kind == "pair":
            (il, al), (ir, ar) = split_pair(whole, light_top=arg[1] == "back-white")
            add_cut(slug, arg[0], il, al, entry, fix_cuff=arg[0] == "front")
            add_cut(slug, arg[1], ir, ar, entry)
            box = FULL
        elif kind == "cut":
            box, role = arg
            part = crop(whole, box)
            add_cut(slug, role, part, segment(part), entry)
            if slug == "kraken":
                continue  # the full photo is added on its own below
        else:
            box = arg
        name = f"photo-{len(entry['photos']) + 1}.webp"
        meta = save_photo(crop(whole, box), OUT / slug / name)
        entry["photos"].append({"src": f"{slug}/{name}", **meta})
    manifest[slug] = entry

# ---- blank fronts for back-only designs -------------------------------------
gen = OUT / "_shared"
gen.mkdir(exist_ok=True)

img, a, _ = cache[("tiger-lily", "front")]
blank_black = remove_logo(img, a, (0.5, 0.12, 0.85, 0.40), 40)
_, _, m = save_cut(blank_black, a, gen / "front-black.webp")
manifest["_shared"] = {"front-black": {"src": "_shared/front-black.webp", **m}}

img, a, _ = cache[("money-war", "front")]
blank_washed = remove_logo(img, a, (0.5, 0.10, 0.85, 0.40), 14)
_, _, m = save_cut(blank_washed, a, gen / "front-washed.webp")
manifest["_shared"]["front-washed"] = {"src": "_shared/front-washed.webp", **m}

wb = cache[("sunset-rock", "back-white")][2]["fabric"]
white_rgb = [int(wb[i:i + 2], 16) for i in (1, 3, 5)]
img, a, _ = cache[("tiger-lily", "front")]
white = recolor_white(blank_black, a, white_rgb)
_, _, m = save_cut(white, a, gen / "front-white.webp")
manifest["_shared"]["front-white"] = {"src": "_shared/front-white.webp", **m}

MANIFEST = Path(__file__).resolve().parents[1] / "src" / "data" / "manifest.json"
MANIFEST.write_text(json.dumps(manifest, indent=2))
print("wrote", MANIFEST)
