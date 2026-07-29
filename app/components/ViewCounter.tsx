'use client';

import { useEffect, useRef } from 'react';

// Counts one view per mount by POSTing to the server route, which dedupes per
// viewer per day and bumps the counter with the service role. The public
// counter RPC is no longer callable from the browser (migration 015).
export default function ViewCounter({ offerId }: { offerId: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    fetch(`/api/offer/${offerId}/view`, { method: 'POST', keepalive: true }).catch(() => {});
  }, [offerId]);
  return null;
}
