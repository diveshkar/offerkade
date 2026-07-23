import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Branch, Business, Category, Offer } from '@/lib/database.types';
import type { OfferWithRelations } from '@/lib/queries/offers';

/** A shop's own offer plus the branch ids it runs at — for the edit form. */
export interface EditableOffer {
  offer: Offer;
  branchIds: string[];
}

/**
 * Load one of the current shop's offers for editing, with its linked branch
 * ids. RLS scopes this to the owner, so it returns null for anyone else's
 * offer. Returns null if the offer does not exist.
 */
export async function getMyOfferForEdit(
  businessId: string,
  offerId: string,
): Promise<EditableOffer | null> {
  const supabase = await createSupabaseServerClient();

  const { data: offer } = await supabase
    .from('offers')
    .select('*')
    .eq('id', offerId)
    .eq('business_id', businessId)
    .maybeSingle();

  if (!offer) return null;

  const { data: links } = await supabase
    .from('offer_branches')
    .select('branch_id')
    .eq('offer_id', offerId);

  return {
    offer: offer as Offer,
    branchIds: (links ?? []).map((r) => r.branch_id as string),
  };
}

export async function getMyBusiness(): Promise<Business | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  return (data as Business) ?? null;
}

export async function getMyOffers(businessId: string): Promise<OfferWithRelations[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('offers')
    .select('*, category:categories(id,name,slug,icon)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  return (data ?? []) as unknown as OfferWithRelations[];
}

export async function getMyBranches(businessId: string): Promise<Branch[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('branches')
    .select('*')
    .eq('business_id', businessId)
    .order('is_primary', { ascending: false })
    .order('created_at');

  return (data ?? []) as Branch[];
}

export async function getCategoriesForForm(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('categories').select('*').order('sort_order');
  return (data ?? []) as Category[];
}
