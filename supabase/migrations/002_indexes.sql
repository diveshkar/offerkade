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
