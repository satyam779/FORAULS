"""Generate link-preview images (Open Graph, 1200x630) and app icons.

  public/og/<slug>.jpg   one per product (WhatsApp / Instagram / X previews)
  public/og/home.jpg     site default
  public/icons/*.png     apple-touch-icon + web-manifest icons

Usage: python -P tools/make-og.py   (from the project root, after make-cutouts)
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / "public"
MANIFEST = json.loads((ROOT / "src" / "data" / "manifest.json").read_text())
W, H = 1200, 630
INK = (9, 9, 11)

# product slug -> (display name, which cutout carries the design)
PRODUCTS = {
    "tiger-lily": ("Tiger Lily", "back"),
    "red-sun-cranes": ("Red Sun Cranes", "back"),
    "monte-carlo": ("Monte Carlo GP", "back"),
    "money-war": ("Money / War", "back"),
    "wander-beyond": ("Wander Beyond", "back"),
    "paper-dreams": ("Paper Dreams", "back"),
    "kraken": ("Kraken", "front"),
    "sunset-rock": ("Sunset Rock", "back"),
    "brave-bird": ("Be Brave", "back"),
}


def font(size, bold=True):
    names = ["impact.ttf", "Anton-Regular.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"] if bold else ["arial.ttf", "DejaVuSans.ttf"]
    for n in names:
        for d in (Path("C:/Windows/Fonts"), Path("/usr/share/fonts/truetype/dejavu"), Path("/Library/Fonts")):
            if (d / n).exists():
                return ImageFont.truetype(str(d / n), size)
    return ImageFont.load_default(size)


def backdrop():
    """The site's studio-grey stage gradient."""
    top, bot = (230, 231, 234), (205, 206, 210)
    im = Image.new("RGB", (W, H))
    px = ImageDraw.Draw(im)
    for y in range(H):
        t = y / (H - 1)
        px.line([(0, y), (W, y)], fill=tuple(round(a + (b - a) * t) for a, b in zip(top, bot)))
    return im


def paste_tee(canvas, path, box_w, box_h, cx, cy):
    """Fit the tee inside box_w x box_h, centred on (cx, cy)."""
    tee = Image.open(path).convert("RGBA")
    s = min(box_w / tee.width, box_h / tee.height)
    tee = tee.resize((round(tee.width * s), round(tee.height * s)), Image.LANCZOS)
    # soft floor shadow
    sh = Image.new("RGBA", (tee.width, 40), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([tee.width * 0.12, 6, tee.width * 0.88, 34], fill=(0, 0, 0, 70))
    canvas.alpha_composite(sh, (cx - sh.width // 2, cy + tee.height // 2 - 14))
    canvas.alpha_composite(tee, (cx - tee.width // 2, cy - tee.height // 2))


def wordmark(canvas, x, y, width):
    wm = Image.open(PUB / "prints" / "forauls-wordmark-dark.webp").convert("RGBA")
    s = width / wm.width
    wm = wm.resize((width, round(wm.height * s)), Image.LANCZOS)
    canvas.alpha_composite(wm, (x, y))


def product_card(slug, name, face):
    c = backdrop().convert("RGBA")
    paste_tee(c, PUB / "products" / slug / f"{face}.webp", 540, 520, 890, 305)
    wordmark(c, 70, 70, 230)
    d = ImageDraw.Draw(c)
    title = name.upper()
    size = 112
    while d.textlength(title, font=font(size)) > 520 and size > 56:
        size -= 4
    d.text((70, 250), title, font=font(size), fill=INK)
    d.text((72, 250 + size + 24), "Oversized heavyweight tee  ·  Spin it in 3D", font=font(28, bold=False), fill=(63, 63, 70))
    return c.convert("RGB")


def home_card():
    c = backdrop().convert("RGBA")
    paste_tee(c, PUB / "products" / "tiger-lily" / "back.webp", 520, 520, 900, 305)
    wordmark(c, 70, 80, 230)
    d = ImageDraw.Draw(c)
    d.text((66, 200), "BEAUTY IS", font=font(118), fill=INK)
    d.text((66, 330), "UNTAMED.", font=font(118), fill=(161, 161, 170))
    d.text((70, 490), "Art-driven oversized tees  ·  Spin every design in 3D", font=font(26, bold=False), fill=(63, 63, 70))
    return c.convert("RGB")


def icon(size, pad=0.0):
    """Black rounded square with the white F from favicon.svg (64-unit grid)."""
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if pad == 0:
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=round(size * 14 / 64), fill=INK + (255,))
    else:  # maskable: full bleed, glyph inside the safe zone
        d.rectangle([0, 0, size, size], fill=INK + (255,))
    k = size / 64 * (1 - pad)
    o = size * pad / 2
    pts = [(20, 16), (46, 16), (46, 24), (29, 24), (29, 31), (43, 31), (43, 39), (29, 39), (29, 52), (20, 52)]
    d.polygon([(o + x * k, o + y * k) for x, y in pts], fill=(250, 250, 250, 255))
    return im


if __name__ == "__main__":
    og = PUB / "og"
    og.mkdir(exist_ok=True)
    for slug, (name, face) in PRODUCTS.items():
        product_card(slug, name, face).save(og / f"{slug}.jpg", "JPEG", quality=84, optimize=True, progressive=True)
    home_card().save(og / "home.jpg", "JPEG", quality=84, optimize=True, progressive=True)

    ic = PUB / "icons"
    ic.mkdir(exist_ok=True)
    icon(180).save(ic / "apple-touch-icon.png")
    icon(192).save(ic / "icon-192.png")
    icon(512).save(ic / "icon-512.png")
    icon(512, pad=0.2).save(ic / "icon-maskable-512.png")
    print(f"wrote {len(PRODUCTS) + 1} share images and 4 icons")
