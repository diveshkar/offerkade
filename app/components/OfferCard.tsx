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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,43,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_16px_40px_-12px_rgba(16,24,43,0.25)] dark:border-white/10 dark:bg-ink-soft dark:hover:border-accent/40"
    >
      {/* Poster */}
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-white/5">
        {offer.poster_thumb_url ? (
          // Pre-compressed WebP thumbnail — plain img is correct here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.poster_thumb_url}
            alt={offer.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="grid h-full place-items-center text-3xl text-zinc-300 dark:text-zinc-600">
            🏷️
          </div>
        )}

        {/* Subtle bottom gradient so badges/labels always read */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 opacity-70" />

        {/* Top-left status badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {offer.is_featured && (
            <span className="rounded-full bg-gradient-to-b from-accent to-accent-strong px-2.5 py-1 text-[11px] font-bold text-brand shadow-md">
              ★ Featured
            </span>
          )}
          {urgent && (
            <span className="rounded-full bg-red-600/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur">
              ⏰ {endsLabel(left)}
            </span>
          )}
        </div>

        {/* Category tag */}
        {offer.category && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            {offer.category.icon} {offer.category.name}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-accent-strong dark:text-zinc-50 dark:group-hover:text-accent">
          {offer.title}
        </h3>

        <div className="mt-auto flex items-center gap-2">
          {/* Business initial avatar */}
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-[11px] font-bold text-accent">
            {(offer.business?.name ?? '•').charAt(0)}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-500 dark:text-zinc-400">
            {offer.business?.name ?? 'Business'}
            {offer.business?.verified && (
              <span className="ml-1 text-emerald-500" title="Verified business">✓</span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between text-[12px] text-zinc-400 dark:text-zinc-500">
          {offer.city ? <span>📍 {offer.city}</span> : <span />}
          {!urgent && <span>{endsLabel(left)}</span>}
        </div>
      </div>
    </Link>
  );
}
