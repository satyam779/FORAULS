/** Image helpers for the admin: read uploads, resize, crop 3D captures and upload to Supabase Storage. */

export const BUCKET = 'products';

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('That image couldn’t be read.'));
    img.src = src;
  });
}

const toBlob = (canvas, type = 'image/webp', quality = 0.92) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Encoding the image failed.'))), type, quality),
  );

/** Draws `source` (image or canvas) scaled so its longer side is at most `max` px. */
function scaled(source, max) {
  const w = source.naturalWidth || source.width;
  const h = source.naturalHeight || source.height;
  const s = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * s));
  c.height = Math.max(1, Math.round(h * s));
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, c.width, c.height);
  return c;
}

/**
 * A print upload: keeps PNG/WebP as-is when it's already ≤ 2048 px (the 3D
 * engine's texture limit), otherwise scales it down to a WebP with alpha.
 */
export async function preparePrint(file) {
  if (!/^image\/(png|webp)$/.test(file.type)) throw new Error('Use a PNG or WebP with a transparent background.');
  if (file.size > 25 * 1024 * 1024) throw new Error('That file is over 25 MB.');
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (Math.max(w, h) <= 2048 && file.size <= 8 * 1024 * 1024) return { blob: file, url, w, h };
  const c = scaled(img, 2048);
  URL.revokeObjectURL(url);
  const blob = await toBlob(c, 'image/webp', 0.95);
  return { blob, url: URL.createObjectURL(blob), w: c.width, h: c.height };
}

/** A real product photo: ≤ 1600 px WebP plus a 480 px thumbnail. */
export async function preparePhoto(file) {
  if (!file.type.startsWith('image/')) throw new Error('That file isn’t an image.');
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  URL.revokeObjectURL(url);
  const big = scaled(img, 1600);
  const [blob, sm] = await Promise.all([toBlob(big, 'image/webp', 0.86), toBlob(scaled(img, 480), 'image/webp', 0.82)]);
  return { blob, sm, w: big.width, h: big.height, preview: URL.createObjectURL(sm) };
}

/** Crops a transparent 3D capture to the tee (plus a small margin) and encodes it like the shop's cutouts. */
export async function cutoutFromCapture(canvas) {
  const { width: w, height: h } = canvas;
  const data = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    let row = y * w * 4 + 3;
    for (let x = 0; x < w; x++, row += 4) {
      if (data[row] > 10) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error('The 3D capture came out empty — make sure the preview is visible and try again.');
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.02);
  const sx = Math.max(0, x0 - pad);
  const sy = Math.max(0, y0 - pad);
  const crop = document.createElement('canvas');
  crop.width = Math.min(w, x1 + pad + 1) - sx;
  crop.height = Math.min(h, y1 + pad + 1) - sy;
  crop.getContext('2d').drawImage(canvas, sx, sy, crop.width, crop.height, 0, 0, crop.width, crop.height);
  const big = scaled(crop, 1000);
  const small = scaled(crop, 480);
  const [blob, sm] = await Promise.all([toBlob(big, 'image/webp', 0.9), toBlob(small, 'image/webp', 0.86)]);
  return { blob, sm, w: big.width, h: big.height, wSm: small.width };
}

const EXT = { 'image/png': 'png', 'image/webp': 'webp', 'image/jpeg': 'jpg' };

/** Uploads to the public `products` bucket and returns the file's public URL. */
export async function upload(supabase, path, blob) {
  const type = blob.type || 'image/webp';
  const full = `${path}.${EXT[type] ?? 'webp'}`;
  const { error } = await supabase.storage.from(BUCKET).upload(full, blob, { contentType: type, cacheControl: '31536000', upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(full).data.publicUrl;
}
