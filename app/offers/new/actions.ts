'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { uploadPoster, deletePoster } from '@/lib/image/upload';
import type { Branch, Business, Offer } from '@/lib/database.types';

export interface CreateOfferState {
  error?: string;
}

function promoCode(name: string) {
  const prefix = name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'DEAL';
  return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
}

const today = () => new Date().toISOString().slice(0, 10);

/** Drafts can be saved before an end date is chosen; keep the NOT NULL column
    valid with a placeholder the shop replaces when they publish. */
function placeholderEndDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

/**
 * Create or update an offer. `intent` decides the lifecycle:
 *   - 'draft'   → saved as status 'draft' (hidden from the public site), light
 *                 validation, editable later.
 *   - 'publish' → validated fully and saved as 'approved' (live immediately).
 * Passing `offer_id` edits an existing DRAFT; published offers are locked.
 */
export async function saveOffer(formData: FormData): Promise<CreateOfferState | void> {
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

  const intent = formData.get('intent') === 'draft' ? 'draft' : 'publish';
  const publishing = intent === 'publish';
  const offerId = String(formData.get('offer_id') ?? '').trim();

  // When editing, the offer must exist, belong to this shop, and still be a
  // draft — a published offer can never be edited.
  let existing: Offer | null = null;
  if (offerId) {
    const { data } = await supabaseAdmin
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .eq('business_id', shop.id)
      .maybeSingle();
    existing = (data as Offer) ?? null;
    if (!existing) return { error: 'That offer could not be found.' };
    if (existing.status !== 'draft') {
      return { error: 'Published offers cannot be edited.' };
    }
  }

  const title = String(formData.get('title') ?? '').trim();
  const categoryIdRaw = Number(formData.get('category_id') ?? 0);
  const categoryId = categoryIdRaw > 0 ? categoryIdRaw : null;
  const description = String(formData.get('description') ?? '').trim();
  const startDate = String(formData.get('start_date') ?? '').trim();
  const endDate = String(formData.get('end_date') ?? '').trim();
  const poster = formData.get('poster');
  const thumb = formData.get('thumb');
  const hasNewPoster = poster instanceof File && thumb instanceof File && poster.size > 0;

  // ---- validation ----
  if (title.length < 5) return { error: 'Give the offer a title of at least 5 characters.' };

  if (publishing) {
    if (!categoryId) return { error: 'Choose a category.' };
    if (!endDate) return { error: 'Choose the day this offer ends.' };
    if (endDate < today()) return { error: 'The end date cannot be in the past.' };
    if (startDate && endDate < startDate) {
      return { error: 'The end date must follow the start date.' };
    }
    if (!hasNewPoster && !existing?.poster_url) {
      return { error: 'Please choose a poster image.' };
    }
  } else if (endDate && startDate && endDate < startDate) {
    return { error: 'The end date must follow the start date.' };
  }

  // ---- branches this shop owns ----
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
  const chosen = all.filter((b) => requested.includes(b.id));
  const linked = chosen.length > 0 ? chosen : all;

  if (publishing && all.length > 1 && chosen.length === 0) {
    return { error: 'Choose at least one branch for this offer.' };
  }

  const city = linked[0]?.district ?? shop.city ?? '';
  const locationNote =
    linked.length > 1
      ? `${linked.length} branches`
      : linked[0]
        ? [linked[0].label, linked[0].city, linked[0].district].filter(Boolean).join(', ')
        : null;

  // ---- poster upload (only when a new one was picked) ----
  let uploaded: Awaited<ReturnType<typeof uploadPoster>> | null = null;
  if (hasNewPoster) {
    try {
      uploaded = await uploadPoster(poster as File, thumb as File);
    } catch {
      return { error: 'The poster could not be uploaded. Please try again.' };
    }
  }

  const resolvedEndDate = endDate || existing?.end_date || placeholderEndDate();

  const fields = {
    category_id: categoryId,
    title,
    description: description || null,
    city,
    location_note: locationNote,
    start_date: startDate || existing?.start_date || today(),
    end_date: resolvedEndDate,
    status: publishing ? 'approved' : 'draft',
    approved_at: publishing ? new Date().toISOString() : null,
    ...(uploaded ?? {}),
  };

  let savedId = offerId;

  if (existing) {
    const { error } = await supabaseAdmin.from('offers').update(fields).eq('id', existing.id);
    if (error) return { error: 'The offer could not be saved. Please try again.' };

    // Replace branch links so edits take effect.
    await supabaseAdmin.from('offer_branches').delete().eq('offer_id', existing.id);

    // Best-effort cleanup of the old poster when a new one replaced it.
    if (uploaded && existing.poster_path) {
      try {
        await deletePoster(existing.poster_path, existing.poster_thumb_path ?? existing.poster_path);
      } catch {
        // Non-fatal: the nightly job can reap orphans.
      }
    }
  } else {
    const { data: created, error } = await supabaseAdmin
      .from('offers')
      .insert({
        business_id: shop.id,
        promo_code: promoCode(shop.name),
        submitted_by_email: shop.contact_email,
        ...fields,
      })
      .select('id')
      .single();
    if (error || !created) return { error: 'The offer could not be saved. Please try again.' };
    savedId = created.id;
  }

  if (savedId && linked.length > 0) {
    await supabaseAdmin
      .from('offer_branches')
      .insert(linked.map((b) => ({ offer_id: savedId, branch_id: b.id })));
  }

  revalidatePath('/dashboard');
  revalidatePath('/');
  redirect(publishing ? '/dashboard?published=1' : '/dashboard?draft=1');
}

/** Back-compat wrapper: the original create form posted to `createOffer`. */
export async function createOffer(formData: FormData): Promise<CreateOfferState | void> {
  return saveOffer(formData);
}
