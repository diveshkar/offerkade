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
  const urgent = left <= 2;
  const b = offer.business;

  return (
    <>
      <SiteHeader />
      <ViewCounter offerId={offer.id} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-forest/50 dark:text-ivory/50">
          <Link href="/" className="transition hover:text-gold-deep dark:hover:text-gold-bright">
            Offers
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate text-forest/35 dark:text-ivory/35">{offer.title}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10">
          {/* ===== Poster ===== */}
          <div className="md:sticky md:top-24 md:self-start">
            <div className="animate-rise overflow-hidden rounded-3xl border border-forest/10 bg-forest/5 shadow-[0_28px_60px_-28px_rgba(8,36,25,0.45)] dark:border-white/10 dark:bg-white/5">
              {offer.poster_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={offer.poster_url} alt={offer.title} className="w-full object-cover" />
              ) : (
                <div className="grid aspect-[4/5] place-items-center text-5xl text-forest/20">
                  🏷️
                </div>
              )}
            </div>
          </div>

          {/* ===== Details ===== */}
          <div className="animate-rise flex flex-col gap-5" style={{ animationDelay: '80ms' }}>
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {offer.category && (
                <span className="rounded-full bg-forest/5 px-3 py-1.5 text-[13px] font-medium text-forest ring-1 ring-forest/10 dark:bg-white/10 dark:text-ivory dark:ring-white/10">
                  {offer.category.icon} {offer.category.name}
                </span>
              )}
              {offer.is_featured && (
                <span className="rounded-full bg-gradient-to-b from-gold-bright to-gold px-3 py-1.5 text-[13px] font-bold text-forest-deep shadow-sm">
                  ★ Featured
                </span>
              )}
              {urgent && (
                <span className="rounded-full bg-clay px-3 py-1.5 text-[13px] font-bold text-white shadow-sm">
                  ⏰ {left <= 0 ? 'Last day' : left === 1 ? '1 day left' : `${left} days left`}
                </span>
              )}
            </div>

            <h1 className="font-display text-balance text-3xl font-semibold leading-tight sm:text-5xl">
              {offer.title}
            </h1>

            {offer.description && (
              <p className="whitespace-pre-line text-pretty leading-7 text-forest/70 dark:text-ivory/70">
                {offer.description}
              </p>
            )}

            {/* Meta cards */}
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {offer.city && (
                <div className="rounded-2xl border border-forest/10 bg-ivory-soft p-3.5 dark:border-white/10 dark:bg-forest-soft">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-forest/40 dark:text-ivory/40">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">📍 {offer.city}</dd>
                </div>
              )}
              {offer.location_note && (
                <div className="rounded-2xl border border-forest/10 bg-ivory-soft p-3.5 dark:border-white/10 dark:bg-forest-soft">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-forest/40 dark:text-ivory/40">
                    Branches
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">{offer.location_note}</dd>
                </div>
              )}
              <div
                className={`rounded-2xl border p-3.5 ${
                  urgent
                    ? 'border-clay/30 bg-clay/10'
                    : 'border-forest/10 bg-ivory-soft dark:border-white/10 dark:bg-forest-soft'
                }`}
              >
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-forest/40 dark:text-ivory/40">
                  Valid until
                </dt>
                <dd className={`mt-1 text-sm font-semibold ${urgent ? 'text-clay' : ''}`}>
                  {prettyDate(offer.end_date)}
                </dd>
              </div>
            </dl>

            {/* Business card */}
            {b && (
              <div className="mt-1 rounded-3xl border border-forest/10 bg-ivory-soft p-5 shadow-sm dark:border-white/10 dark:bg-forest-soft">
                <div className="flex items-center gap-3.5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest font-display text-lg font-bold text-gold-bright">
                    {b.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-forest/40 dark:text-ivory/40">
                      Offered by
                    </p>
                    <Link
                      href={`/business/${b.slug}`}
                      className="block truncate text-lg font-bold transition hover:text-gold-deep dark:hover:text-gold-bright"
                    >
                      {b.name}
                      {b.verified && (
                        <span className="ml-1.5 text-sm text-emerald-500" title="Verified business">
                          ✓ Verified
                        </span>
                      )}
                    </Link>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {b.whatsapp && (
                    <a
                      href={waLink(b.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white shadow-md shadow-[#25D366]/25 transition hover:brightness-105 active:scale-[0.98]"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                  {b.contact_phone && (
                    <a
                      href={`tel:${b.contact_phone}`}
                      className="flex h-11 items-center justify-center gap-2 rounded-full bg-forest text-sm font-semibold text-ivory shadow-md shadow-forest/25 transition hover:bg-forest-soft active:scale-[0.98]"
                    >
                      📞 Call now
                    </a>
                  )}
                  {b.website && (
                    <a
                      href={b.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 items-center justify-center gap-2 rounded-full border border-forest/20 text-sm font-semibold text-forest transition hover:border-gold hover:text-gold-deep active:scale-[0.98] dark:border-white/15 dark:text-ivory dark:hover:text-gold-bright"
                    >
                      🌐 Website
                    </a>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs leading-5 text-forest/40 dark:text-ivory/40">
              Offer details are provided by the business. Please confirm validity with them before
              visiting.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
