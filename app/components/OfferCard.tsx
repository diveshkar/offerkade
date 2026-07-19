import Link from 'next/link';
import { ClockIcon, PinIcon, StarIcon } from '@/app/components/Icons';
import { daysLeft, type OfferWithRelations } from '@/lib/queries/offers';

function endsLabel(left: number): string {
  if (left <= 0) return 'Last day';
  if (left === 1) return '1 day left';
  return `${left} days left`;
}

export default function OfferCard({ offer }: { offer: OfferWithRelations }) {
  const left = daysLeft(offer.end_date);
  const urgent = left <= 2;

  return (
    <Link
      href={`/offer/${offer.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-coal/10 bg-paper-soft shadow-[0_1px_2px_rgba(18,13,10,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-flame/50 hover:shadow-[0_18px_44px_-16px_rgba(18,13,10,0.3)] dark:border-white/10 dark:bg-coal-soft dark:hover:border-flame/40"
    >
      {/* Poster: fixed aspect so every card starts identical */}
      <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-coal/5 dark:bg-white/5">
        {offer.poster_thumb_url ? (
          // Pre-compressed WebP thumbnail, plain img is correct here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.poster_thumb_url}
            alt={offer.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="grid h-full place-items-center text-3xl text-coal/20 dark:text-paper/20">
            🏷️
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-coal-deep/30 via-transparent to-coal-deep/10 opacity-70" />

        {/* Top badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {offer.is_featured && (
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-b from-flame-bright to-flame px-2.5 py-1 text-[11px] font-bold text-coal-deep shadow-md">
              <StarIcon className="h-3 w-3" /> Featured
            </span>
          )}
          {urgent && (
            <span className="flex items-center gap-1 rounded-full bg-ember px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
              <ClockIcon className="h-3 w-3" /> {endsLabel(left)}
            </span>
          )}
        </div>

        {/* Category tag */}
        {offer.category && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-coal-deep/60 px-2.5 py-1 text-[11px] font-medium text-paper backdrop-blur-md">
            {offer.category.icon} {offer.category.name}
          </span>
        )}
      </div>

      {/* Body: reserved heights keep every card the same size */}
      <div className="flex flex-1 flex-col p-3.5">
        {/* Exactly two lines reserved, long titles clamp, short ones don't shrink the card */}
        <h3 className="line-clamp-2 min-h-[2.65rem] text-[15px] font-semibold leading-snug tracking-tight text-coal-deep transition-colors group-hover:text-flame-deep dark:text-paper dark:group-hover:text-flame-bright">
          {offer.title}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-coal text-[11px] font-bold text-flame-bright">
            {(offer.business?.name ?? '•').charAt(0)}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-coal/60 dark:text-paper/60">
            {offer.business?.name ?? 'Business'}
            {offer.business?.verified && (
              <span className="ml-1 text-emerald-500" title="Verified business">✓</span>
            )}
          </span>
        </div>

        {/* Meta row pinned to the bottom of every card */}
        <div className="mt-auto flex items-center justify-between pt-2.5 text-[12px] text-coal/45 dark:text-paper/45">
          <span className="flex min-w-0 items-center gap-1 truncate">
            {offer.city && (
              <>
                <PinIcon className="h-3 w-3 shrink-0" /> {offer.city}
              </>
            )}
          </span>
          <span className={`shrink-0 ${urgent ? 'font-semibold text-ember' : ''}`}>
            {endsLabel(left)}
          </span>
        </div>
      </div>
    </Link>
  );
}
