'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { uploadPoster } from '@/lib/image/upload';
import type { Branch, Business } from '@/lib/database.types';

export interface CreateOfferState {
  error?: string;
}

function promoCode(name: string) {
  const prefix = name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'DEAL';
  return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function createOffer(formData: FormData): Promise<CreateOfferState | void> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  const shop = business as Business | null;
  if (!shop || shop.status !== 'approved') {
    return { error: 'Your shop must be approved before you can post offers.' };
  }

  const title = String(formData.get('title') ?? '').trim();
  const categoryId = Number(formData.get('category_id') ?? 0);
  const description = String(formData.get('description') ?? '').trim();
  const startDate = String(formData.get('start_date') ?? '').trim();
  const endDate = String(formData.get('end_date') ?? '').trim();
  const poster = formData.get('poster');
  const thumb = formData.get('thumb');

  if (title.length < 5) return { error: 'Give the offer a title of at least 5 characters.' };
  if (!categoryId) return { error: 'Choose a category.' };
  if (!endDate) return { error: 'Choose the day this offer ends.' };
  if (endDate < new Date().toISOString().slice(0, 10)) {
    return { error: 'The end date cannot be in the past.' };
  }
  if (startDate && endDate < startDate) {
    return { error: 'The end date must follow the start date.' };
  }
  if (!(poster instanceof File) || !(thumb instanceof File) || poster.size === 0) {
    return { error: 'Please choose a poster image.' };
  }

  const { data: ownBranches } = await supabaseAdmin
    .from('branches')
    .select('*')
    .eq('business_id', shop.id);

  const all = (ownBranches ?? []) as Branch[];

  let requested: string[] = [];
  try {
    requested = JSON.parse(String(formData.get('branch_ids') ?? '[]'));
  } catch {
    requested = [];
  }

  // Only ever accept branches this shop owns.
  const chosen = all.filter((b) => requested.includes(b.id));
  const linked = chosen.length > 0 ? chosen : all;

  if (all.length > 1 && chosen.length === 0) {
    return { error: 'Choose at least one branch for this offer.' };
  }

  const city = linked[0]?.district ?? shop.city ?? '';
  const locationNote =
    linked.length > 1
      ? `${linked.length} branches`
      : linked[0]
        ? [linked[0].label, linked[0].city, linked[0].district].filter(Boolean).join(', ')
        : null;

  let uploaded;
  try {
    uploaded = await uploadPoster(poster, thumb);
  } catch {
    return { error: 'The poster could not be uploaded. Please try again.' };
  }

  const { data: created, error } = await supabaseAdmin
    .from('offers')
    .insert({
      business_id: shop.id,
      category_id: categoryId,
      title,
      description: description || null,
      city,
      location_note: locationNote,
      start_date: startDate || new Date().toISOString().slice(0, 10),
      end_date: endDate,
      status: 'approved',
      promo_code: promoCode(shop.name),
      submitted_by_email: shop.contact_email,
      approved_at: new Date().toISOString(),
      ...uploaded,
    })
    .select('id')
    .single();

  if (error || !created) return { error: 'The offer could not be saved. Please try again.' };

  if (linked.length > 0) {
    await supabaseAdmin
      .from('offer_branches')
      .insert(linked.map((b) => ({ offer_id: created.id, branch_id: b.id })));
  }

  revalidatePath('/dashboard');
  revalidatePath('/');
  redirect('/dashboard');
}
