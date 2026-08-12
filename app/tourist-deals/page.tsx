import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import OfferCard from '@/app/components/OfferCard';
import Paginator from '@/app/components/Paginator';
import { CheckIcon } from '@/app/components/Icons';
import { getCategories, listOffers } from '@/lib/queries/offers';
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
  const categorySlug = one(sp.category);

  const [categories, { offers, total, totalPages }] = await Promise.all([
    getCategories(),
    listOffers({ touristFriendly: true, categorySlug, page }),
  ]);

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/tourist-deals?${qs}` : '/tourist-deals';
  };
  const categoryHref = (slug?: string) => (slug ? `/tourist-deals?category=${slug}` : '/tourist-deals');

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
              attractions, picked out for foreign visitors.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] text-white/85">
              {['Free to browse', 'No booking fees', 'Updated daily'].map((point) => (
                <span key={point} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-200/15 text-amber-200 ring-1 ring-amber-200/30"
                  >
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {point}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Category quick-filter: tourist deals span hotels, food, transport
            and attractions, so letting visitors narrow by type here (this
            page had no filter at all before) is the actual point of a
            dedicated tourist page instead of just a homepage copy. */}
        {categories.length > 0 && (
          <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
            <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
              <Link
                href={categoryHref()}
                className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                  !categorySlug
                    ? 'border-coal bg-coal text-paper dark:border-flame dark:bg-flame dark:text-coal-deep'
                    : 'border-coal/15 bg-paper-soft text-coal/70 hover:border-flame/60 hover:text-coal dark:border-white/10 dark:bg-coal-soft dark:text-paper/70'
                }`}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={categoryHref(c.slug)}
                  className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                    categorySlug === c.slug
                      ? 'border-coal bg-coal text-paper dark:border-flame dark:bg-flame dark:text-coal-deep'
                      : 'border-coal/15 bg-paper-soft text-coal/70 hover:border-flame/60 hover:text-coal dark:border-white/10 dark:bg-coal-soft dark:text-paper/70'
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

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
