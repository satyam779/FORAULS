import { cloneElement, createContext, useContext, useId } from 'react';
import { Loader2 } from 'lucide-react';

/** The signed-in supabase-js client, provided by the admin shell. */
export const SupabaseContext = createContext(null);
export const useSupabase = () => useContext(SupabaseContext);

export function Button({ variant = 'primary', busy = false, className = '', children, ...props }) {
  const look = {
    primary: 'bg-ink text-paper hover:bg-ink-2',
    secondary: 'border border-line bg-white text-ink hover:border-ink/40',
    ghost: 'text-ink-2 hover:bg-ink/5',
    danger: 'border border-danger/30 bg-white text-danger hover:bg-danger/5',
  }[variant];
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || busy}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${look} ${className}`}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Card({ title, actions, className = '', children }) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-bold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/** Label + control + hint/error. The control is the single child element. */
export function Field({ label, hint, error, className = '', children }) {
  const id = useId();
  const tall = children.type === 'textarea';
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      {cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        className: `w-full rounded-xl border bg-white px-3 text-sm outline-none transition-colors focus:border-ink ${
          error ? 'border-danger' : 'border-line'
        } ${tall ? 'py-2.5' : 'h-10'} ${children.props.className ?? ''}`,
      })}
      {error ? (
        <p className="mt-1 text-xs font-medium text-danger">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

export const STATUS = {
  new: { label: 'New', className: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Confirmed', className: 'bg-amber-100 text-amber-800' },
  shipped: { label: 'Shipped', className: 'bg-violet-100 text-violet-800' },
  delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', className: 'bg-zinc-200 text-zinc-700' },
};

export function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.new;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}>{s.label}</span>;
}
