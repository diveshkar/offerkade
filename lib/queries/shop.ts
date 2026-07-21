import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Branch, Business, Category } from '@/lib/database.types';
import type { OfferWithRelations } from '@/lib/queries/offers';

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
