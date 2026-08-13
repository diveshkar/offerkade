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
  if (!upstream.ok) return new NextResponse('Not found', { status: 404 });

  // Buffer instead of streaming the raw body: TikTok's URL puller needs an
  // explicit Content-Length up front to validate the file, which a streamed
  // response here doesn't reliably provide.
  const bytes = await upstream.arrayBuffer();

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'image/webp',
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
