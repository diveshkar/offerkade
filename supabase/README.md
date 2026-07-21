# OfferCeylon — Supabase setup (Phase 2)

Everything the database needs, as plain SQL you paste into the Supabase dashboard.

## 1. Create the project (you, in the browser)
1. Go to https://supabase.com → sign in with GitHub → **New project**.
2. Name: `offerceylon`. Choose a strong DB password (save it in your password manager).
3. Region: **Southeast Asia (Singapore)** — closest to Sri Lanka.
4. Wait ~2 min for it to provision.

## 2. Wire keys into the app (you)
1. In Supabase: **Project Settings → API**.
2. Copy into a new file `.env.local` at the repo root (see `.env.example`):
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (secret — server only)

## 3. Run the schema (you, in Supabase SQL Editor)
Open **SQL Editor → New query**. Either:
- Paste the whole of [`schema_all.sql`](./schema_all.sql) and **Run** once, **or**
- Run the numbered files in `migrations/` in order: `001` to `008`.

Already have the database live? Run only the new file:
[`migrations/007_shop_accounts.sql`](./migrations/007_shop_accounts.sql) (Phase 5 shop ownership) and
[`migrations/008_branches.sql`](./migrations/008_branches.sql) (Phase 5 shop branches).

## 4. Verify (you, in SQL Editor)
Run the checks in [`verify.sql`](./verify.sql). You should see 10 categories and RLS enabled on all tables.

## 5. Add yourself as an admin (later, after Phase 6 auth)
Once you can log in via Supabase Auth, insert your auth user id into `public.admins`.
Until then the app only reads public (approved) data with the anon key — no admin needed yet.

---
The `service_role` key bypasses RLS. Keep it out of the browser and out of git.
