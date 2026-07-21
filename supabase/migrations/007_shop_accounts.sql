-- ============================================================
-- OfferCeylon : Phase 5 : Migration 007 : Shop accounts
-- Run after 006_storage.sql.
--
-- Adds shop ownership so approved businesses can post their own
-- offers, plus a "get deal" lead counter.
--
-- Access model:
--   * A shop owns one businesses row (owner_id = auth.uid()).
--   * A shop self-registers as 'pending'; only an admin approves.
--   * An approved shop may write ONLY its own offers.
--   * Privileged columns (status, verified, owner_id, is_featured,
--     subscription_tier) are protected by triggers, so an owner
--     cannot promote or approve itself.
-- ============================================================

-- ---------- columns ----------
alter table public.businesses
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

alter table public.businesses
  add column if not exists status text not null default 'pending';

alter table public.offers
  add column if not exists lead_count int not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'businesses_status_check'
  ) then
    alter table public.businesses
      add constraint businesses_status_check
      check (status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

-- Rows that predate ownership are already live, so keep them visible.
update public.businesses
   set status = 'approved'
 where owner_id is null
   and status = 'pending';

create index if not exists businesses_owner_id_idx on public.businesses (owner_id);
create index if not exists businesses_status_idx   on public.businesses (status);

-- ---------- privilege guards ----------
create or replace function public.guard_business_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Admins and server-side (service_role, no auth.uid()) may change anything.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.owner_id          is distinct from old.owner_id
  or new.status            is distinct from old.status
  or new.verified          is distinct from old.verified
  or new.subscription_tier is distinct from old.subscription_tier then
    raise exception 'Only an admin may change owner_id, status, verified or subscription_tier';
  end if;

  return new;
end;
$$;

drop trigger if exists businesses_guard_columns on public.businesses;
create trigger businesses_guard_columns
  before update on public.businesses
  for each row execute function public.guard_business_columns();

create or replace function public.guard_offer_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' and new.is_featured then
    raise exception 'Only an admin may feature an offer';
  end if;

  if tg_op = 'UPDATE' and new.is_featured is distinct from old.is_featured then
    raise exception 'Only an admin may feature an offer';
  end if;

  return new;
end;
$$;

drop trigger if exists offers_guard_columns on public.offers;
create trigger offers_guard_columns
  before insert or update on public.offers
  for each row execute function public.guard_offer_columns();

-- ---------- businesses policies ----------
-- Public sees approved shops only; owners always see their own row.
drop policy if exists businesses_public_read on public.businesses;
create policy businesses_public_read on public.businesses
  for select using (status = 'approved');

drop policy if exists businesses_owner_read on public.businesses;
create policy businesses_owner_read on public.businesses
  for select to authenticated using (owner_id = auth.uid());

drop policy if exists businesses_owner_insert on public.businesses;
create policy businesses_owner_insert on public.businesses
  for insert to authenticated
  with check (owner_id = auth.uid() and status = 'pending');

drop policy if exists businesses_owner_update on public.businesses;
create policy businesses_owner_update on public.businesses
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ---------- offers policies ----------
-- An approved shop may read and write only its own offers.
drop policy if exists offers_owner_all on public.offers;
create policy offers_owner_all on public.offers
  for all to authenticated
  using (
    exists (
      select 1 from public.businesses b
       where b.id = offers.business_id
         and b.owner_id = auth.uid()
         and b.status = 'approved'
    )
  )
  with check (
    exists (
      select 1 from public.businesses b
       where b.id = offers.business_id
         and b.owner_id = auth.uid()
         and b.status = 'approved'
    )
  );

-- ---------- lead counter ----------
create or replace function public.bump_lead_count(p_offer_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.offers
     set lead_count = lead_count + 1
   where id = p_offer_id
     and status = 'approved'
     and end_date >= current_date;
$$;

grant execute on function public.bump_lead_count(uuid) to anon, authenticated;
