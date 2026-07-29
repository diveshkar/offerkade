-- ============================================================
-- OfferCeylon : Migration 015 : Harden the public view counter
-- Run after 014_expiry_cron.sql.
--
-- Problem: bump_view_count was granted to `anon`, so anyone with the public
-- anon key could call it in a loop and inflate view (and lead) counts. It is
-- not a data leak, but it lets people fake statistics.
--
-- Fix: revoke the public/anon/authenticated grants so the counters can no
-- longer be called from the browser, and count views server-side instead
-- (a Next.js route handler, service role) deduped per viewer per day via the
-- table below. bump_lead_count is locked the same way ahead of Phase 10.
-- ============================================================

-- Per-viewer-per-day dedup for offer views. Only the service role touches it
-- (the /api/offer/[id]/view route). Default-deny RLS; no public policies.
create table if not exists public.offer_view_hits (
  offer_id uuid not null references public.offers(id) on delete cascade,
  viewer   text not null,        -- hashed IP (no raw IP is ever stored)
  day      date not null default current_date,
  primary key (offer_id, viewer, day)
);

alter table public.offer_view_hits enable row level security;

-- Lock the counter functions to server-side only. service_role keeps EXECUTE
-- (it runs the RPC from the route); the browser roles lose it entirely.
revoke execute on function public.bump_view_count(uuid) from public, anon, authenticated;
grant  execute on function public.bump_view_count(uuid) to service_role;

revoke execute on function public.bump_lead_count(uuid) from public, anon, authenticated;
grant  execute on function public.bump_lead_count(uuid) to service_role;
