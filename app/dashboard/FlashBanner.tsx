'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Alert } from '@/app/components/ui';

const MESSAGES = {
  published: {
    title: 'Offer published',
    body: 'Your offer is now live on OfferCeylon. Published offers can’t be edited.',
  },
  draft: {
    title: 'Draft saved',
    body: 'Your draft is saved. Open it any time to keep editing or publish it.',
  },
} as const;

/** Success banner shown after publish/draft. Fades itself out after a few
    seconds and strips the ?published / ?draft query param so it doesn't linger
    on refresh or reappear when navigating back. */
export default function FlashBanner({ kind }: { kind: keyof typeof MESSAGES }) {
  const router = useRouter();
  const pathname = usePathname();
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setLeaving(true), 4000);
    const remove = setTimeout(() => {
      setGone(true);
      router.replace(pathname, { scroll: false });
    }, 4400);
    return () => {
      clearTimeout(fade);
      clearTimeout(remove);
    };
  }, [router, pathname]);

  if (gone) return null;
  const m = MESSAGES[kind];

  return (
    <div
      className={`transition-opacity duration-300 ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <Alert tone="success" title={m.title}>
        {m.body}
      </Alert>
    </div>
  );
}
