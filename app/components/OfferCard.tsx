import Link from 'next/link';
import { ClockIcon, PinIcon, StarIcon } from '@/app/components/Icons';
import VerifiedBadge from '@/app/components/VerifiedBadge';
import { daysLeft, type OfferWithRelations } from '@/lib/queries/offers';

function endsLabel(left: number): string {
  if (left <= 0) return 'Last day';
  if (left === 1) return '1 day left';
  return `${left} days left`;
}

function prettyDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function OfferCard({ offer }: { offer: OfferWithRelations }) {
  const left = daysLeft(offer.end_date);
  const urgent = left <= 2;

  return (
    <Link
      href={`/offer/${offer.id}`}
      className="group relative flex h-full flex-col rounded-[14px] border border-coal/12 bg-paper-soft shadow-[0_1px_2px_rgba(18,13,10,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-flame/50 hover:shadow-[0_16px_38px_-16px_rgba(18,13,10,0.28)] dark:border-white/10 dark:bg-coal-soft dark:hover:border-flame/40"
    >
      {/* Poster */}
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-t-[13px] bg-coal/5 dark:bg-white/5">
        {offer.poster_thumb_url ? (
          // Pre-compressed WebP thumbnail, plain img is correct here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.poster_thumb_url}
            alt={offer.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm font-medium text-coal/30 dark:text-paper/25">
            No poster
          </div>
        )}

        {/* Flat, solid badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {offer.is_featured && (
            <span className="flex items-center gap-1 rounded-md bg-flame px-2 py-0.5 text-[11px] font-semibold text-coal-deep">
              <StarIcon className="h-3 w-3" /> Featured
            </span>
          )}
          {urgent && (
            <span className="flex items-center gap-1 rounded-md bg-ember px-2 py-0.5 text-[11px] font-semibold text-white">
              <ClockIcon className="h-3 w-3" /> {endsLabel(left)}
            </span>
          )}
        </div>
      </div>

      {/* Perforated tear line + ticket body. The notches straddle the dashed
          line and are filled with the page ground to read as punch-outs. */}
      <div className="relative flex flex-1 flex-col border-t border-dashed border-coal/25 p-3.5 pt-4 before:absolute before:-left-[9px] before:-top-[9px] before:h-4 before:w-4 before:rounded-full before:border before:border-coal/12 before:bg-paper after:absolute after:-right-[9px] after:-top-[9px] after:h-4 after:w-4 after:rounded-full after:border after:border-coal/12 after:bg-paper dark:border-white/20 dark:before:border-white/10 dark:before:bg-coal-deep dark:after:border-white/10 dark:after:bg-coal-deep">
        {offer.category && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-flame-deep dark:text-flame-bright">
            {offer.category.name}
          </span>
        )}

        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug tracking-tight text-coal-deep transition-colors group-hover:text-flame-deep dark:text-paper dark:group-hover:text-flame-bright">
          {offer.title}
        </h3>

        <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-coal/60 dark:text-paper/60">
          <span className="min-w-0 flex-1 truncate">{offer.business?.name ?? 'Business'}</span>
          {offer.business?.verified && <VerifiedBadge />}
        </div>

        {offer.city && (
          <span className="mt-1 flex items-center gap-1 text-[12px] text-coal/45 dark:text-paper/45">
            <PinIcon className="h-3 w-3 shrink-0" /> {offer.city}
          </span>
        )}

        {/* Stub: the tear-off, coupon-style */}
        <div className="mt-auto flex items-end justify-between border-t border-coal/10 pt-2.5 dark:border-white/10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-coal/40 dark:text-paper/40">
            Valid until
          </span>
          <span
            className={`text-[12px] font-semibold tabular-nums ${
              urgent ? 'text-ember' : 'text-coal-deep dark:text-paper'
            }`}
          >
            {prettyDate(offer.end_date)}
          </span>
        </div>
      </div>
    </Link>
  );
}
