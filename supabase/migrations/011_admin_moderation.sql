-- ============================================================
-- OfferCeylon : Phase 6 : Migration 011 : Admin moderation
-- Run after 010_verify_on_approval.sql.
--
-- Adds a rejection reason, supports a `suspended` shop status, and
-- makes the public offer feed hide offers from any shop that is not
-- currently approved (suspended or rejected shops disappear).
-- ============================================================

-- Reason shown to the shop when an admin rejects them.
alter table public.businesses
  add column if not exists rejection_reason text;

-- `status` is a free-text column, so 'suspended' needs no type change.
-- The verified-sync trigger (010) already sets verified = (status='approved'),
-- so suspending a shop also drops its verified badge automatically.

-- ---------- Public offer visibility now depends on the shop, too ----------
-- Only show approved, unexpired offers whose business is ALSO approved.
-- Suspending/rejecting a shop instantly hides all of its offers.
drop policy if exists offers_public_read on public.offers;
create policy offers_public_read on public.offers
  for select using (
    status = 'approved'
    and end_date >= current_date
    and exists (
      select 1 from public.businesses b
      where b.id = offers.business_id
        and b.status = 'approved'
    )
  );

-- ---------- Public may only see APPROVED shops ----------
-- Tighten the earlier `using (true)` so pending/suspended/rejected shops have
-- no public profile page. Owners still read their own row (businesses_owner_read)
-- and admins read all (businesses_admin_all), so those flows are unaffected.
drop policy if exists businesses_public_read on public.businesses;
create policy businesses_public_read on public.businesses
  for select using (status = 'approved');
