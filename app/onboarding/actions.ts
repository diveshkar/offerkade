'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isDistrict } from '@/lib/sri-lanka';
import { normalizePhone } from '@/lib/phone';

export interface OnboardingState {
  error?: string;
}

interface BranchInput {
  label?: string;
  district: string;
  city?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
}

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `${base || 'shop'}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function completeOnboarding(formData: FormData): Promise<OnboardingState | void> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };

  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();
  if (existing) redirect('/dashboard');

  const name = String(formData.get('name') ?? '').trim();
  const phone = normalizePhone(String(formData.get('phone') ?? ''));
  const rawWhatsapp = String(formData.get('whatsapp') ?? '').trim();
  const whatsapp = rawWhatsapp ? normalizePhone(rawWhatsapp) : null;
  const website = String(formData.get('website') ?? '').trim();

  if (name.length < 2) return { error: 'Enter your shop name.' };
  if (!phone) return { error: 'Enter a valid Sri Lankan phone number.' };
  if (rawWhatsapp && !whatsapp) return { error: 'Enter a valid Sri Lankan WhatsApp number.' };
  if (website && !/^https?:\/\/\S+\.\S+/.test(website))
    return { error: 'Enter a full website address starting with https://' };

  let branches: BranchInput[] = [];
  try {
    branches = JSON.parse(String(formData.get('branches') ?? '[]'));
  } catch {
    return { error: 'Your branch details could not be read. Please try again.' };
  }

  branches = branches.filter((b) => b && isDistrict(b.district));
  if (branches.length === 0) return { error: 'Choose a district for your location.' };

  const { data: created, error: bizError } = await supabaseAdmin
    .from('businesses')
    .insert({
      name,
      slug: slugify(name),
      city: branches[0].district,
      contact_email: user.email,
      contact_phone: phone,
      whatsapp,
      website: website || null,
      owner_id: user.id,
      status: 'pending',
    })
    .select('id')
    .single();

  if (bizError || !created) return { error: 'Your shop could not be saved. Please try again.' };

  const { error: branchError } = await supabaseAdmin.from('branches').insert(
    branches.map((b, i) => ({
      business_id: created.id,
      label: b.label?.trim() || null,
      district: b.district,
      city: b.city?.trim() || null,
      address: b.address?.trim() || null,
      lat: b.lat ?? null,
      lng: b.lng ?? null,
      is_primary: i === 0,
    })),
  );

  if (branchError) return { error: 'Your branches could not be saved. Please try again.' };

  redirect('/dashboard');
}
