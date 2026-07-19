import { Suspense } from 'react';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import FilterBar from '@/app/components/FilterBar';
import OfferCard from '@/app/components/OfferCard';
import { getCategories, getActiveCities, listOffers } from '@/lib/queries/offers';

// Always render fresh — offers change and expire daily.
export const dynamic = 'force-dynamic';

type SP = { [k: string]: string | string[] | undefined };

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const filters = {
    categorySlug: one(sp.category),
    city: one(sp.city),
    endingSoon: one(sp.ending) === '1',
    search: one(sp.q),
  };

  const [categories, cities, offers] = await Promise.all([
    getCategories(),
    getActiveCities(),
    listOffers(filters),
  ]);

  const hasFilters = filters.categorySlug || filters.city || filters.endingSoon || filters.search;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            Today&apos;s offers in Sri Lanka
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {offers.length} live {offers.length === 1 ? 'offer' : 'offers'}
            {hasFilters ? ' matching your filters' : ' — free to browse'}
          </p>
        </div>

        <div className="mb-6">
          <Suspense fallback={<div className="h-24" />}>
            <FilterBar categories={categories} cities={cities} />
          </Suspense>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 py-20 text-center text-zinc-500 dark:border-white/15">
            <p className="text-lg font-semibold">No offers found</p>
            <p className="text-sm">Try clearing filters or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {offers.map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
