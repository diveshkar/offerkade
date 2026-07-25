-- ============================================================
-- OfferCeylon : Phase 6 : Migration 012 : Allow 'suspended' status
-- Run after 011_admin_moderation.sql.
--
-- The businesses_status_check constraint (from 007) only permits
-- pending/approved/rejected. Add 'suspended' so admins can suspend shops.
-- ============================================================

alter table public.businesses drop constraint if exists businesses_status_check;
alter table public.businesses
  add constraint businesses_status_check
  check (status in ('pending', 'approved', 'rejected', 'suspended'));
