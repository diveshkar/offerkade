import type { MetadataRoute } from 'next';
import { CANONICAL_URL } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep private/app + internal routes out of the index. `/offer/` (public
      // offer pages) is intentionally NOT blocked; `/offers/` (authoring) is.
      disallow: [
        '/admin',
        '/dashboard',
        '/onboarding',
        '/offers/',
        '/login',
        '/forgot-password',
        '/reset-password',
        '/auth/',
        '/dev/',
        '/api/',
      ],
    },
    sitemap: `${CANONICAL_URL}/sitemap.xml`,
  };
}
