import Link from 'next/link';
import { daysLeft, type OfferWithRelations } from '@/lib/queries/offers';

export default function OfferCard({ offer }: { offer: OfferWithRelations }) {
  const left = daysLeft(offer.end_date);
  const expiringSoon = left <= 2;

  return (
    <Link
      href={`/offer/${offer.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#111a2e]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {/* Pre-compressed WebP thumbnail — plain img is correct here (no re-optimization needed). */}
        {offer.poster_thumb_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.poster_thumb_url}
            alt={offer.title}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">No image</div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex gap-1">
          {offer.is_featured && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-[#10182b]">
              ★ Featured
            </span>
          )}
          {expiringSoon && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
              ⏰ {left <= 0 ? 'Last day' : left === 1 ? '1 day left' : `${left} days left`}
            </span>
          )}
        </div>
        {offer.category?.icon && (
          <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur">
            {offer.category.icon} {offer.category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
          {offer.title}
        </h3>
        <p className="mt-auto flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="truncate">{offer.business?.name ?? 'Business'}</span>
          {offer.business?.verified && <span title="Verified">✓</span>}
        </p>
        {offer.city && <p className="text-xs text-zinc-400">📍 {offer.city}</p>}
      </div>
    </Link>
  );
}
