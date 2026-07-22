// Base URL used in auth email links.
//
// Order of preference:
//   1. NEXT_PUBLIC_SITE_URL, set it in the deployed environment only
//   2. the origin the request actually came from
// Leaving the variable unset in local dev means links point at whatever
// host and port you are really running on.
export function siteUrl(fallbackOrigin?: string | null): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (fallbackOrigin) return fallbackOrigin.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}

export function authRedirect(next: string, fallbackOrigin?: string | null): string {
  return `${siteUrl(fallbackOrigin)}/auth/callback?next=${encodeURIComponent(next)}`;
}
