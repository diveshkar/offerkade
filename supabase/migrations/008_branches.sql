-- ============================================================
-- OfferCeylon : Phase 5 : Migration 008 : Shop branches
-- Run after 007_shop_accounts.sql.
--
-- A shop may trade from several locations. Each branch belongs to
-- one of the 25 districts and carries its own address, optionally
-- geocoded. Offers may point at a branch, or stay shop wide.
-- ============================================================

create table if not exists public.branches (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  label       text,
  district    text not null,
  city        text,
  address     text,
  lat         double precision,
  lng         double precision,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists branches_business_id_idx on public.branches (business_id);
create index if not exists branches_district_idx    on public.branches (district);

alter table public.offers
  add column if not exists branch_id uuid references public.branches(id) on delete set null;

create index if not exists offers_branch_id_idx on public.offers (branch_id);

alter table public.branches enable row level security;

-- Public sees branches of approved shops only.
drop policy if exists branches_public_read on public.branches;
create policy branches_public_read on public.branches
  for select using (
    exists (
      select 1 from public.businesses b
       where b.id = branches.business_id
         and b.status = 'approved'
    )
  );

-- An owner manages the branches of a shop they own, at any status,
-- so onboarding can add them before approval.
drop policy if exists branches_owner_all on public.branches;
create policy branches_owner_all on public.branches
  for all to authenticated
  using (
    exists (
      select 1 from public.businesses b
       where b.id = branches.business_id
         and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.businesses b
       where b.id = branches.business_id
         and b.owner_id = auth.uid()
    )
  );

drop policy if exists branches_admin_all on public.branches;
create policy branches_admin_all on public.branches
  for all using (public.is_admin()) with check (public.is_admin());

-- Keep exactly one primary branch per shop.
create or replace function public.enforce_single_primary_branch()
returns trigger
language plpgsql
as $$
begin
  if new.is_primary then
    update public.branches
       set is_primary = false
     where business_id = new.business_id
       and id <> new.id
       and is_primary;
  end if;
  return new;
end;
$$;

drop trigger if exists branches_single_primary on public.branches;
create trigger branches_single_primary
  after insert or update of is_primary on public.branches
  for each row when (new.is_primary) execute function public.enforce_single_primary_branch();
