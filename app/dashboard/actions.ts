'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { deletePoster } from '@/lib/image/upload';

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function deleteOffer(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from('offers').delete().eq('id', id);
  revalidatePath('/dashboard');
}

export interface ShopFormState {
  error?: string;
}

function normalizeWebsite(v: string): string | null {
  const t = v.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  return t ? `https://${t}` : null;
}

/** Return the current user's business id, or null. Used to scope owner edits. */
async function myBusinessId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Shop owner edits their own details. Writes via service role AFTER confirming
 * the row belongs to them, and never touches status/verified/owner_id.
 */
export async function updateMyShop(formData: FormData): Promise<ShopFormState | void> {
  const bizId = await myBusinessId();
  if (!bizId) redirect('/login');

  const name = String(formData.get('name') ?? '').trim();
  if (name.length < 2) return { error: 'The shop needs a name.' };

  const fields = {
    name,
    contact_email: String(formData.get('contact_email') ?? '').trim() || null,
    contact_phone: String(formData.get('contact_phone') ?? '').trim() || null,
    whatsapp: String(formData.get('whatsapp') ?? '').trim() || null,
    website: normalizeWebsite(String(formData.get('website') ?? '')),
    city: String(formData.get('city') ?? '').trim() || null,
    address: String(formData.get('address') ?? '').trim() || null,
  };

  const { error } = await supabaseAdmin.from('businesses').update(fields).eq('id', bizId);
  if (error) return { error: 'Could not save your details. Please try again.' };

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard');
  redirect('/dashboard/settings?saved=1');
}

/** Shop owner deletes their own shop (and its offers/branches/posters). */
export async function deleteMyShop(): Promise<void> {
  const bizId = await myBusinessId();
  if (!bizId) redirect('/login');

  const { data: offers } = await supabaseAdmin
    .from('offers')
    .select('poster_path, poster_thumb_path')
    .eq('business_id', bizId);

  await supabaseAdmin.from('businesses').delete().eq('id', bizId);

  for (const o of offers ?? []) {
    if (o.poster_path || o.poster_thumb_path) {
      await deletePoster(o.poster_path ?? '', o.poster_thumb_path ?? '').catch(() => {});
    }
  }
  // No shop left → onboarding will let them start again.
  redirect('/onboarding');
}
