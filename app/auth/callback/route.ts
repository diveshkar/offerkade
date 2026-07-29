import { NextResponse, type NextRequest } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Lands here from the confirmation and password-reset emails.
//
// Primary path: the stateless `token_hash` flow (verifyOtp). It needs no
// browser-side code_verifier cookie, so it works when the link is opened on a
// different device or inside an email app's in-app browser (the common case:
// sign up on a laptop, click the link on a phone).
//
// Fallback: the older PKCE `code` flow (exchangeCodeForSession), kept so any
// links already sitting in inboxes still work.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');

  // Only allow app-internal redirect targets (guards against open redirects).
  const rawNext = searchParams.get('next') ?? '/onboarding';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/onboarding';

  const supabase = await createSupabaseServerClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=link_expired`);
}
