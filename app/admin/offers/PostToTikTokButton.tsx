'use client';

import { useState, useTransition } from 'react';
import { postOfferToTikTok } from '@/app/admin/actions';

export default function PostToTikTokButton({
  offerId,
  posted,
}: {
  offerId: string;
  posted: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function onClick() {
    setError('');
    const fd = new FormData();
    fd.set('id', offerId);
    startTransition(async () => {
      const result = await postOfferToTikTok(fd);
      if (result?.error) setError(result.error);
    });
  }

  if (posted) {
    return (
      <span className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">
        Posted to TikTok
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-lg border border-coal/15 bg-paper-soft px-3 text-[12px] font-semibold text-coal-deep transition hover:border-coal/30 active:scale-[0.98] disabled:opacity-50"
      >
        {pending ? 'Posting' : 'Post to TikTok'}
      </button>
      {error && <span className="max-w-[220px] text-[11px] leading-4 text-ember">{error}</span>}
    </div>
  );
}
