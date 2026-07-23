// ============================================================
// OfferCeylon — hand-written DB types (mirrors supabase/migrations).
// Keep in sync with the SQL, or later regenerate with:
//   npx supabase gen types typescript --project-id <ref> > lib/database.types.ts
// ============================================================

export type OfferStatus = 'draft' | 'pending' | 'approved' | 'expired' | 'rejected';
export type SubscriptionTier = 'free' | 'featured' | 'premium';
export type BusinessStatus = 'pending' | 'approved' | 'rejected';

export interface Business {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
  website: string | null;
  city: string | null;
  address: string | null;
  verified: boolean;
  subscription_tier: SubscriptionTier;
  owner_id: string | null;
  status: BusinessStatus;
  created_at: string;
}

export interface Branch {
  id: string;
  business_id: string;
  label: string | null;
  district: string;
  city: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  is_primary: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
}

export interface Offer {
  id: string;
  business_id: string | null;
  category_id: number | null;
  title: string;
  description: string | null;
  poster_url: string | null;
  poster_thumb_url: string | null;
  poster_path: string | null;
  poster_thumb_path: string | null;
  city: string | null;
  location_note: string | null;
  promo_code: string | null;
  start_date: string | null;
  end_date: string;
  status: OfferStatus;
  is_featured: boolean;
  view_count: number;
  lead_count: number;
  redemption_count: number;
  submitted_by_email: string | null;
  created_at: string;
  approved_at: string | null;
}

export interface Admin {
  id: string;
  email: string | null;
  role: 'admin' | 'superadmin';
  created_at: string;
}
