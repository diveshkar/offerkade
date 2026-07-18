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
