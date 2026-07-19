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

  const hasFilters = Boolean(
    filters.categorySlug || filters.city || filters.endingSoon || filters.search,
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* ===== Hero ===== */}
        <section className="relative overflow-hidden bg-ink pb-24 pt-14 text-white sm:pb-28 sm:pt-20">
          {/* Ambient glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 right-[-10%] h-80 w-80 rounded-full bg-brand-light/60 blur-3xl"
          />

          <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
            <p className="mx-auto mb-4 w-fit rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent backdrop-blur">
              Sri Lanka&apos;s daily offers hub
            </p>
            <h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
              Every offer on the island,{' '}
              <span className="bg-gradient-to-r from-accent to-amber-300 bg-clip-text text-transparent">
                one place.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-zinc-300 sm:text-lg">
              Restaurants, shops, furniture, coffee — live deals from real businesses, free to
              browse. Gone the moment they expire.
            </p>

            {/* Trust row */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {offers.length} live now
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 100% free to browse
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Auto-expires — always current
              </span>
            </div>
          </div>
        </section>

        {/* ===== Floating filter card ===== */}
        <div className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:-mt-16 sm:px-6">
          <div className="animate-rise rounded-2xl border border-zinc-200/70 bg-white/95 p-4 shadow-[0_24px_60px_-24px_rgba(11,18,32,0.35)] backdrop-blur-xl sm:p-5 dark:border-white/10 dark:bg-ink-soft/95">
            <Suspense fallback={<div className="h-[104px]" />}>
              <FilterBar categories={categories} cities={cities} />
            </Suspense>
          </div>
        </div>

        {/* ===== Grid ===== */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {hasFilters ? 'Matching offers' : "Today's offers"}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
            </p>
          </div>

          {offers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/50 px-6 py-24 text-center dark:border-white/15 dark:bg-white/[0.03]">
              <p className="text-4xl">🔎</p>
              <p className="mt-4 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                No offers found
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Try clearing filters — or check back soon, new deals land daily.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {offers.map((o, i) => (
                <div key={o.id} className="animate-rise" style={{ animationDelay: `${Math.min(i * 45, 360)}ms` }}>
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
