import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const BASE = 'https://offerceylon.lk';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/register',
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === '' ? 'daily' : 'monthly',
    priority: path === '' ? 1 : 0.5,
  }));

  // Live offers + businesses (RLS returns only public rows).
  const [{ data: offers }, { data: businesses }] = await Promise.all([
    supabase.from('offers').select('id, created_at'),
    supabase.from('businesses').select('slug'),
  ]);

  const offerRoutes: MetadataRoute.Sitemap = (offers ?? []).map((o) => ({
    url: `${BASE}/offer/${o.id}`,
    lastModified: o.created_at ?? undefined,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const businessRoutes: MetadataRoute.Sitemap = (businesses ?? []).map((b) => ({
    url: `${BASE}/business/${b.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...offerRoutes, ...businessRoutes];
}
