'use client';

import { useEffect, useRef } from 'react';
import { bumpViewCount } from '@/lib/queries/offers';

// Bumps view_count once per mount (real browser views only, not bots/prefetch).
export default function ViewCounter({ offerId }: { offerId: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    bumpViewCount(offerId).catch(() => {});
  }, [offerId]);
  return null;
}
