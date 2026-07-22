// Base URL used in auth emails. Set NEXT_PUBLIC_SITE_URL when the app is
// reached through a tunnel or a deployed domain, otherwise links point at
// whatever origin the browser happened to use.
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}

export function authRedirect(next: string): string {
  return `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}
