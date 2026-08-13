import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentAdmin } from '@/lib/queries/admin';
import { tiktokExchangeCode } from '@/lib/tiktok';

export const dynamic = 'force-dynamic';

// TikTok redirects here after the admin approves (or cancels) the
// authorization. Exchanges the one-time code for tokens and stores them.
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.redirect(new URL('/login', request.url));

  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const savedState = request.cookies.get('tiktok_oauth_state')?.value;
  const codeVerifier = request.cookies.get('tiktok_oauth_verifier')?.value;
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description') || searchParams.get('error_string');

  const done = (status: 'connected' | 'error', message?: string) => {
    const url = new URL('/admin', request.url);
    url.searchParams.set('tiktok', status);
    if (message) url.searchParams.set('tiktok_error', message);
    const response = NextResponse.redirect(url);
    response.cookies.delete('tiktok_oauth_state');
    response.cookies.delete('tiktok_oauth_verifier');
    return response;
  };

  if (errorParam) return done('error', errorDescription || 'Authorization was cancelled or denied.');
  if (!code || !state || !savedState || state !== savedState || !codeVerifier) {
    return done('error', 'That authorization link expired. Please try connecting again.');
  }

  try {
    await tiktokExchangeCode(code, codeVerifier, request.nextUrl.origin);
  } catch (err) {
    return done('error', err instanceof Error ? err.message : 'Could not connect TikTok.');
  }

  return done('connected');
}
