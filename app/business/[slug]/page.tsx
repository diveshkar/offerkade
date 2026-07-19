import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import OfferCard from '@/app/components/OfferCard';
import { getBusinessBySlug } from '@/lib/queries/offers';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBusinessBySlug(slug);
  if (!result) return { title: 'Business not found · OfferCeylon' };
  return {
    title: `${result.business.name} · Offers on OfferCeylon`,
    description: `Current offers from ${result.business.name}${
      result.business.city ? ` in ${result.business.city}` : ''
    }.`,
  };
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getBusinessBySlug(slug);
  if (!result) notFound();
  const { business: b, offers } = result;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* ===== Banner ===== */}
        <section className="relative overflow-hidden bg-forest-deep pb-16 pt-12 text-ivory">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 right-[-6%] h-72 w-72 rounded-full bg-gold/12 blur-3xl"
          />
          <div className="relative mx-auto flex max-w-6xl items-center gap-5 px-4 sm:px-6">
            {b.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.logo_url}
                alt={b.name}
                className="h-20 w-20 rounded-full border border-gold/25 object-cover shadow-xl"
              />
            ) : (
              <div className="font-display grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-bright to-gold-deep text-3xl font-bold text-forest-deep shadow-xl shadow-gold/20">
                {b.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-4xl">
                  {b.name}
                </h1>
                {b.verified && (
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                    ✓ Verified
                  </span>
                )}
              </div>
              {b.city && <p className="mt-1 text-sm text-ivory/60">📍 {b.city}</p>}
            </div>
          </div>
        </section>

        {/* ===== Offers ===== */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-forest-deep dark:text-ivory">
              Live offers
            </h2>
            <p className="text-sm text-forest/50 dark:text-ivory/50">
              {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
            </p>
          </div>

          {offers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-forest/20 px-6 py-20 text-center dark:border-white/15">
              <p className="text-4xl">🕐</p>
              <p className="font-display mt-4 text-xl font-semibold text-forest-deep dark:text-ivory">
                No live offers right now
              </p>
              <p className="mt-1 text-sm text-forest/50 dark:text-ivory/50">Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {offers.map((o, i) => (
                <div
                  key={o.id}
                  className="animate-rise h-full"
                  style={{ animationDelay: `${Math.min(i * 45, 360)}ms` }}
                >
                  <OfferCard offer={o} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
