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
