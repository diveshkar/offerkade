import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import ViewCounter from '@/app/components/ViewCounter';
import { getOfferById, daysLeft } from '@/lib/queries/offers';

export const dynamic = 'force-dynamic';

function waLink(number: string) {
  return `https://wa.me/${number.replace(/[^\d]/g, '')}`;
}
function prettyDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const offer = await getOfferById(id);
  if (!offer) return { title: 'Offer not found · OfferCeylon' };
  return {
    title: `${offer.title} · ${offer.business?.name ?? 'OfferCeylon'}`,
    description: offer.description ?? `Offer from ${offer.business?.name} in ${offer.city}.`,
    openGraph: {
      title: offer.title,
      description: offer.description ?? undefined,
      images: offer.poster_url ? [{ url: offer.poster_url }] : undefined,
    },
  };
}

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await getOfferById(id);
  if (!offer) notFound();

  const left = daysLeft(offer.end_date);
  const b = offer.business;

  return (
    <>
      <SiteHeader />
      <ViewCounter offerId={offer.id} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <Link href="/" className="text-sm text-zinc-500 hover:text-amber-600">
          ← Back to offers
        </Link>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {/* Poster */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-zinc-800">
            {offer.poster_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={offer.poster_url} alt={offer.title} className="w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center text-zinc-400">
                No image
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {offer.category && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-white/10">
                  {offer.category.icon} {offer.category.name}
                </span>
              )}
              {left <= 2 && (
                <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
                  ⏰ {left <= 0 ? 'Last day' : left === 1 ? '1 day left' : `${left} days left`}
                </span>
              )}
              {offer.is_featured && (
                <span className="rounded-full bg-amber-500 px-3 py-1 text-sm font-bold text-[#10182b]">
                  ★ Featured
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
              {offer.title}
            </h1>

            {offer.description && (
              <p className="whitespace-pre-line leading-7 text-zinc-600 dark:text-zinc-300">
                {offer.description}
              </p>
            )}

            <dl className="grid grid-cols-2 gap-3 text-sm">
              {offer.city && (
                <div>
                  <dt className="text-zinc-400">Location</dt>
                  <dd className="font-medium">📍 {offer.city}</dd>
                </div>
              )}
              {offer.location_note && (
                <div>
                  <dt className="text-zinc-400">Branches</dt>
                  <dd className="font-medium">{offer.location_note}</dd>
                </div>
              )}
              <div>
                <dt className="text-zinc-400">Valid until</dt>
                <dd className="font-medium">{prettyDate(offer.end_date)}</dd>
              </div>
            </dl>

            {/* Business + contact */}
            {b && (
              <div className="mt-2 rounded-2xl border border-zinc-200 p-4 dark:border-white/10">
                <p className="text-xs uppercase tracking-wide text-zinc-400">Offered by</p>
                <Link
                  href={`/business/${b.slug}`}
                  className="text-lg font-semibold hover:text-amber-600"
                >
                  {b.name} {b.verified && <span title="Verified">✓</span>}
                </Link>
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.whatsapp && (
                    <a
                      href={waLink(b.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                  {b.contact_phone && (
                    <a
                      href={`tel:${b.contact_phone}`}
                      className="rounded-lg bg-[#10182b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b2540]"
                    >
                      📞 Call
                    </a>
                  )}
                  {b.website && (
                    <a
                      href={b.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold hover:border-amber-400 dark:border-white/15"
                    >
                      🌐 Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
