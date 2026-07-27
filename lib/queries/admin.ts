// ============================================================
// OfferCeylon — Phase 6 — Admin data access.
// All reads run as the logged-in user; RLS (is_admin()) lets admins
// see every shop and offer. Non-admins get nothing.
// ============================================================
import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Admin, Branch, Business, Offer, OfferStatus } from '@/lib/database.types';

/** The admin record for the current user, or null if they aren't an admin. */
export async function getCurrentAdmin(): Promise<Admin | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from('admins').select('*').eq('id', user.id).maybeSingle();
  return (data as Admin) ?? null;
}

export type ShopWithCount = Business & { offer_count: number };

/** Shops filtered by status (default: all), newest first, with offer counts. */
export async function listShops(status?: Business['status']): Promise<ShopWithCount[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from('businesses')
    .select('*, offers(count)')
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((b) => {
    const { offers, ...rest } = b as Business & { offers: { count: number }[] };
    return { ...(rest as Business), offer_count: offers?.[0]?.count ?? 0 };
  });
}

export type OfferWithShop = Offer & {
  business: Pick<Business, 'id' | 'name' | 'slug' | 'status'> | null;
};

/** Offers (any status) for moderation, newest first, with their shop.
    Optionally filter by status and/or a title search. */
export async function listAllOffers(opts?: {
  status?: OfferStatus;
  q?: string;
}): Promise<OfferWithShop[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('offers')
    .select('*, business:businesses(id,name,slug,status)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (opts?.status) query = query.eq('status', opts.status);
  if (opts?.q) query = query.ilike('title', `%${opts.q}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as OfferWithShop[];
  // Expired offers sink to the bottom; the DB already returned newest-first, and
  // Array.sort is stable, so that order is preserved within each group.
  return rows.sort((a, b) => Number(a.status === 'expired') - Number(b.status === 'expired'));
}

/** A single offer with its shop, for the admin edit screen. */
export async function getAdminOffer(id: string): Promise<OfferWithShop | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('offers')
    .select('*, business:businesses(id,name,slug,status)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as OfferWithShop) ?? null;
}

export interface ShopForOffer {
  id: string;
  name: string;
  city: string | null;
  branches: Branch[];
}

function sortBranches(list: Branch[]): Branch[] {
  return [...list].sort(
    (a, b) =>
      Number(b.is_primary) - Number(a.is_primary) || a.created_at.localeCompare(b.created_at),
  );
}

/** Approved shops with their branches, for the quick-add shop picker. */
export async function listApprovedShopsForOffer(): Promise<ShopForOffer[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, city, branches(*)')
    .eq('status', 'approved')
    .order('name');
  if (error) throw new Error(error.message);
  return (data ?? []).map((b) => {
    const row = b as unknown as { id: string; name: string; city: string | null; branches: Branch[] };
    return { id: row.id, name: row.name, city: row.city, branches: sortBranches(row.branches ?? []) };
  });
}

/** A shop's branches (primary first), for the admin offer edit form. */
export async function getBusinessBranches(businessId: string): Promise<Branch[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('business_id', businessId)
    .order('is_primary', { ascending: false })
    .order('created_at');
  if (error) throw new Error(error.message);
  return (data ?? []) as Branch[];
}

/** The branch ids an offer currently runs at, for pre-filling the edit form. */
export async function getOfferBranchIds(offerId: string): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('offer_branches')
    .select('branch_id')
    .eq('offer_id', offerId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => (r as { branch_id: string }).branch_id);
}

/** A single shop by id, for the admin edit screen. */
export async function getBusinessById(id: string): Promise<Business | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('businesses').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Business) ?? null;
}

/** Top offers by views, with their shop, for the overview leaderboard. */
export async function getTopOffers(limit = 5): Promise<OfferWithShop[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('offers')
    .select('*, business:businesses(id,name,slug,status)')
    .neq('status', 'expired') // leaderboard shows live/active offers, not expired ones
    .order('view_count', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as OfferWithShop[];
}

/** Headline counts for the admin overview. */
export async function getAdminStats() {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const head = { count: 'exact' as const, head: true };

  const [pendingShops, approvedShops, liveOffers, counts, durable] = await Promise.all([
    supabase.from('businesses').select('*', head).eq('status', 'pending'),
    supabase.from('businesses').select('*', head).eq('status', 'approved'),
    supabase.from('offers').select('*', head).eq('status', 'approved').gte('end_date', today),
    // View / lead totals on rows that still exist: summed in JS. Fine at this scale.
    supabase.from('offers').select('view_count, lead_count'),
    // Durable lifetime counters (migration 013): survive delete + auto-expiry.
    supabase.from('businesses').select('total_published, lifetime_views, lifetime_leads'),
  ]);

  const rows = (counts.data ?? []) as { view_count: number | null; lead_count: number | null }[];
  const liveViews = rows.reduce((sum, o) => sum + (o.view_count ?? 0), 0);
  const liveLeads = rows.reduce((sum, o) => sum + (o.lead_count ?? 0), 0);

  const dRows = (durable.data ?? []) as {
    total_published: number | null;
    lifetime_views: number | null;
    lifetime_leads: number | null;
  }[];
  const publishedAllTime = dRows.reduce((s, b) => s + (b.total_published ?? 0), 0);
  const totalViews = dRows.reduce((s, b) => s + (b.lifetime_views ?? 0), 0) + liveViews;
  const totalLeads = dRows.reduce((s, b) => s + (b.lifetime_leads ?? 0), 0) + liveLeads;

  return {
    pendingShops: pendingShops.count ?? 0,
    approvedShops: approvedShops.count ?? 0,
    // All-time published (durable) — only ever goes up, unlike a live row count.
    publishedAllTime,
    liveOffers: liveOffers.count ?? 0,
    totalViews,
    totalLeads,
  };
}
