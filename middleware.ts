import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ---------------------------------------------------------------------------
// Pre-launch site lock (HTTP Basic Auth).
// Locks the ENTIRE site behind a password so the public can't see it before
// launch. Enable it by setting these environment variables (in Cloudflare, or
// .env.local for local testing):
//   SITE_LOCKED   = true
//   SITE_PASSWORD = <a password you choose>
//   SITE_USER     = <optional; defaults to "offerceylon">
// At launch, set SITE_LOCKED=false (or delete it) and redeploy.
// If SITE_LOCKED isn't "true", or no password is set, the lock is OFF.
// ---------------------------------------------------------------------------
function siteLock(request: NextRequest): NextResponse | null {
  if (process.env.SITE_LOCKED !== 'true') return null;
  const password = process.env.SITE_PASSWORD;
  if (!password) return null; // fail open so a missing password can't lock you out
  const user = process.env.SITE_USER || 'offerceylon';

  const header = request.headers.get('authorization') ?? '';
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const idx = decoded.indexOf(':');
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (u === user && p === password) return null; // correct password → allow
    } catch {
      // malformed header → fall through and prompt again
    }
  }

  return new NextResponse('OfferCeylon is not open yet.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="OfferCeylon (pre-launch)", charset="UTF-8"' },
  });
}

// Routes that need a fresh Supabase session cookie.
const SESSION_PATHS =
  /^\/(dashboard|onboarding|offers|admin|login|register|forgot-password|reset-password|continue)(\/|$)/;

export async function middleware(request: NextRequest) {
  // 1. Site-wide lock runs first on every request.
  const locked = siteLock(request);
  if (locked) return locked;

  // 2. Only refresh the auth session on auth-relevant routes.
  if (!SESSION_PATHS.test(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Run on every route (so the lock is site-wide) except static assets.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml|woff2?)$).*)',
  ],
};
