'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isDistrict } from '@/lib/sri-lanka';
import type { Business } from '@/lib/database.types';

export interface BranchState {
  error?: string;
}

async function ownedShop(): Promise<Business | null> {
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

export async function saveBranch(formData: FormData): Promise<BranchState> {
  const shop = await ownedShop();
  if (!shop) return { error: 'Your session expired. Please sign in again.' };

  const id = String(formData.get('id') ?? '').trim();
  const district = String(formData.get('district') ?? '').trim();
  const label = String(formData.get('label') ?? '').trim();
  const city = String(formData.get('city') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();

  if (!isDistrict(district)) return { error: 'Choose a district for this branch.' };

  const row = {
    label: label || null,
    district,
    city: city || null,
    address: address || null,
  };

  if (id) {
    const { error } = await supabaseAdmin
      .from('branches')
      .update(row)
      .eq('id', id)
      .eq('business_id', shop.id);
    if (error) return { error: 'That branch could not be saved. Please try again.' };
  } else {
    const { count } = await supabaseAdmin
      .from('branches')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', shop.id);

    const { error } = await supabaseAdmin
      .from('branches')
      .insert({ ...row, business_id: shop.id, is_primary: (count ?? 0) === 0 });
    if (error) return { error: 'That branch could not be added. Please try again.' };
  }

  revalidatePath('/dashboard/branches');
  revalidatePath('/offers/new');
  return {};
}

export async function deleteBranch(formData: FormData): Promise<BranchState> {
  const shop = await ownedShop();
  if (!shop) return { error: 'Your session expired. Please sign in again.' };

  const id = String(formData.get('id') ?? '').trim();

  const { count } = await supabaseAdmin
    .from('branches')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', shop.id);

  if ((count ?? 0) <= 1) {
    return { error: 'Keep at least one branch so shoppers know where to go.' };
  }

  const { data: removed } = await supabaseAdmin
    .from('branches')
    .delete()
    .eq('id', id)
    .eq('business_id', shop.id)
    .select('is_primary')
    .maybeSingle();

  // Promote another branch if the primary one went.
  if (removed?.is_primary) {
    const { data: next } = await supabaseAdmin
      .from('branches')
      .select('id')
      .eq('business_id', shop.id)
      .order('created_at')
      .limit(1)
      .maybeSingle();
    if (next) await supabaseAdmin.from('branches').update({ is_primary: true }).eq('id', next.id);
  }

  revalidatePath('/dashboard/branches');
  revalidatePath('/offers/new');
  return {};
}

export async function makePrimary(formData: FormData): Promise<BranchState> {
  const shop = await ownedShop();
  if (!shop) return { error: 'Your session expired. Please sign in again.' };

  const id = String(formData.get('id') ?? '').trim();
  await supabaseAdmin
    .from('branches')
    .update({ is_primary: true })
    .eq('id', id)
    .eq('business_id', shop.id);

  revalidatePath('/dashboard/branches');
  return {};
}
