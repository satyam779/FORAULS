import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Plus, Trash2, Upload, X } from 'lucide-react';
import { TONES, slugify } from '../../data/catalog';
import { useCatalog } from '../../lib/catalog';
import TeeViewer, { hasWebGPU } from '../../components/TeeViewer';
import PrintPlacer, { defaultRect } from './PrintPlacer';
import { cutoutFromCapture, preparePhoto, preparePrint, upload } from './images';
import { Button, Card, Field, useSupabase } from './ui';

const SIDES = ['front', 'back'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let keySeq = 0;
const newKey = () => `c${++keySeq}`;

const EMPTY = { name: '', short: '', slug: '', price: '', mrp: '', collection: 'New', badge: '', blurb: '', fit: '', cardFace: 'back', active: true };

const newColour = (tone = TONES[0]) => ({
  key: newKey(),
  id: '',
  name: tone.label.replace(/ \(.*\)$/, ''),
  hex: tone.hex,
  tone: tone.id,
  prints: { front: null, back: null },
  front: null,
  back: null,
  dirty: true,
});

/** Editor state from a `products` row. */
function fromDb(row) {
  return {
    details: {
      name: row.name,
      short: row.short,
      slug: row.slug,
      price: String(row.price),
      mrp: row.mrp ? String(row.mrp) : '',
      collection: row.collection,
      badge: row.badge ?? '',
      blurb: row.blurb ?? '',
      fit: row.fit ?? '',
      cardFace: row.card_face,
      active: row.active,
    },
    colours: row.colors.map((c) => ({ ...c, key: newKey(), prints: { front: c.prints?.front ?? null, back: c.prints?.back ?? null }, dirty: false })),
    photos: row.photos.map((p) => ({ ...p, key: newKey() })),
  };
}

/** /admin/products/new and /admin/products/:slug */
export default function ProductEditor() {
  const { slug: editing } = useParams();
  const supabase = useSupabase();
  const { reload } = useCatalog();
  const navigate = useNavigate();
  const apiRef = useRef(null);
  const isNew = !editing;

  const [loaded, setLoaded] = useState(isNew);
  const [details, setDetails] = useState(EMPTY);
  const [colours, setColours] = useState(() => [newColour()]);
  const [photos, setPhotos] = useState([]);
  const [existing, setExisting] = useState({ slugs: [], collections: [], minSort: 100 });
  const [sel, setSel] = useState(null);
  const [side, setSide] = useState('back');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState('');
  const [failure, setFailure] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase
      .from('products')
      .select('slug,collection,sort')
      .then(({ data }) => {
        if (!alive || !data) return;
        setExisting({
          slugs: data.map((r) => r.slug),
          collections: [...new Set(data.map((r) => r.collection))],
          minSort: Math.min(100, ...data.map((r) => r.sort)),
        });
      });
    if (editing) {
      supabase
        .from('products')
        .select('*')
        .eq('slug', editing)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!alive) return;
          if (error || !data) return setFailure(error?.message ?? `No product called “${editing}”.`);
          const s = fromDb(data);
          setDetails(s.details);
          setColours(s.colours.length ? s.colours : [newColour()]);
          setPhotos(s.photos);
          setSide(s.details.cardFace);
          setLoaded(true);
        });
    }
    return () => {
      alive = false;
    };
  }, [supabase, editing]);

  useEffect(() => {
    if (!touched) return;
    const warn = (e) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [touched]);

  const colour = colours.find((c) => c.key === sel) ?? colours[0];

  // what the 3D preview shows: the selected colourway, prints at their current placement
  const preview = useMemo(
    () => ({ id: colour.key, tone: colour.tone, prints: colour.prints }),
    [colour.key, colour.tone, colour.prints],
  );

  const setField = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setTouched(true);
    setErrors(({ [k]: _, ...rest }) => rest);
    setDetails((d) => {
      const next = { ...d, [k]: v };
      // new products: the URL follows the short name until it's edited by hand
      if (isNew && (k === 'name' || k === 'short') && d.slug === slugify(d.short || d.name)) next.slug = slugify(next.short || next.name);
      return next;
    });
  };

  const updateColour = (patch, look = false) => {
    setTouched(true);
    setColours((list) => list.map((c) => (c.key === colour.key ? { ...c, ...patch, dirty: c.dirty || look } : c)));
  };
  const setPrint = (s, print) => updateColour({ prints: { ...colour.prints, [s]: print } }, true);

  const turn = (s) => {
    setSide(s);
    const a = apiRef.current;
    if (!a) return;
    const target = s === 'front' ? 0 : Math.PI;
    a.setYaw(target + 2 * Math.PI * Math.round((a.getYaw() - target) / (2 * Math.PI)));
  };

  const onPrintFile = async (s, file) => {
    if (!file) return;
    setErrors(({ prints: _, ...rest }) => rest);
    try {
      const { blob, url, w, h } = await preparePrint(file);
      const keepRect = colour.prints[s] && Math.abs(colour.prints[s].rect[3] / colour.prints[s].rect[2] - h / w) < 0.02;
      setPrint(s, { src: url, blob, rect: keepRect ? colour.prints[s].rect : defaultRect(s, h / w) });
      turn(s);
    } catch (e) {
      setErrors((x) => ({ ...x, prints: e.message }));
    }
  };

  const onPhotos = async (files) => {
    setTouched(true);
    for (const f of files) {
      try {
        const p = await preparePhoto(f);
        setPhotos((list) => [...list, { ...p, key: newKey() }]);
      } catch (e) {
        setErrors((x) => ({ ...x, photos: e.message }));
      }
    }
  };

  function validate() {
    const e = {};
    const d = details;
    if (d.name.trim().length < 2) e.name = 'Give the product a name.';
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.slug)) e.slug = 'Lowercase letters, numbers and dashes only.';
    else if (isNew && existing.slugs.includes(d.slug)) e.slug = 'Another product already uses this URL.';
    const price = Number(d.price);
    if (!Number.isInteger(price) || price <= 0) e.price = 'Whole rupees, more than 0.';
    if (d.mrp !== '' && (!Number.isInteger(Number(d.mrp)) || Number(d.mrp) < price)) e.mrp = 'Leave empty, or at least the price.';
    if (!d.collection.trim()) e.collection = 'Pick or type a collection.';
    const bare = colours.find((c) => !c.prints.front && !c.prints.back);
    if (bare) e.prints = `Upload at least one print for “${bare.name || 'this colour'}”.`;
    if (colours.some((c) => !c.name.trim())) e.colourName = 'Every colour needs a name.';
    return e;
  }

  async function save() {
    const found = validate();
    setErrors(found);
    setFailure('');
    if (Object.keys(found).length) {
      if (found.prints || found.colourName) {
        const bad = colours.find((c) => !c.name.trim() || (!c.prints.front && !c.prints.back));
        if (bad) setSel(bad.key);
      }
      return;
    }
    const d = details;
    const slug = isNew ? d.slug : editing;
    const stamp = Date.now().toString(36);
    const api = apiRef.current;
    try {
      // 1 — artwork
      setSaving('Uploading artwork…');
      const used = new Set();
      const out = [];
      for (const c of colours) {
        let id = c.id || slugify(c.name) || 'colour';
        if (!c.id) for (let n = 2; used.has(id) || colours.some((o) => o !== c && o.id === id); n++) id = `${slugify(c.name) || 'colour'}-${n}`;
        used.add(id);
        const prints = {};
        for (const s of SIDES) {
          const p = c.prints[s];
          prints[s] = p ? { src: p.blob ? await upload(supabase, `${slug}/${id}/print-${s}-${stamp}`, p.blob) : p.src, rect: p.rect } : null;
        }
        out.push({ ...c, id, prints, local: c.prints });
      }

      // 2 — product images, rendered from the 3D preview for every colourway whose look changed
      const needShots = out.filter((c) => c.dirty || !c.front || !c.back);
      if (needShots.length) {
        if (!api) throw new Error('Product images are made from the 3D preview, which isn’t running. Open the admin in Chrome or Edge and try again.');
        setSaving('Settling the fabric…');
        api.setActive(true); // keep simulating even if the preview is scrolled out of view
        api.setAutoSpin(0);
        api.setWind(false);
        api.setMode('mannequin');
        await sleep(2600);
        for (const c of needShots) {
          setSaving(`Creating product images — ${c.name}…`);
          api.setColour(c.tone);
          await api.setPrints(c.local);
          await sleep(500);
          for (const [face, yaw] of [
            ['front', 0],
            ['back', Math.PI],
          ]) {
            const shot = await cutoutFromCapture(await api.capture({ yaw }));
            const base = `${slug}/${c.id}/${face}-${stamp}`;
            const [src, srcSm] = await Promise.all([upload(supabase, base, shot.blob), upload(supabase, `${base}-sm`, shot.sm)]);
            c[face] = { src, srcSm, w: shot.w, h: shot.h, wSm: shot.wSm };
          }
        }
      }

      // 3 — photos
      setSaving('Uploading photos…');
      const photoRows = [];
      for (const [i, p] of photos.entries()) {
        if (!p.blob) {
          photoRows.push({ src: p.src, srcSm: p.srcSm, w: p.w, h: p.h });
          continue;
        }
        const base = `${slug}/photo-${stamp}-${i}`;
        const [src, srcSm] = await Promise.all([upload(supabase, base, p.blob), upload(supabase, `${base}-sm`, p.sm)]);
        photoRows.push({ src, srcSm, w: p.w, h: p.h });
      }

      // 4 — the row
      setSaving('Saving…');
      const first = out[0];
      const cardFace = first.prints[d.cardFace] || !first.prints[d.cardFace === 'front' ? 'back' : 'front'] ? d.cardFace : d.cardFace === 'front' ? 'back' : 'front';
      const row = {
        slug,
        name: d.name.trim(),
        short: d.short.trim() || d.name.trim(),
        price: Number(d.price),
        mrp: d.mrp === '' ? null : Number(d.mrp),
        collection: d.collection.trim(),
        badge: d.badge.trim() || null,
        blurb: d.blurb.trim(),
        fit: d.fit.trim() || null,
        card_face: cardFace,
        active: d.active,
        colors: out.map((c) => ({ id: c.id, name: c.name.trim(), hex: c.hex, tone: c.tone, front: c.front, back: c.back, prints: c.prints })),
        photos: photoRows,
      };
      const { error } = isNew
        ? await supabase.from('products').insert({ ...row, sort: existing.minSort - 10 })
        : await supabase.from('products').update(row).eq('slug', slug);
      if (error) throw new Error(error.code === '23505' ? 'Another product already uses this URL.' : error.message);

      reload();
      setTouched(false);
      navigate('/admin/products', { state: { saved: row.short, hidden: !row.active } });
    } catch (e) {
      console.error(e);
      setFailure(e.message || String(e));
      setSaving('');
      // put the preview back on the colourway being edited
      if (api) {
        api.setColour(preview.tone);
        api.setPrints(preview.prints);
      }
    }
  }

  if (!loaded) {
    return failure ? (
      <Card>
        <p className="text-danger">{failure}</p>
        <Link to="/admin/products" className="mt-3 inline-block text-sm font-semibold underline">
          Back to products
        </Link>
      </Card>
    ) : (
      <p className="py-12 text-center text-muted">Loading product…</p>
    );
  }

  const print = colour.prints[side];
  const busy = Boolean(saving);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/admin/products" className="-ml-2 grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5" aria-label="Back to products">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-2xl font-extrabold tracking-tight">{isNew ? 'New product' : `Edit ${details.short || details.name}`}</h1>
        <Button onClick={save} busy={busy} className="px-6">
          {busy ? 'Saving' : 'Save product'}
        </Button>
      </div>
      {(saving || failure) && (
        <p role={failure ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm font-medium ${failure ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`}>
          {failure || saving}
        </p>
      )}

      <fieldset disabled={busy} className="grid items-start gap-5 lg:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <Card title="Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name" error={errors.name} className="sm:col-span-2">
                <input value={details.name} onChange={setField('name')} placeholder="Tiger Lily Oversized T-Shirt" maxLength={120} />
              </Field>
              <Field label="Short name" hint="Used on cards and in the cart">
                <input value={details.short} onChange={setField('short')} placeholder="Tiger Lily" maxLength={60} />
              </Field>
              <Field label="URL" hint={`/product/${details.slug || '…'}`} error={errors.slug}>
                <input value={details.slug} onChange={setField('slug')} disabled={!isNew} maxLength={80} />
              </Field>
              <Field label="Price (₹)" error={errors.price}>
                <input value={details.price} onChange={setField('price')} inputMode="numeric" placeholder="899" />
              </Field>
              <Field label="MRP (₹, optional)" hint="Shown struck through with the % off" error={errors.mrp}>
                <input value={details.mrp} onChange={setField('mrp')} inputMode="numeric" placeholder="1299" />
              </Field>
              <Field label="Collection" error={errors.collection}>
                <input value={details.collection} onChange={setField('collection')} list="collections" maxLength={40} />
              </Field>
              <datalist id="collections">
                {existing.collections.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <Field label="Badge (optional)" hint="e.g. New, Bestseller, Limited">
                <input value={details.badge} onChange={setField('badge')} maxLength={20} />
              </Field>
              <Field label="Fit (optional)" hint="Replaces “Oversized Fit” in the features">
                <input value={details.fit} onChange={setField('fit')} placeholder="Boxy Cropped Fit" maxLength={40} />
              </Field>
              <Field label="Card shows">
                <select value={details.cardFace} onChange={setField('cardFace')}>
                  <option value="back">Back of the tee</option>
                  <option value="front">Front of the tee</option>
                </select>
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea value={details.blurb} onChange={setField('blurb')} rows={3} maxLength={600} />
              </Field>
              <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
                <input type="checkbox" checked={details.active} onChange={setField('active')} className="h-4 w-4 accent-ink" />
                Visible in the shop
              </label>
            </div>
          </Card>

          <Card title="Colours & artwork">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Colourways">
              {colours.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSel(c.key)}
                  aria-pressed={c.key === colour.key}
                  className={`inline-flex h-9 items-center gap-2 rounded-full border-2 pr-3 pl-1.5 text-sm font-semibold ${
                    c.key === colour.key ? 'border-ink' : 'border-line hover:border-ink/40'
                  }`}
                >
                  <span className="h-6 w-6 rounded-full ring-1 ring-ink/15" style={{ background: c.hex }} />
                  {c.name || 'Untitled'}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const c = newColour(TONES.find((t) => !colours.some((x) => x.tone === t.id)) ?? TONES[0]);
                  // start the new colourway with the same artwork and placement
                  c.prints = colour.prints;
                  setColours((l) => [...l, c]);
                  setSel(c.key);
                  setTouched(true);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-dashed border-line px-3 text-sm font-semibold text-muted hover:border-ink/40 hover:text-ink"
              >
                <Plus className="h-4 w-4" aria-hidden /> Add colour
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
              <Field label="Colour name" error={errors.colourName && !colour.name.trim() ? errors.colourName : undefined}>
                <input value={colour.name} onChange={(e) => updateColour({ name: e.target.value })} maxLength={30} />
              </Field>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Swatch</span>
                <input
                  type="color"
                  value={colour.hex}
                  onChange={(e) => updateColour({ hex: e.target.value })}
                  className="h-10 w-16 cursor-pointer rounded-xl border border-line bg-white p-1"
                />
              </label>
              <Field label="Fabric in 3D">
                <select
                  value={colour.tone}
                  onChange={(e) => {
                    const t = TONES.find((x) => x.id === e.target.value);
                    updateColour({ tone: t.id, ...(colour.hex === TONES.find((x) => x.id === colour.tone)?.hex && { hex: t.hex }) }, true);
                  }}
                >
                  {TONES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-5 flex items-center gap-1 rounded-full bg-ink/5 p-1" role="tablist" aria-label="Side">
              {SIDES.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={side === s}
                  onClick={() => turn(s)}
                  className={`h-9 flex-1 rounded-full text-sm font-semibold capitalize ${side === s ? 'bg-white shadow-sm' : 'text-ink-2'}`}
                >
                  {s} {colour.prints[s] ? '' : <span className="font-normal text-muted">· empty</span>}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {print ? (
                <>
                  <PrintPlacer side={side} print={print} fabric={colour.hex} onChange={(rect) => setPrint(side, { ...print, rect })} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <FileButton accept="image/png,image/webp" onFile={(f) => onPrintFile(side, f)}>
                      <Upload className="h-4 w-4" aria-hidden /> Replace image
                    </FileButton>
                    <Button variant="danger" onClick={() => setPrint(side, null)}>
                      <Trash2 className="h-4 w-4" aria-hidden /> Remove {side} print
                    </Button>
                  </div>
                </>
              ) : (
                <DropZone onFile={(f) => onPrintFile(side, f)}>
                  <ImagePlus className="h-8 w-8 text-muted" aria-hidden />
                  <span className="font-semibold">Upload {side} artwork</span>
                  <span className="text-sm text-muted">PNG or WebP with a transparent background · then drag it into place</span>
                </DropZone>
              )}
              {errors.prints && <p className="mt-2 text-sm font-medium text-danger">{errors.prints}</p>}
            </div>

            {colours.length > 1 && (
              <Button
                variant="ghost"
                className="mt-4 text-danger"
                onClick={() => {
                  setColours((l) => l.filter((c) => c.key !== colour.key));
                  setSel(null);
                  setTouched(true);
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden /> Delete the “{colour.name}” colourway
              </Button>
            )}
          </Card>

          <Card
            title="Photos (optional)"
            actions={
              <FileButton accept="image/*" multiple onFile={onPhotos} variant="secondary">
                <ImagePlus className="h-4 w-4" aria-hidden /> Add photos
              </FileButton>
            }
          >
            <p className="-mt-2 mb-3 text-sm text-muted">Real photos of the tee (worn, flat-lay, close-ups). They appear after the product images in the gallery.</p>
            {photos.length > 0 ? (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos.map((p) => (
                  <li key={p.key} className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
                    <img src={p.preview || p.srcSm || p.src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotos((l) => l.filter((x) => x.key !== p.key));
                        setTouched(true);
                      }}
                      aria-label="Remove photo"
                      className="absolute top-1 right-1 grid h-8 w-8 place-items-center rounded-full bg-ink/70 text-paper"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No photos yet.</p>
            )}
            {errors.photos && <p className="mt-2 text-sm font-medium text-danger">{errors.photos}</p>}
          </Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-20">
          <Card title="3D preview" className="overflow-hidden">
            <div className="tee-stage relative -mx-5 -mb-5 aspect-[4/5]">
              {hasWebGPU ? (
                <TeeViewer className="absolute inset-0" colorway={preview} mode="mannequin" initialAngle={side === 'front' ? 0 : 180} apiRef={apiRef} label="Product preview" />
              ) : (
                <p className="absolute inset-0 grid place-items-center p-8 text-center text-sm text-muted">
                  The 3D preview needs Chrome or Edge. It’s also what creates the product images, so open the admin there to add or change artwork.
                </p>
              )}
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1">
                {SIDES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => turn(s)}
                    className={`h-8 rounded-full px-3 text-xs font-semibold capitalize shadow-sm backdrop-blur ${side === s ? 'bg-ink text-paper' : 'bg-paper/80'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {busy && <div className="absolute inset-0 cursor-wait" aria-hidden />}
            </div>
          </Card>
          <Card title="Product images">
            {colour.front && colour.back && !colour.dirty ? (
              <div className="grid grid-cols-2 gap-2">
                {SIDES.map((s) => (
                  <div key={s} className="stage-bg grid aspect-[4/5] place-items-center rounded-xl">
                    <img src={colour[s].srcSm || colour[s].src} alt={`${s} product image`} className="h-[88%] w-[88%] object-contain" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">Front and back images for the shop are rendered from the 3D preview when you save.</p>
            )}
          </Card>
        </div>
      </fieldset>
    </div>
  );
}

function FileButton({ accept, multiple = false, onFile, variant = 'secondary', children }) {
  const input = useRef(null);
  return (
    <>
      <Button variant={variant} onClick={() => input.current.click()}>
        {children}
      </Button>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = [...e.target.files];
          e.target.value = '';
          onFile(multiple ? files : files[0]);
        }}
      />
    </>
  );
}

function DropZone({ onFile, children }) {
  const [over, setOver] = useState(false);
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFile(e.dataTransfer.files[0]);
      }}
      className={`flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        over ? 'border-accent bg-accent/5' : 'border-line bg-zinc-50 hover:border-ink/30'
      }`}
    >
      {children}
      <input
        type="file"
        accept="image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          onFile(e.target.files[0]);
          e.target.value = '';
        }}
      />
    </label>
  );
}
