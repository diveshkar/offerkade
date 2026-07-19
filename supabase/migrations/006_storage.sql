-- ============================================================
-- OfferCeylon — Phase 3 — Migration 006: Storage bucket + policies
-- Run in Supabase SQL Editor after the Phase 2 migrations.
--
-- Creates the public `posters` bucket and locks writes to the
-- service_role only (the Phase 5 submission Edge Function).
-- Public gets read-only access; the browser never writes directly.
-- ============================================================

-- Create the bucket (public read). Idempotent.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'posters',
  'posters',
  true,                       -- public read (served via CDN URL)
  1048576,                    -- 1MB per object ceiling (compressed posters are ~150KB)
  array['image/webp']         -- only WebP — everything is converted browser-side
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------- Storage RLS policies ----------
-- Public may READ objects in the posters bucket (for display).
drop policy if exists posters_public_read on storage.objects;
create policy posters_public_read on storage.objects
  for select using (bucket_id = 'posters');

-- NO public insert/update/delete policy is created on purpose.
-- The submission Edge Function (service_role) bypasses RLS to upload,
-- and the nightly expiry job (service_role) deletes by path.
-- This closes the storage-write hole described in the plan.
