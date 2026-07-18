// Health-check endpoint: proves the deployed Worker can reach Supabase.
// Visit /api/health on any deploy. Returns category count + status.
// (Temporary Phase-2 verification aid — safe to remove later.)
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// Always run fresh, never cache the DB check.
export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  const { count, error } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return NextResponse.json(
      { ok: false, db: 'error', message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    db: 'connected',
    categories: count,
    ms: Date.now() - startedAt,
  });
}
