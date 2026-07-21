-- ============================================================
-- OfferCeylon : Phase 5 : Migration 010 : Verify on approval
-- Run after 009_offer_branches.sql.
--
-- Approving a shop now marks it verified in the same step, so an
-- admin has one action instead of two. `verified` becomes a mirror
-- of `status = 'approved'` and is no longer set by hand.
-- ============================================================

create or replace function public.sync_verified_with_status()
returns trigger
language plpgsql
as $$
begin
  new.verified := (new.status = 'approved');
  return new;
end;
$$;

drop trigger if exists businesses_sync_verified on public.businesses;
create trigger businesses_sync_verified
  before insert or update of status on public.businesses
  for each row execute function public.sync_verified_with_status();

-- Bring existing rows in line.
update public.businesses
   set verified = (status = 'approved')
 where verified is distinct from (status = 'approved');
