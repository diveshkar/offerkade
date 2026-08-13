import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentAdmin } from '@/lib/queries/admin';
import { tiktokAuthUrl, generateCodeVerifier } from '@/lib/tiktok';

export const dynamic = 'force-dynamic';

// Sends a signed-in admin to TikTok to authorize OfferCeylon's account.
// The random `state` and PKCE `code_verifier` are stashed in short-lived
// cookies and checked back against TikTok's redirect in
// /api/tiktok/callback, so the callback can't be triggered by anything
// other than this exact request.
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.redirect(new URL('/login', request.url));

  const state = crypto.randomUUID();
  const codeVerifier = generateCodeVerifier();
  const authUrl = await tiktokAuthUrl(state, codeVerifier, request.nextUrl.origin);

  const response = NextResponse.redirect(authUrl);
  const cookieOpts = { httpOnly: true, secure: true, sameSite: 'lax' as const, maxAge: 600, path: '/' };
  response.cookies.set('tiktok_oauth_state', state, cookieOpts);
  response.cookies.set('tiktok_oauth_verifier', codeVerifier, cookieOpts);
  return response;
}
