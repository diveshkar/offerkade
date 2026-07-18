-- ============================================================
-- OfferCeylon — Phase 2 verification checks
-- Run these in the SQL Editor after applying the schema.
-- ============================================================

-- 1. All 6 tables exist
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
-- expect: admins, businesses, categories, offers, redemptions, subscriptions

-- 2. RLS is enabled on every table
select relname as table, relrowsecurity as rls_enabled
from pg_class
where relnamespace = 'public'::regnamespace
  and relkind = 'r'
order by relname;
-- expect rls_enabled = true for all

-- 3. Categories seeded (expect 10)
select count(*) as category_count from public.categories;

-- 4. Policies are in place
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 5. RPC exists
select proname from pg_proc where proname in ('bump_view_count', 'is_admin');
-- expect both rows
