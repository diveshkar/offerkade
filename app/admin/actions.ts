'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { uploadPoster, deletePoster } from '@/lib/image/upload';
import { getCurrentAdmin } from '@/lib/queries/admin';
import { emailShopApproved, emailShopRejected } from '@/lib/email';
import type { Branch, Business, Offer } from '@/lib/database.types';

// Every action re-checks admin on the server. RLS also enforces it, but this
// fails fast with a redirect instead of a silent no-op.
async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/login');
  return createSupabaseServerClient();
}

function refresh() {
  revalidatePath('/admin');
  revalidatePath('/admin/shops');
  revalidatePath('/admin/offers');
  revalidatePath('/'); // public feed changes when shops/offers change
}

/** Approve a shop. Trigger 010 also sets verified = true automatically. */
export async function approveShop(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const supabase = await requireAdmin();
  const { data: shop } = await supabase
    .from('businesses')
    .select('name, contact_email')
    .eq('id', id)
    .maybeSingle();
  await supabase
    .from('businesses')
    .update({ status: 'approved', rejection_reason: null })
    .eq('id', id);
  if (shop) await emailShopApproved({ name: shop.name, email: shop.contact_email });
  refresh();
}

/** Reject a shop with a reason shown on their dashboard. */
export async function rejectShop(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();
  if (!id) return;
  const supabase = await requireAdmin();
  const { data: shop } = await supabase
    .from('businesses')
    .select('name, contact_email')
    .eq('id', id)
    .maybeSingle();
  const finalReason = reason || 'Not approved.';
  await supabase
    .from('businesses')
    .update({ status: 'rejected', rejection_reason: finalReason })
    .eq('id', id);
  if (shop) await emailShopRejected({ name: shop.name, email: shop.contact_email, reason: finalReason });
  refresh();
}

/** Suspend an approved shop. Its offers vanish from the public feed (RLS). */
export async function suspendShop(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();
  if (!id) return;
  const supabase = await requireAdmin();
  await supabase
    .from('businesses')
    .update({ status: 'suspended', rejection_reason: reason || null })
    .eq('id', id);
  refresh();
}

/** Lift a suspension: back to approved (and re-verified by the trigger). */
export async function reinstateShop(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const supabase = await requireAdmin();
  await supabase
    .from('businesses')
    .update({ status: 'approved', rejection_reason: null })
    .eq('id', id);
  refresh();
}

/** Permanently delete a shop and everything under it (offers, branches, posters). */
export async function deleteShop(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await requireAdmin();

  // Grab poster paths first so we can clean storage after the cascade delete.
  const { data: offers } = await supabaseAdmin
    .from('offers')
    .select('poster_path, poster_thumb_path')
    .eq('business_id', id);

  // Deleting the business cascades to its offers, branches and offer_branches.
  await supabaseAdmin.from('businesses').delete().eq('id', id);

  for (const o of offers ?? []) {
    if (o.poster_path || o.poster_thumb_path) {
      await deletePoster(o.poster_path ?? '', o.poster_thumb_path ?? '').catch(() => {});
    }
  }
  refresh();
  redirect('/admin/shops');
}

/** Permanently remove an offer (and its stored poster). */
export async function removeOffer(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const supabase = await requireAdmin();

  const { data: offer } = await supabase
    .from('offers')
    .select('poster_path, poster_thumb_path')
    .eq('id', id)
    .maybeSingle();

  await supabase.from('offers').delete().eq('id', id);

  if (offer?.poster_path || offer?.poster_thumb_path) {
    const { deletePoster } = await import('@/lib/image/upload');
    await deletePoster(offer.poster_path ?? '', offer.poster_thumb_path ?? '').catch(() => {});
  }
  refresh();
}

/** Force an offer to expire now: hides it from the public without deleting. */
export async function expireOffer(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const supabase = await requireAdmin();
  await supabase.from('offers').update({ status: 'expired' }).eq('id', id);
  refresh();
}

/** Toggle an offer's featured (pinned) flag. */
export async function toggleFeatured(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const featured = String(formData.get('featured') ?? '') === 'true';
  if (!id) return;
  const supabase = await requireAdmin();
  await supabase.from('offers').update({ is_featured: !featured }).eq('id', id);
  refresh();
}

/** Toggle the tourist / foreign-visitor flag on any offer. Admin only. */
export async function toggleTourist(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const current = String(formData.get('tourist') ?? '') === 'true';
  if (!id) return;
  const supabase = await requireAdmin();
  await supabase.from('offers').update({ tourist_friendly: !current }).eq('id', id);
  refresh();
}

// ============================================================
// Quick-add / edit an offer as an admin, and edit a shop's details.
// Writes go through the service role (supabaseAdmin) so an admin can act
// on any shop's offers; the admin identity is verified first.
// ============================================================

const todayStr = () => new Date().toISOString().slice(0, 10);

function promoCode(name: string) {
  const prefix = name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'DEAL';
  return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
}

function normalizeWebsite(v: string): string | null {
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export interface AdminFormState {
  error?: string;
}

/**
 * Create (quick-add) or edit an offer as an admin.
 * Passing `offer_id` edits an existing offer of any status; otherwise a new
 * offer is created live (status 'approved') for the chosen shop.
 */
export async function saveAdminOffer(formData: FormData): Promise<AdminFormState | void> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/login');

  const offerId = String(formData.get('offer_id') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const categoryIdRaw = Number(formData.get('category_id') ?? 0);
  const categoryId = categoryIdRaw > 0 ? categoryIdRaw : null;
  const description = String(formData.get('description') ?? '').trim();
  // Only used as a fallback when the shop has no branches on record.
  const fallbackCity = String(formData.get('city') ?? '').trim();
  const startDate = String(formData.get('start_date') ?? '').trim();
  const endDate = String(formData.get('end_date') ?? '').trim();
  const isFeatured = String(formData.get('is_featured') ?? '') === 'true';
  const poster = formData.get('poster');
  const thumb = formData.get('thumb');
  const hasNewPoster = poster instanceof File && thumb instanceof File && poster.size > 0;

  let requestedBranchIds: string[] = [];
  try {
    requestedBranchIds = JSON.parse(String(formData.get('branch_ids') ?? '[]'));
  } catch {
    requestedBranchIds = [];
  }

  // ---- validation ----
  if (title.length < 5) return { error: 'Give the offer a title of at least 5 characters.' };
  if (!categoryId) return { error: 'Choose a category.' };
  if (!endDate) return { error: 'Choose the day this offer ends.' };
  if (endDate < todayStr()) return { error: 'The end date cannot be in the past.' };
  if (startDate && endDate < startDate) {
    return { error: 'The end date must be on or after the start date.' };
  }

  // ---- existing offer (edit) ----
  let existing: Offer | null = null;
  if (offerId) {
    const { data } = await supabaseAdmin.from('offers').select('*').eq('id', offerId).maybeSingle();
    existing = (data as Offer) ?? null;
    if (!existing) return { error: 'That offer could not be found.' };
  }

  // ---- target shop ----
  const targetBusinessId = existing ? existing.business_id : String(formData.get('business_id') ?? '').trim();
  if (!targetBusinessId) return { error: 'Choose the shop this offer belongs to.' };
  const { data: bizData } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', targetBusinessId)
    .maybeSingle();
  const business = bizData as Business | null;
  if (!business) return { error: 'That shop could not be found.' };

  // ---- branches drive the offer's location (mirrors the shop's own flow) ----
  const { data: branchData } = await supabaseAdmin
    .from('branches')
    .select('*')
    .eq('business_id', business.id);
  const allBranches = (branchData ?? []) as Branch[];
  const chosen = allBranches.filter((b) => requestedBranchIds.includes(b.id));

  if (allBranches.length > 1 && chosen.length === 0) {
    return { error: 'Choose at least one branch for this offer.' };
  }
  // When none are explicitly chosen (single branch, or none on record) fall
  // back to every branch the shop has.
  const linked = chosen.length > 0 ? chosen : allBranches;

  const city = linked[0]?.district || fallbackCity || business.city || '';
  if (!city) return { error: 'Choose a district for this offer.' };

  const locationNote =
    linked.length > 1
      ? `${linked.length} branches`
      : linked[0]
        ? [linked[0].label, linked[0].city, linked[0].district].filter(Boolean).join(', ')
        : null;

  // ---- poster (required on create; kept on edit unless replaced) ----
  let uploaded: Awaited<ReturnType<typeof uploadPoster>> | null = null;
  if (hasNewPoster) {
    try {
      uploaded = await uploadPoster(poster as File, thumb as File);
    } catch {
      return { error: 'The poster could not be uploaded. Please try again.' };
    }
  } else if (!existing?.poster_url) {
    return { error: 'Please choose a poster image.' };
  }

  const fields = {
    category_id: categoryId,
    title,
    description: description || null,
    city,
    location_note: locationNote,
    start_date: startDate || existing?.start_date || todayStr(),
    end_date: endDate,
    // Editing keeps the offer's current status; a new quick-add goes live.
    status: existing ? existing.status : 'approved',
    is_featured: isFeatured,
    approved_at: existing?.approved_at ?? new Date().toISOString(),
    ...(uploaded ?? {}),
  };

  let savedId = offerId;

  if (existing) {
    const { error } = await supabaseAdmin.from('offers').update(fields).eq('id', existing.id);
    if (error) return { error: 'The offer could not be saved. Please try again.' };
    // Replace branch links so edits take effect.
    await supabaseAdmin.from('offer_branches').delete().eq('offer_id', existing.id);
    // Best-effort cleanup of the replaced poster.
    if (uploaded && existing.poster_path) {
      try {
        await deletePoster(existing.poster_path, existing.poster_thumb_path ?? existing.poster_path);
      } catch {
        // Non-fatal.
      }
    }
  } else {
    const { data: created, error } = await supabaseAdmin
      .from('offers')
      .insert({
        business_id: business.id,
        promo_code: promoCode(business.name),
        submitted_by_email: business.contact_email,
        ...fields,
      })
      .select('id')
      .single();
    if (error || !created) return { error: 'The offer could not be saved. Please try again.' };
    savedId = created.id as string;
  }

  if (savedId && linked.length > 0) {
    await supabaseAdmin
      .from('offer_branches')
      .insert(linked.map((b) => ({ offer_id: savedId, branch_id: b.id })));
  }

  refresh();
  redirect('/admin/offers');
}

/** Ensure the "OfferCeylon" house business exists (used for curated offers). */
async function ensureHouseBusiness(): Promise<string> {
  const { data } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('slug', 'offerceylon')
    .maybeSingle();
  if (data?.id) return data.id as string;

  const { data: created, error } = await supabaseAdmin
    .from('businesses')
    .insert({
      name: 'OfferCeylon',
      slug: 'offerceylon',
      contact_email: 'admin@offerceylon.com',
      status: 'approved',
    })
    .select('id')
    .single();
  if (error || !created) throw new Error('Could not create the OfferCeylon house account.');
  return created.id as string;
}

/**
 * Post an offer the admin found somewhere, WITHOUT a shop registering.
 * Owned by the OfferCeylon house account; the real venue goes in source_name,
 * so the public pages show the venue and attribute the post to OfferCeylon.
 */
export async function postCuratedOffer(formData: FormData): Promise<AdminFormState | void> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/login');

  const title = String(formData.get('title') ?? '').trim();
  const sourceName = String(formData.get('source_name') ?? '').trim();
  const categoryId = Number(formData.get('category_id') ?? 0) || null;
  const city = String(formData.get('city') ?? '').trim();
  const locationNote = String(formData.get('location_note') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const startDate = String(formData.get('start_date') ?? '').trim();
  const endDate = String(formData.get('end_date') ?? '').trim();
  const touristFriendly = String(formData.get('tourist_friendly') ?? '') === 'true';
  const poster = formData.get('poster');
  const thumb = formData.get('thumb');
  const hasPoster = poster instanceof File && thumb instanceof File && poster.size > 0;

  if (title.length < 5) return { error: 'Give the offer a title of at least 5 characters.' };
  if (!sourceName) return { error: 'Enter the shop / venue name this offer is for.' };
  if (!categoryId) return { error: 'Choose a category.' };
  if (!city) return { error: 'Choose a district.' };
  if (!endDate) return { error: 'Choose the day this offer ends.' };
  if (endDate < todayStr()) return { error: 'The end date cannot be in the past.' };
  if (startDate && endDate < startDate) {
    return { error: 'The end date must be on or after the start date.' };
  }

  let uploaded: Awaited<ReturnType<typeof uploadPoster>> | null = null;
  if (hasPoster) {
    try {
      uploaded = await uploadPoster(poster as File, thumb as File);
    } catch {
      return { error: 'The poster could not be uploaded. Please try again.' };
    }
  }

  const houseId = await ensureHouseBusiness();

  const { error } = await supabaseAdmin.from('offers').insert({
    business_id: houseId,
    category_id: categoryId,
    title,
    description: description || null,
    source_name: sourceName,
    tourist_friendly: touristFriendly,
    city,
    location_note: locationNote || null,
    promo_code: promoCode(sourceName),
    start_date: startDate || todayStr(),
    end_date: endDate,
    status: 'approved',
    approved_at: new Date().toISOString(),
    submitted_by_email: 'curated@offerceylon.com',
    ...(uploaded ?? {}),
  });
  if (error) return { error: 'The offer could not be saved. Please try again.' };

  refresh();
  redirect('/admin/offers');
}

/** Edit a shop's contact details as an admin (not status/verified/owner). */
export async function saveBusiness(formData: FormData): Promise<AdminFormState | void> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/login');

  const id = String(formData.get('id') ?? '').trim();
  if (!id) return { error: 'Missing shop id.' };

  const name = String(formData.get('name') ?? '').trim();
  if (name.length < 2) return { error: 'The shop needs a name.' };

  const fields = {
    name,
    contact_email: String(formData.get('contact_email') ?? '').trim() || null,
    contact_phone: String(formData.get('contact_phone') ?? '').trim() || null,
    whatsapp: String(formData.get('whatsapp') ?? '').trim() || null,
    website: normalizeWebsite(String(formData.get('website') ?? '').trim()),
    city: String(formData.get('city') ?? '').trim() || null,
    address: String(formData.get('address') ?? '').trim() || null,
  };

  const { error } = await supabaseAdmin.from('businesses').update(fields).eq('id', id);
  if (error) return { error: 'Could not save the shop. Please try again.' };

  refresh();
  redirect('/admin/shops');
}
