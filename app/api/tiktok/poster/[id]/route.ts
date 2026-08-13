import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// TikTok's PULL_FROM_URL media transfer requires the image URL's domain to
// be verified with TikTok. Poster images live on Supabase Storage
// (*.supabase.co), a domain we don't control, so we can never verify it.
// This route re-serves an offer's poster from our own verified domain
// (offerceylon.com) instead, so TikTok can pull from a URL we do own.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: offer } = await supabaseAdmin
    .from('offers')
    .select('poster_url')
    .eq('id', id)
    .maybeSingle();
  if (!offer?.poster_url) return new NextResponse('Not found', { status: 404 });

  const upstream = await fetch(offer.poster_url);
  if (!upstream.ok || !upstream.body) return new NextResponse('Not found', { status: 404 });

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'image/webp',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
