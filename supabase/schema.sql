-- FORAULS store — Supabase schema.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Then run supabase/seed.sql to load the current catalog.
-- Safe to re-run: every statement is idempotent.

-- ---------------------------------------------------------------------------
-- Admins: users listed here can manage products and see orders.
-- Add yourself after creating your login (Authentication → Users → Add user):
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'you@example.com';
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Products. `colors` holds the colourways exactly as the storefront uses them:
--   [{ id, name, hex, tone,
--      front: { src, srcSm, w, h, wSm }, back: { … },          -- product images
--      prints: { front: { src, rect: [cx, cy, w, h] } | null,   -- 3D artwork,
--                back:  { src, rect } | null } }]               -- rect in metres
-- `photos` is the real-photo gallery: [{ src, srcSm, w, h }].
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  short text not null,
  price integer not null check (price > 0),
  mrp integer check (mrp is null or mrp > 0),
  collection text not null default 'New',
  badge text,
  blurb text not null default '',
  fit text,
  card_face text not null default 'back' check (card_face in ('front', 'back')),
  colors jsonb not null default '[]'::jsonb check (jsonb_typeof(colors) = 'array'),
  photos jsonb not null default '[]'::jsonb check (jsonb_typeof(photos) = 'array'),
  active boolean not null default true,
  sort integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;

drop policy if exists "anyone reads active products" on public.products;
create policy "anyone reads active products" on public.products
  for select to anon, authenticated using (active or public.is_admin());

drop policy if exists "admins write products" on public.products;
create policy "admins write products" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Orders. Created only by the /api/orders server function (with the secret
-- key, which bypasses RLS) after it re-prices the cart from `products`.
-- Shoppers can't read or write this table; admins can read and update it.
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1001) unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  note text,
  -- [{ slug, name, color, colorName, size, qty, price, total, image }]
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  subtotal integer not null,
  shipping integer not null default 0,
  total integer not null,
  payment text not null default 'cod',
  email_sent boolean not null default false
);
alter table public.orders enable row level security;
create index if not exists orders_created_at on public.orders (created_at desc);

drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders
  for select to authenticated using (public.is_admin());

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Storage: public bucket for product images and print artwork.
-- Anyone can view the files; only admins can upload, replace or delete.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 10485760, array['image/png', 'image/webp', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "admins update product images" on storage.objects;
create policy "admins update product images" on storage.objects
  for update to authenticated using (bucket_id = 'products' and public.is_admin());

drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'products' and public.is_admin());
