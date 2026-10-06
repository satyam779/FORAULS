import { useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { LogOut, Package, ShoppingCart } from 'lucide-react';
import { getSupabase, hasSupabase } from '../../lib/supabase';
import { STORE } from '../../config/store';
import { Button, Field, SupabaseContext } from './ui';
import Orders from './Orders';
import Products from './Products';
import ProductEditor from './ProductEditor';

function useNoIndex(title) {
  useEffect(() => {
    document.title = title;
    const m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex';
    document.head.appendChild(m);
    return () => m.remove();
  }, [title]);
}

/** /admin — sign-in gate, then orders and products. Access is enforced by Supabase row-level security. */
export default function Admin() {
  useNoIndex(`Admin — ${STORE.name}`);
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(undefined); // undefined = still checking
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (!hasSupabase) return;
    let sub;
    let alive = true;
    getSupabase().then(async (sb) => {
      if (!alive) return;
      setSupabase(sb);
      const { data } = await sb.auth.getSession();
      if (alive) setSession(data.session);
      sub = sb.auth.onAuthStateChange((_event, s) => setSession(s)).data.subscription;
    });
    return () => {
      alive = false;
      sub?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsAdmin(null);
    if (!supabase || !session) return;
    let alive = true;
    supabase.rpc('is_admin').then(({ data, error }) => {
      if (alive) setIsAdmin(error ? false : data === true);
    });
    return () => {
      alive = false;
    };
  }, [supabase, session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hasSupabase) return <Setup />;
  if (!supabase || session === undefined || (session && isAdmin === null)) {
    return <div className="grid min-h-svh place-items-center bg-zinc-100 text-muted">Loading…</div>;
  }
  if (!session) return <Login supabase={supabase} />;
  if (!isAdmin) {
    return (
      <Centered>
        <h1 className="text-xl font-bold">No admin access</h1>
        <p className="mt-2 text-sm text-muted">
          {session.user.email} is signed in but isn’t on the admin list. Add it to the <code>admins</code> table in Supabase (see README).
        </p>
        <Button className="mt-6 w-full" variant="secondary" onClick={() => supabase.auth.signOut()}>
          Sign out
        </Button>
      </Centered>
    );
  }

  return (
    <SupabaseContext.Provider value={supabase}>
      <div className="min-h-svh bg-zinc-100">
        <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:px-6">
            <NavLink to="/" className="mr-3 font-display text-xl tracking-[0.14em]">
              {STORE.name}
            </NavLink>
            <Tab to="/admin" end icon={ShoppingCart}>
              Orders
            </Tab>
            <Tab to="/admin/products" icon={Package}>
              Products
            </Tab>
            <span className="ml-auto hidden truncate text-sm text-muted sm:block">{session.user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              aria-label="Sign out"
              title="Sign out"
              className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Routes>
            <Route index element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductEditor />} />
            <Route path="products/:slug" element={<ProductEditor />} />
            <Route path="*" element={<p className="text-muted">Nothing here.</p>} />
          </Routes>
        </main>
      </div>
    </SupabaseContext.Provider>
  );
}

function Tab({ to, end, icon: Icon, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors ${
          isActive ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-ink/5'
        }`
      }
    >
      <Icon className="h-4 w-4" aria-hidden />
      {children}
    </NavLink>
  );
}

function Centered({ children }) {
  return (
    <div className="grid min-h-svh place-items-center bg-zinc-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-sm">{children}</div>
    </div>
  );
}

function Login({ supabase }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) setError(err.message === 'Invalid login credentials' ? 'Wrong email or password.' : err.message);
  };

  return (
    <Centered>
      <p className="font-display text-2xl tracking-[0.14em]">{STORE.name}</p>
      <h1 className="mt-1 text-sm font-semibold text-muted">Store admin</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Email">
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Password">
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {error && (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        )}
        <Button type="submit" busy={busy} className="w-full">
          Sign in
        </Button>
      </form>
    </Centered>
  );
}

function Setup() {
  return (
    <Centered>
      <h1 className="text-xl font-bold">Connect Supabase</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        The admin needs a Supabase project. Set <code>SUPABASE_URL</code> and <code>SUPABASE_KEY</code> (in <code>.env</code>{' '}
        locally, and in your Vercel project’s environment variables), run <code>supabase/schema.sql</code>, then rebuild. The README has
        the full steps.
      </p>
    </Centered>
  );
}
