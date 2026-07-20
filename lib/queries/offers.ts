// ============================================================
// OfferCeylon — Phase 4 — Public data access.
// Server-side reads via the anon client. RLS guarantees only
// approved, non-expired offers come back — no status filtering
// needed here, but we order featured-first, newest-first.
// ============================================================
import { supabase } from '@/lib/supabase/client';
import type { Business, Category, Offer } from '@/lib/database.types';

/** An offer joined with its business + category, as the public pages need it. */
export interface OfferWithRelations extends Offer {
  business: Pick<
    Business,
    'id' | 'name' | 'slug' | 'logo_url' | 'contact_phone' | 'whatsapp' | 'website' | 'city' | 'verified'
  > | null;
  category: Pick<Category, 'id' | 'name' | 'slug' | 'icon'> | null;
}

const OFFER_SELECT =
  '*, business:businesses(id,name,slug,logo_url,contact_phone,whatsapp,website,city,verified), category:categories(id,name,slug,icon)';

export interface OfferFilters {
  categorySlug?: string;
  city?: string;
  endingSoon?: boolean; // end_date within 2 days
  search?: string;
  page?: number; // 1-based
  pageSize?: number; // default 8
}

export interface OfferPage {
  offers: OfferWithRelations[];
  total: number; // total matching offers, across all pages
  page: number; // current 1-based page (clamped into range)
  pageSize: number;
  totalPages: number;
}

export const OFFERS_PER_PAGE = 8;

/** All categories, in display order. */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Distinct cities that currently have live offers (for the city filter). */
export async function getActiveCities(): Promise<string[]> {
  const { data, error } = await supabase
    .from('offers')
    .select('city')
    .not('city', 'is', null);
  if (error) throw new Error(error.message);
  const set = new Set((data ?? []).map((r) => r.city as string).filter(Boolean));
  return [...set].sort();
}

/**
 * List live offers, featured-first then newest, with optional filters,
 * paginated (default 8 per page). The category filter lives on the joined
 * table so we filter in JS, then page over the result — fine at this scale.
 */
export async function listOffers(filters: OfferFilters = {}): Promise<OfferPage> {
  let q = supabase
    .from('offers')
    .select(OFFER_SELECT)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (filters.city) q = q.eq('city', filters.city);
  if (filters.endingSoon) {
    const in2days = new Date();
    in2days.setDate(in2days.getDate() + 2);
    q = q.lte('end_date', in2days.toISOString().slice(0, 10));
  }
  if (filters.search) {
    const s = filters.search.replace(/[%,]/g, ' ').trim();
    if (s) q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  let rows = (data ?? []) as unknown as OfferWithRelations[];

  // Category filter is on the joined table; apply in JS to keep the query simple.
  if (filters.categorySlug) {
    rows = rows.filter((o) => o.category?.slug === filters.categorySlug);
  }

  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : OFFERS_PER_PAGE;
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, filters.page ?? 1), totalPages);
  const start = (page - 1) * pageSize;

  return { offers: rows.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

/** A single offer by id (null if not found / not public). */
export async function getOfferById(id: string): Promise<OfferWithRelations | null> {
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as OfferWithRelations) ?? null;
}

/** A business by slug + its live offers. */
export async function getBusinessBySlug(
  slug: string,
): Promise<{ business: Business; offers: OfferWithRelations[] } | null> {
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!business) return null;

  const { data: offers, error: oErr } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .eq('business_id', business.id)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (oErr) throw new Error(oErr.message);

  return {
    business: business as Business,
    offers: (offers ?? []) as unknown as OfferWithRelations[],
  };
}

/** Bump an offer's view_count via the SECURITY DEFINER RPC (Phase 2). */
export async function bumpViewCount(offerId: string): Promise<void> {
  await supabase.rpc('bump_view_count', { p_offer_id: offerId });
}

/** Days until an offer ends. <= 2 → "expiring soon", < 0 → expired. */
export function daysLeft(endDate: string): number {
  const end = new Date(endDate + 'T23:59:59');
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
