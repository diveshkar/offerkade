// ============================================================
// OfferCeylon — Phase 3 — Server-side poster upload.
// Uploads the browser-compressed poster + thumb to Supabase Storage
// using the service_role client (bypasses RLS). Sets a long
// Cache-Control so repeat views are served from the CDN edge and
// never re-hit Supabase — this is what protects the 5GB egress quota.
//
// Returns the public CDN URLs (for display) AND the storage paths
// (needed by the nightly expiry job to delete the objects).
// ============================================================
import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const POSTERS_BUCKET = 'posters';
// 1 year, immutable — filenames are unique so cached copies never go stale.
const CACHE_CONTROL = '31536000';

export interface UploadedPoster {
  poster_url: string;
  poster_thumb_url: string;
  poster_path: string;
  poster_thumb_path: string;
}

/** Random object key under posters/, e.g. "posters/2026/ab12cd34.webp". */
function makeKey(suffix: string): string {
  const y = new Date().getUTCFullYear();
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  return `${y}/${id}${suffix}.webp`;
}

/**
 * Upload a compressed poster + thumbnail. Accepts anything the Supabase
 * storage client takes (Blob / File / ArrayBuffer / Buffer).
 */
export async function uploadPoster(
  poster: Blob | ArrayBuffer,
  thumb: Blob | ArrayBuffer,
): Promise<UploadedPoster> {
  const posterKey = makeKey('');
  const thumbKey = makeKey('-thumb');

  const opts = { contentType: 'image/webp', cacheControl: CACHE_CONTROL, upsert: false };

  const [p, t] = await Promise.all([
    supabaseAdmin.storage.from(POSTERS_BUCKET).upload(posterKey, poster, opts),
    supabaseAdmin.storage.from(POSTERS_BUCKET).upload(thumbKey, thumb, opts),
  ]);

  if (p.error) throw new Error(`poster upload failed: ${p.error.message}`);
  if (t.error) throw new Error(`thumb upload failed: ${t.error.message}`);

  const posterUrl = supabaseAdmin.storage.from(POSTERS_BUCKET).getPublicUrl(posterKey).data.publicUrl;
  const thumbUrl = supabaseAdmin.storage.from(POSTERS_BUCKET).getPublicUrl(thumbKey).data.publicUrl;

  return {
    poster_url: posterUrl,
    poster_thumb_url: thumbUrl,
    poster_path: posterKey,
    poster_thumb_path: thumbKey,
  };
}

/** Delete poster + thumb by their storage paths (used by the expiry job). */
export async function deletePoster(posterPath: string, thumbPath: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(POSTERS_BUCKET)
    .remove([posterPath, thumbPath]);
  if (error) throw new Error(`poster delete failed: ${error.message}`);
}
