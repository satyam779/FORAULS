import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { fromRow } from '../../data/catalog';
import { formatPrice } from '../../lib/format';
import { useCatalog } from '../../lib/catalog';
import { Button, Card, useSupabase } from './ui';

export default function Products() {
  const supabase = useSupabase();
  const { reload } = useCatalog();
  const { state } = useLocation();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(null); // slug whose delete is awaiting a second click
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('products').select('*').order('sort').order('created_at');
    if (err) return setError(err.message);
    setRows(data);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (row) => {
    setRows((list) => list.map((r) => (r.slug === row.slug ? { ...r, active: !row.active } : r)));
    const { error: err } = await supabase.from('products').update({ active: !row.active }).eq('slug', row.slug);
    if (err) {
      setError(err.message);
      load();
    } else reload();
  };

  // Removes the row only: its images stay in Storage because past orders still show them.
  const remove = async (row) => {
    setError('');
    setDeleting(row.slug);
    const { data, error: err } = await supabase.from('products').delete().eq('slug', row.slug).select('slug');
    setDeleting(null);
    setConfirming(null);
    // row-level security turns a forbidden delete into "0 rows", not an error
    if (err || !data?.length) return setError(err?.message ?? `Couldn’t delete “${row.short}”. Check that your login is in the admins table.`);
    setRows((list) => list.filter((r) => r.slug !== row.slug));
    reload();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Products</h1>
          {rows && <p className="text-sm text-muted">{rows.filter((r) => r.active).length} in the shop · {rows.filter((r) => !r.active).length} hidden</p>}
        </div>
        <Link to="/admin/products/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-paper hover:bg-ink-2">
          <Plus className="h-4 w-4" aria-hidden /> New product
        </Link>
      </div>

      {state?.saved && (
        <p role="status" className="rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
          Saved “{state.saved}”. It’s live in the shop{state.hidden ? ' once you make it visible' : ''}.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      {rows === null ? (
        <p className="py-12 text-center text-muted">Loading products…</p>
      ) : rows.length === 0 ? (
        <Card>
          <p className="py-6 text-center text-muted">
            No products in the database yet. Run <code>supabase/seed.sql</code> to import the current catalog, or add a new product.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const p = fromRow(row);
            const c = p.colors[0];
            const img = c && (p.cardFace === 'front' ? c.front : c.back);
            return (
              <li key={row.slug} className={`flex gap-4 rounded-2xl border border-line bg-white p-3 ${row.active ? '' : 'opacity-60'}`}>
                <div className="stage-bg grid h-28 w-24 shrink-0 place-items-center overflow-hidden rounded-xl">
                  {img && <img src={img.srcSm} alt="" className="h-[88%] w-[88%] object-contain" loading="lazy" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate font-semibold">{p.short}</p>
                  <p className="text-sm text-muted">
                    {formatPrice(p.price)} · {p.collection}
                  </p>
                  <div className="mt-1 flex gap-1">
                    {p.colors.map((col) => (
                      <span key={col.id} title={col.name} className="h-3.5 w-3.5 rounded-full ring-1 ring-ink/15" style={{ background: col.hex }} />
                    ))}
                  </div>
                  <div className="mt-auto flex gap-2 pt-2">
                    {confirming === row.slug ? (
                      <>
                        <Button variant="danger" className="h-8 px-2.5 text-xs" busy={deleting === row.slug} onClick={() => remove(row)}>
                          {deleting !== row.slug && <Trash2 className="h-3.5 w-3.5" aria-hidden />} Delete
                        </Button>
                        <Button variant="ghost" className="h-8 px-2.5 text-xs" disabled={deleting === row.slug} onClick={() => setConfirming(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={`/admin/products/${row.slug}`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-semibold hover:border-ink/40"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                        </Link>
                        <Button variant="ghost" className="h-8 px-2.5 text-xs" onClick={() => toggle(row)}>
                          {row.active ? <Eye className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}
                          {row.active ? 'Visible' : 'Hidden'}
                        </Button>
                        <button
                          type="button"
                          onClick={() => setConfirming(row.slug)}
                          disabled={Boolean(deleting)}
                          title="Delete"
                          aria-label={`Delete ${p.short}`}
                          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/5 hover:text-danger disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
