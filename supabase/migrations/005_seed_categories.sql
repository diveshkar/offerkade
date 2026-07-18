-- ============================================================
-- OfferCeylon — Phase 2 — Migration 005: Seed categories
-- Run after 004_view_count_rpc.sql.
-- Idempotent: safe to re-run (upserts on slug).
-- ============================================================

insert into public.categories (name, slug, icon, sort_order) values
  ('Food',        'food',        '🍔', 1),
  ('Drink',       'drink',       '🥤', 2),
  ('Groceries',   'groceries',   '🛒', 3),
  ('Fashion',     'fashion',     '👕', 4),
  ('Furniture',   'furniture',   '🛋️', 5),
  ('Electronics', 'electronics', '📱', 6),
  ('Beauty',      'beauty',      '💄', 7),
  ('Services',    'services',    '🧰', 8),
  ('Travel',      'travel',      '✈️', 9),
  ('Other',       'other',       '🏷️', 99)
on conflict (slug) do update
  set name       = excluded.name,
      icon       = excluded.icon,
      sort_order = excluded.sort_order;
