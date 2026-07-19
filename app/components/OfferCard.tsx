import Link from 'next/link';
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
      className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-forest/10 bg-ivory-soft shadow-[0_1px_2px_rgba(8,36,25,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_18px_44px_-16px_rgba(8,36,25,0.3)] dark:border-white/10 dark:bg-forest-soft dark:hover:border-gold/40"
    >
      {/* Poster: fixed aspect so every card starts identical */}
      <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-forest/5 dark:bg-white/5">
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
          <div className="grid h-full place-items-center text-3xl text-forest/20 dark:text-ivory/20">
            🏷️
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-deep/30 via-transparent to-forest-deep/10 opacity-70" />

        {/* Top badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {offer.is_featured && (
            <span className="rounded-full bg-gradient-to-b from-gold-bright to-gold px-2.5 py-1 text-[11px] font-bold text-forest-deep shadow-md">
              ★ Featured
            </span>
          )}
          {urgent && (
            <span className="rounded-full bg-clay px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
              ⏰ {endsLabel(left)}
            </span>
          )}
        </div>

        {/* Category tag */}
        {offer.category && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-forest-deep/60 px-2.5 py-1 text-[11px] font-medium text-ivory backdrop-blur-md">
            {offer.category.icon} {offer.category.name}
          </span>
        )}
      </div>

      {/* Body: reserved heights keep every card the same size */}
      <div className="flex flex-1 flex-col p-3.5">
        {/* Exactly two lines reserved, long titles clamp, short ones don't shrink the card */}
        <h3 className="line-clamp-2 min-h-[2.65rem] text-[15px] font-semibold leading-snug tracking-tight text-forest-deep transition-colors group-hover:text-gold-deep dark:text-ivory dark:group-hover:text-gold-bright">
          {offer.title}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-forest text-[11px] font-bold text-gold-bright">
            {(offer.business?.name ?? '•').charAt(0)}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-forest/60 dark:text-ivory/60">
            {offer.business?.name ?? 'Business'}
            {offer.business?.verified && (
              <span className="ml-1 text-emerald-500" title="Verified business">✓</span>
            )}
          </span>
        </div>

        {/* Meta row pinned to the bottom of every card */}
        <div className="mt-auto flex items-center justify-between pt-2.5 text-[12px] text-forest/45 dark:text-ivory/45">
          <span className="truncate">{offer.city ? `📍 ${offer.city}` : ''}</span>
          <span className={`shrink-0 ${urgent ? 'font-semibold text-clay' : ''}`}>
            {endsLabel(left)}
          </span>
        </div>
      </div>
    </Link>
  );
}
