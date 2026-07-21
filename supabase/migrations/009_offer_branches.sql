-- ============================================================
-- OfferCeylon : Phase 5 : Migration 009 : Offer to branch links
-- Run after 008_branches.sql.
--
-- An offer may run at several branches, so the single branch_id
-- from 008 is replaced by a join table.
-- ============================================================

create table if not exists public.offer_branches (
  offer_id  uuid not null references public.offers(id)   on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  primary key (offer_id, branch_id)
);

create index if not exists offer_branches_branch_idx on public.offer_branches (branch_id);

alter table public.offers drop column if exists branch_id;

alter table public.offer_branches enable row level security;

drop policy if exists offer_branches_public_read on public.offer_branches;
create policy offer_branches_public_read on public.offer_branches
  for select using (
    exists (
      select 1 from public.offers o
       where o.id = offer_branches.offer_id
         and o.status = 'approved'
         and o.end_date >= current_date
    )
  );

drop policy if exists offer_branches_owner_all on public.offer_branches;
create policy offer_branches_owner_all on public.offer_branches
  for all to authenticated
  using (
    exists (
      select 1 from public.offers o
        join public.businesses b on b.id = o.business_id
       where o.id = offer_branches.offer_id
         and b.owner_id = auth.uid()
         and b.status = 'approved'
    )
  )
  with check (
    exists (
      select 1 from public.offers o
        join public.businesses b on b.id = o.business_id
       where o.id = offer_branches.offer_id
         and b.owner_id = auth.uid()
         and b.status = 'approved'
    )
  );

drop policy if exists offer_branches_admin_all on public.offer_branches;
create policy offer_branches_admin_all on public.offer_branches
  for all using (public.is_admin()) with check (public.is_admin());
