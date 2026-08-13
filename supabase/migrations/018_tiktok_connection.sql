-- ============================================================
-- OfferCeylon : Migration 018 : TikTok connection
-- Run after 017_tourist_flag.sql.
--
-- Stores the single OAuth connection to OfferCeylon's own TikTok account
-- (singleton row, id always 1) so an admin authorizes once and the app can
-- post on that account's behalf afterwards, refreshing tokens as needed.
-- Service-role only: no public or authenticated RLS policy is defined, so
-- only supabaseAdmin (server-only) can read or write this table.
-- ============================================================

create table if not exists public.tiktok_connection (
  id int primary key default 1 check (id = 1),
  open_id text,
  access_token text,
  access_token_expires_at timestamptz,
  refresh_token text,
  refresh_token_expires_at timestamptz,
  connected_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.tiktok_connection enable row level security;

-- Track which offers have already been posted, so the admin UI can show
-- "Posted" instead of letting the same offer go out twice by mistake.
alter table public.offers
  add column if not exists tiktok_posted_at timestamptz;
