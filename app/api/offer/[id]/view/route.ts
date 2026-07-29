import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Hash the viewer's IP so a raw IP is never stored. 12 bytes is ample for dedup.
async function hashViewer(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`ofc:${ip}`));
  return Array.from(new Uint8Array(digest).slice(0, 12))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Count a real view at most once per viewer per offer per day. Called by the
// ViewCounter on the public offer page. The counters can no longer be called
// from the browser (migration 015), so this route is the only way in.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'anon';
  const viewer = await hashViewer(ip);

  // Insert the dedup row. A unique-violation means this viewer already counted
  // today (skip the bump); the offer_id FK means only real offers get counted.
  const { error } = await supabaseAdmin.from('offer_view_hits').insert({ offer_id: id, viewer });
  if (!error) {
    // First view today for this viewer: bump the counter. The RPC only
    // increments approved, non-expired offers.
    await supabaseAdmin.rpc('bump_view_count', { p_offer_id: id });
  }

  return new NextResponse(null, { status: 204 });
}
