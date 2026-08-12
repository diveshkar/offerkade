import type { Metadata } from 'next';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import OfferCard from '@/app/components/OfferCard';
import Paginator from '@/app/components/Paginator';
import { listOffers } from '@/lib/queries/offers';
import { CANONICAL_URL } from '@/lib/site-url';

// Live offers change and expire daily.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tourist Discounts & Deals in Sri Lanka · OfferCeylon',
  description:
    'Hand-picked discounts for visitors to Sri Lanka: hotels, restaurants, tours, transport and attractions. Free, live deals updated daily, no booking fees.',
  alternates: { canonical: `${CANONICAL_URL}/tourist-deals` },
  openGraph: {
    title: 'Tourist Discounts & Deals in Sri Lanka',
    description:
      'Hand-picked discounts for visitors to Sri Lanka: hotels, restaurants, tours, transport and attractions.',
    url: `${CANONICAL_URL}/tourist-deals`,
  },
};

type SP = { [k: string]: string | string[] | undefined };

export default async function TouristDealsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const page = Math.max(1, parseInt(one(sp.page) ?? '1', 10) || 1);

  const { offers, total, totalPages } = await listOffers({ touristFriendly: true, page });

  const hrefFor = (p: number) => (p > 1 ? `/tourist-deals?page=${p}` : '/tourist-deals');

  // ItemList structured data so Google understands this is a curated collection,
  // not a duplicate of the homepage.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tourist Discounts & Deals in Sri Lanka',
    url: `${CANONICAL_URL}/tourist-deals`,
    about: 'Discounts and offers for tourists and foreign visitors in Sri Lanka',
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-hero relative overflow-hidden pb-16 pt-14 text-paper sm:pb-20 sm:pt-20">
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-orange-100">
              For visitors to Sri Lanka
            </p>
            <h1 className="font-display max-w-2xl text-balance text-4xl font-semibold leading-[1.1] text-white sm:text-6xl">
              Tourist discounts,
              <br />
              <em className="text-amber-200">gathered daily.</em>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-white/85 sm:text-lg">
              Real, live deals from Sri Lankan hotels, restaurants, tours, transport and
              attractions, picked out for foreign visitors. Free to browse, no booking fees.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-coal-deep dark:text-paper">
              Deals for tourists
            </h2>
            <p className="text-sm text-coal/50 dark:text-paper/50">
              {total} {total === 1 ? 'offer' : 'offers'}
            </p>
          </div>

          {offers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-coal/20 bg-paper-soft/60 px-6 py-24 text-center dark:border-white/15 dark:bg-white/[0.03]">
              <p className="font-display text-xl font-semibold text-coal-deep dark:text-paper">
                No tourist offers right now
              </p>
              <p className="mt-1 text-sm text-coal/50 dark:text-paper/50">
                Check back soon, new deals land daily. Meanwhile, browse{' '}
                <a href="/" className="font-semibold text-flame-deep hover:underline">
                  all offers
                </a>
                .
              </p>
            </div>
          ) : (
            <>
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
              <Paginator page={page} totalPages={totalPages} hrefFor={hrefFor} />
            </>
          )}
        </section>
      </main>
      <SiteFooter />
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </>
  );
}
