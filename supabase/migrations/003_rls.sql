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
