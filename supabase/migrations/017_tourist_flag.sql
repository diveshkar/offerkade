-- ============================================================
-- OfferCeylon : Migration 017 : Tourist-friendly flag on offers
-- Run after 016_curated_offers.sql.
--
-- Marks offers aimed at foreign visitors (hotels, restaurants, tours,
-- attractions, travel services). Combined with Google Analytics country
-- data later, this identifies which offers actually pull tourists — for
-- Google Ads targeting / monetization.
-- ============================================================

alter table public.offers
  add column if not exists tourist_friendly boolean not null default false;

-- Handy for filtering the tourist offers quickly.
create index if not exists idx_offers_tourist on public.offers (tourist_friendly);
