-- ============================================================
-- OfferCeylon — Phase 2 — Migration 001: Tables
-- Paste this whole file into Supabase SQL Editor and Run.
-- ============================================================

-- ---------- businesses ----------
create table if not exists public.businesses (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text unique not null,
  logo_url          text,
  contact_email     text,
  contact_phone     text,
  whatsapp          text,
  website           text,
  city              text,
  address           text,
  verified          boolean not null default false,
  subscription_tier text not null default 'free',   -- free / featured / premium (Phase 10)
  created_at        timestamptz not null default now()
);

-- ---------- categories ----------
create table if not exists public.categories (
  id         serial primary key,
  name       text not null,
  slug       text unique not null,
  icon       text,
  sort_order int not null default 0
);

-- ---------- offers (the heart of the site) ----------
create table if not exists public.offers (
  id                 uuid primary key default gen_random_uuid(),
  business_id        uuid references public.businesses(id) on delete cascade,
  category_id        int  references public.categories(id) on delete set null,
  title              text not null,
  description        text,
  poster_url         text,          -- compressed image (CDN URL, for display)
  poster_thumb_url   text,          -- thumbnail (CDN URL, for grid)
  poster_path        text,          -- storage key, for deletion (posters/abc.webp)
  poster_thumb_path  text,          -- storage key, for deletion
  city               text,          -- denormalized for filtering
  location_note      text,          -- "All branches"
  promo_code         text unique,   -- Phase 10
  start_date         date,
  end_date           date not null, -- drives "expiring soon" + auto-delete
  status             text not null default 'pending', -- pending / approved / expired / rejected
  is_featured        boolean not null default false,
  view_count         int not null default 0,          -- bumped via RPC
  redemption_count   int not null default 0,          -- Phase 10
  submitted_by_email text,
  created_at         timestamptz not null default now(),
  approved_at        timestamptz
);

-- ---------- admins ----------
create table if not exists public.admins (
  id         uuid primary key,      -- matches Supabase auth user id
  email      text,
  role       text not null default 'admin', -- admin / superadmin
  created_at timestamptz not null default now()
);

-- ---------- redemptions (Phase 10) ----------
create table if not exists public.redemptions (
  id          uuid primary key default gen_random_uuid(),
  offer_id    uuid references public.offers(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  source      text  -- web / instore / qr
);

-- ---------- subscriptions (Phase 10) ----------
create table if not exists public.subscriptions (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  tier        text,     -- featured / premium
  price       numeric,
  status      text,     -- active / cancelled / past_due
  started_at  timestamptz,
  renews_at   timestamptz
);
-- ============================================================
-- OfferCeylon — Phase 2 — Migration 002: Indexes
-- Run after 001_tables.sql.
-- ============================================================

create index if not exists idx_offers_status_end_date on public.offers (status, end_date);
create index if not exists idx_offers_category         on public.offers (category_id);
create index if not exists idx_offers_city             on public.offers (city);
create index if not exists idx_offers_featured_created on public.offers (is_featured, created_at);

create index if not exists idx_businesses_slug  on public.businesses (slug);
create index if not exists idx_categories_slug  on public.categories (slug);
-- ============================================================
-- OfferCeylon — Phase 2 — Migration 003: Row Level Security
-- Run after 002_indexes.sql.
--
-- Model:
--   * Public (anon) may ONLY read approved, non-expired offers,
--     plus categories and (safe) business info.
--   * NO public writes anywhere — the submission Edge Function
--     uses the service_role key, which bypasses RLS entirely.
--   * Admins (rows in public.admins) may read/write everything.
-- ============================================================

-- Enable RLS on every table (default-deny once enabled).
alter table public.businesses    enable row level security;
alter table public.categories    enable row level security;
alter table public.offers        enable row level security;
alter table public.admins        enable row level security;
alter table public.redemptions   enable row level security;
alter table public.subscriptions enable row level security;

-- Helper: is the current auth user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.id = auth.uid()
  );
$$;

-- ---------- categories: public read, admin write ----------
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (true);

drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- businesses: public read, admin write ----------
drop policy if exists businesses_public_read on public.businesses;
create policy businesses_public_read on public.businesses
  for select using (true);

drop policy if exists businesses_admin_all on public.businesses;
create policy businesses_admin_all on public.businesses
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- offers ----------
-- Public: only approved offers that haven't expired.
drop policy if exists offers_public_read on public.offers;
create policy offers_public_read on public.offers
  for select using (status = 'approved' and end_date >= current_date);

-- Admins: read every status + full write access.
drop policy if exists offers_admin_read on public.offers;
create policy offers_admin_read on public.offers
  for select using (public.is_admin());

drop policy if exists offers_admin_write on public.offers;
create policy offers_admin_write on public.offers
  for all using (public.is_admin()) with check (public.is_admin());

-- NOTE: there is deliberately NO public insert/update/delete policy.
-- The submission Edge Function writes via service_role (bypasses RLS).

-- ---------- admins: admin-only ----------
drop policy if exists admins_admin_all on public.admins;
create policy admins_admin_all on public.admins
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- redemptions: admin-only (Phase 10) ----------
drop policy if exists redemptions_admin_all on public.redemptions;
create policy redemptions_admin_all on public.redemptions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- subscriptions: admin-only (Phase 10) ----------
drop policy if exists subscriptions_admin_all on public.subscriptions;
create policy subscriptions_admin_all on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());
-- ============================================================
-- OfferCeylon — Phase 2 — Migration 004: view_count RPC
-- Run after 003_rls.sql.
--
-- RLS forbids public writes to offers, so the public site cannot
-- UPDATE view_count directly. This SECURITY DEFINER function bumps
-- ONLY that one column, for approved non-expired offers.
-- Call from the client via: supabase.rpc('bump_view_count', { p_offer_id })
-- ============================================================

create or replace function public.bump_view_count(p_offer_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.offers
     set view_count = view_count + 1
   where id = p_offer_id
     and status = 'approved'
     and end_date >= current_date;
$$;

-- Allow the public (anon) + logged-in roles to call it.
grant execute on function public.bump_view_count(uuid) to anon, authenticated;
-- ============================================================
-- OfferCeylon — Phase 2 — Migration 005: Seed categories
-- Run after 004_view_count_rpc.sql.
-- Idempotent: safe to re-run (upserts on slug).
-- ============================================================

insert into public.categories (name, slug, icon, sort_order) values
  ('Food',        'food',        '🍔', 1),
  ('Drink',       'drink',       '🥤', 2),
  ('Groceries',   'groceries',   '🛒', 3),
  ('Fashion',     'fashion',     '👕', 4),
  ('Furniture',   'furniture',   '🛋️', 5),
  ('Electronics', 'electronics', '📱', 6),
  ('Beauty',      'beauty',      '💄', 7),
  ('Services',    'services',    '🧰', 8),
  ('Travel',      'travel',      '✈️', 9),
  ('Other',       'other',       '🏷️', 99)
on conflict (slug) do update
  set name       = excluded.name,
      icon       = excluded.icon,
      sort_order = excluded.sort_order;
-- ============================================================
-- OfferCeylon — Phase 3 — Migration 006: Storage bucket + policies
-- Run in Supabase SQL Editor after the Phase 2 migrations.
--
-- Creates the public `posters` bucket and locks writes to the
-- service_role only (the Phase 5 submission Edge Function).
-- Public gets read-only access; the browser never writes directly.
-- ============================================================

-- Create the bucket (public read). Idempotent.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'posters',
  'posters',
  true,                       -- public read (served via CDN URL)
  1048576,                    -- 1MB per object ceiling (compressed posters are ~150KB)
  array['image/webp']         -- only WebP — everything is converted browser-side
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------- Storage RLS policies ----------
-- Public may READ objects in the posters bucket (for display).
drop policy if exists posters_public_read on storage.objects;
create policy posters_public_read on storage.objects
  for select using (bucket_id = 'posters');

-- NO public insert/update/delete policy is created on purpose.
-- The submission Edge Function (service_role) bypasses RLS to upload,
-- and the nightly expiry job (service_role) deletes by path.
-- This closes the storage-write hole described in the plan.
