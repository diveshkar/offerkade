-- ============================================================
-- OfferCeylon : Phase 7 : Migration 013 : Lifetime metrics (7a-ii)
-- Run after 012_status_suspended.sql.
--
-- Problem: the dashboard sums "Total posted / Views / Code reveals" from the
-- offer rows that STILL EXIST. So deleting an offer (by the shop, an admin, or
-- the Phase 7a nightly expiry job) erases its whole contribution from the
-- totals — a shop's accumulated views/leads would collapse on a schedule.
--
-- Fix (LOCKED 2026-07-25): keep durable counters on the businesses row that
-- only ever go up. Manual delete and auto-expiry are treated identically:
-- both end an offer's LIFE (drop it from the live snapshot) but never rewrite
-- the PAST. Doing this at the DB (trigger) level means the future expiry Edge
-- Function updates them correctly without knowing they exist.
-- ============================================================

-- ---------- durable counters ----------
alter table public.businesses
  add column if not exists total_published bigint not null default 0,
  add column if not exists lifetime_views  bigint not null default 0,
  add column if not exists lifetime_leads  bigint not null default 0;

-- ---------- one-time backfill ----------
-- total_published: every offer that has ever gone live (approved or expired).
-- Drafts don't count until published; rejected never went live.
-- lifetime_views/leads stay 0 on purpose: the rows that still exist are summed
-- LIVE from their own view_count/lead_count, and rows already deleted before
-- this migration are unrecoverable. Only rows deleted from now on accrue here.
update public.businesses b
   set total_published = sub.cnt
  from (
    select business_id, count(*)::bigint as cnt
      from public.offers
     where business_id is not null
       and status in ('approved', 'expired')
     group by business_id
  ) sub
 where sub.business_id = b.id;

-- ---------- +1 on publish (never decremented) ----------
-- Fires when an offer becomes 'approved' — whether inserted live (shop form,
-- admin quick-add) or transitioned from draft. Published offers are locked, so
-- an offer only crosses into 'approved' once.
create or replace function public.bump_total_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.business_id is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status = 'approved' then
      update public.businesses
         set total_published = total_published + 1
       where id = new.business_id;
    end if;
  elsif tg_op = 'UPDATE' then
    if new.status = 'approved' and old.status is distinct from 'approved' then
      update public.businesses
         set total_published = total_published + 1
       where id = new.business_id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists offers_bump_total_published on public.offers;
create trigger offers_bump_total_published
  after insert or update of status on public.offers
  for each row execute function public.bump_total_published();

-- ---------- roll views/leads into durable columns before a row is deleted ----------
-- BEFORE DELETE so no view/lead is lost, for ANY deleter: the shop, an admin,
-- or the nightly expiry job. Guarded so a cascading business delete (offers go
-- first) doesn't try to touch an already-removed parent.
create or replace function public.rollup_offer_metrics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.business_id is not null
     and exists (select 1 from public.businesses where id = old.business_id) then
    update public.businesses
       set lifetime_views = lifetime_views + coalesce(old.view_count, 0),
           lifetime_leads = lifetime_leads + coalesce(old.lead_count, 0)
     where id = old.business_id;
  end if;
  return old;
end;
$$;

drop trigger if exists offers_rollup_metrics on public.offers;
create trigger offers_rollup_metrics
  before delete on public.offers
  for each row execute function public.rollup_offer_metrics();

-- Dashboard reads: lifetime totals = durable column + sum(still-live rows).
--   views  = businesses.lifetime_views + sum(view_count of existing rows)
--   leads  = businesses.lifetime_leads + sum(lead_count of existing rows)
-- No double-count: a live row's counts live on the row; once deleted they move
-- into the column. "Offers posted (all time)" reads total_published directly.
