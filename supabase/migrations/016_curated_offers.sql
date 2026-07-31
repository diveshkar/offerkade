-- ============================================================
-- OfferCeylon : Migration 016 : Curated offers ("posted by OfferCeylon")
-- Run after 015_counter_hardening.sql.
--
-- Lets an admin post an offer they found somewhere, WITHOUT a shop
-- registering. The offer is owned by the "OfferCeylon" house business, and
-- the real venue/shop name is stored in `source_name` so the public pages can
-- show the venue while attributing the post to OfferCeylon.
-- ============================================================

alter table public.offers
  add column if not exists source_name text; -- the real shop/venue this offer is for
