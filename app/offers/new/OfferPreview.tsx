'use client';

import { ClockIcon, PinIcon, StarIcon } from '@/app/components/Icons';

function prettyDate(d: string): string {
  if (!d) return 'Pick an end date';
  return new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function daysLeft(d: string): number | null {
  if (!d) return null;
  const end = new Date(`${d}T23:59:59`).getTime();
  return Math.ceil((end - Date.now()) / 86400000);
}

export default function OfferPreview({
  title,
  category,
  city,
  endDate,
  branchNames,
  shopName,
  verified,
  preview,
}: {
  title: string;
  category: string;
  city: string;
  endDate: string;
  branchNames: string[];
  shopName: string;
  verified: boolean;
  preview: string | null;
}) {
  const left = daysLeft(endDate);
  const urgent = left !== null && left <= 2;

  return (
    <div className="w-full max-w-[300px]">
      <div className="flex h-full flex-col rounded-[14px] border border-coal/12 bg-paper-soft shadow-[0_20px_50px_-24px_rgba(0,0,0,0.65)]">
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-t-[13px] bg-coal/5">
          {preview ? (
            // Local object URL from the picked file.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-sm font-medium text-coal/35">
              Your poster appears here
            </div>
          )}

          <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            <span className="flex items-center gap-1 rounded-md bg-flame px-2 py-0.5 text-[11px] font-semibold text-coal-deep">
              <StarIcon className="h-3 w-3" /> Featured
            </span>
            {urgent && (
              <span className="flex items-center gap-1 rounded-md bg-ember px-2 py-0.5 text-[11px] font-semibold text-white">
                <ClockIcon className="h-3 w-3" />
                {left !== null && left <= 0 ? 'Last day' : `${left} days left`}
              </span>
            )}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col border-t border-dashed border-coal/25 p-3.5 pt-4 before:absolute before:-left-[9px] before:-top-[9px] before:h-4 before:w-4 before:rounded-full before:border before:border-coal/12 before:bg-paper after:absolute after:-right-[9px] after:-top-[9px] after:h-4 after:w-4 after:rounded-full after:border after:border-coal/12 after:bg-paper">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-flame-deep">
            {category || 'Category'}
          </span>

          <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug tracking-tight text-coal-deep">
            {title || 'Your offer title appears here'}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-coal/60">
            <span className="min-w-0 flex-1 truncate">{shopName}</span>
            {verified && (
              <span className="shrink-0 rounded-full bg-emerald-500/12 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
                Verified
              </span>
            )}
          </div>

          <span className="mt-1 flex items-center gap-1 text-[12px] text-coal/45">
            <PinIcon className="h-3 w-3 shrink-0" />
            {branchNames.length > 1 ? `${branchNames.length} branches` : city || 'District'}
          </span>

          <div className="mt-auto flex items-end justify-between border-t border-coal/10 pt-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-coal/40">
              Valid until
            </span>
            <span
              className={`text-[12px] font-semibold tabular-nums ${
                urgent ? 'text-ember' : 'text-coal-deep'
              }`}
            >
              {prettyDate(endDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
