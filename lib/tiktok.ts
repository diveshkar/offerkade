// ============================================================
// TikTok Content Posting API integration.
//
// One singleton connection (OfferCeylon's own TikTok account, not a
// per-shop connection) stored in `tiktok_connection`. An admin authorizes
// once via /api/tiktok/connect; posting later reuses/refreshes that token.
//
// While the app is unaudited, TikTok only allows posting with
// privacy_level SELF_ONLY (visible only to the connected account) — see
// https://developers.tiktok.com/doc/content-posting-api-get-started/.
// ============================================================
import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { siteUrl } from '@/lib/site-url';
import type { TikTokConnection } from '@/lib/database.types';

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

function requireCredentials() {
  if (!CLIENT_KEY || !CLIENT_SECRET) {
    throw new Error('TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET are not configured.');
  }
  return { clientKey: CLIENT_KEY, clientSecret: CLIENT_SECRET };
}

export function tiktokRedirectUri(fallbackOrigin?: string | null): string {
  return `${siteUrl(fallbackOrigin)}/api/tiktok/callback`;
}

function base64url(bytes: Uint8Array): string {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** A random PKCE code_verifier, stashed in a cookie until the callback needs it. */
export function generateCodeVerifier(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(48)));
}

async function codeChallengeFor(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

/** Build the URL that sends an admin to TikTok to authorize the app. */
export async function tiktokAuthUrl(
  state: string,
  codeVerifier: string,
  fallbackOrigin?: string | null,
): Promise<string> {
  const { clientKey } = requireCredentials();
  const params = new URLSearchParams({
    client_key: clientKey,
    // video.publish (direct post) needs an audited app; Sandbox/unaudited
    // apps only have video.upload (post lands as a draft the connected
    // account finishes posting inside the TikTok app). Switch back to
    // video.publish once the app is approved for Direct Post.
    scope: 'user.info.basic,video.upload',
    response_type: 'code',
    redirect_uri: tiktokRedirectUri(fallbackOrigin),
    state,
    code_challenge: await codeChallengeFor(codeVerifier),
    code_challenge_method: 'S256',
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

interface TokenResponse {
  open_id: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  error?: string;
  error_description?: string;
}

function expiryFrom(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

/** Exchange the authorization code TikTok redirected back with for tokens. */
export async function tiktokExchangeCode(
  code: string,
  codeVerifier: string,
  fallbackOrigin?: string | null,
): Promise<void> {
  const { clientKey, clientSecret } = requireCredentials();

  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: tiktokRedirectUri(fallbackOrigin),
      code_verifier: codeVerifier,
    }),
  });
  const data = (await res.json()) as TokenResponse;
  if (!res.ok || data.error) {
    throw new Error(data.error_description || 'TikTok did not accept that authorization code.');
  }

  await supabaseAdmin.from('tiktok_connection').upsert({
    id: 1,
    open_id: data.open_id,
    access_token: data.access_token,
    access_token_expires_at: expiryFrom(data.expires_in),
    refresh_token: data.refresh_token,
    refresh_token_expires_at: expiryFrom(data.refresh_expires_in),
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

async function refreshTokens(connection: TikTokConnection): Promise<TikTokConnection> {
  const { clientKey, clientSecret } = requireCredentials();
  if (!connection.refresh_token) throw new Error('TikTok is not connected.');

  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: connection.refresh_token,
    }),
  });
  const data = (await res.json()) as TokenResponse;
  if (!res.ok || data.error) {
    throw new Error(data.error_description || 'Could not refresh the TikTok connection.');
  }

  const fields = {
    open_id: data.open_id,
    access_token: data.access_token,
    access_token_expires_at: expiryFrom(data.expires_in),
    refresh_token: data.refresh_token,
    refresh_token_expires_at: expiryFrom(data.refresh_expires_in),
    updated_at: new Date().toISOString(),
  };
  await supabaseAdmin.from('tiktok_connection').update(fields).eq('id', 1);
  return { ...connection, ...fields };
}

/** The current connection, refreshing the access token first if it's stale. */
export async function getTikTokConnection(): Promise<TikTokConnection | null> {
  const { data } = await supabaseAdmin.from('tiktok_connection').select('*').eq('id', 1).maybeSingle();
  const connection = data as TikTokConnection | null;
  if (!connection?.access_token) return null;

  // Refresh a little before real expiry so a post never races an expired token.
  const soon = Date.now() + 5 * 60 * 1000;
  if (connection.access_token_expires_at && new Date(connection.access_token_expires_at).getTime() < soon) {
    return refreshTokens(connection);
  }
  return connection;
}

/**
 * Post an offer's poster image + caption to TikTok as a Photo Mode post.
 * Requires a publicly reachable image URL (Supabase storage URLs already are).
 */
export async function postPhotoToTikTok(imageUrl: string, caption: string): Promise<void> {
  const connection = await getTikTokConnection();
  if (!connection?.access_token) {
    throw new Error('TikTok is not connected yet. Connect it from the admin panel first.');
  }

  const res = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${connection.access_token}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info: {
        title: caption.slice(0, 2200),
        description: caption.slice(0, 4000),
        privacy_level: 'SELF_ONLY',
        disable_comment: false,
        auto_add_music: true,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        photo_cover_index: 0,
        photo_images: [imageUrl],
      },
      // MEDIA_UPLOAD matches the video.upload scope: the post lands as a
      // draft in the connected account's TikTok inbox for them to finish
      // and publish inside the app. Switch to DIRECT_POST (needs
      // video.publish, which needs an approved app) once audited.
      post_mode: 'MEDIA_UPLOAD',
      media_type: 'PHOTO',
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error?.code !== 'ok') {
    throw new Error(data.error?.message || 'TikTok rejected the post.');
  }
}
