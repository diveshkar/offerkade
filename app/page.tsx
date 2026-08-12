import { Suspense } from 'react';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import FilterBar from '@/app/components/FilterBar';
import OfferCard from '@/app/components/OfferCard';
import Paginator from '@/app/components/Paginator';
import { CheckIcon } from '@/app/components/Icons';
import { getCategories, getActiveCities, listOffers } from '@/lib/queries/offers';

// Always render fresh: offers change and expire daily.
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
    page: Math.max(1, parseInt(one(sp.page) ?? '1', 10) || 1),
  };

  const [categories, cities, result] = await Promise.all([
    getCategories(),
    getActiveCities(),
    listOffers(filters),
  ]);

  const { offers, total, page, totalPages } = result;

  const hasFilters = Boolean(
    filters.categorySlug || filters.city || filters.endingSoon || filters.search,
  );

  // Page links keep the active filters.
  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (filters.categorySlug) params.set('category', filters.categorySlug);
    if (filters.city) params.set('city', filters.city);
    if (filters.endingSoon) params.set('ending', '1');
    if (filters.search) params.set('q', filters.search);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/?${qs}` : '/';
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* ===== Hero ===== */}
        <section className="bg-hero relative overflow-hidden pb-24 pt-16 text-paper sm:pb-32 sm:pt-24">
          {/* Gold ambient glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-amber-200/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 left-[-8%] h-80 w-80 rounded-full bg-orange-950/25 blur-3xl"
          />
          {/* Hairline ring ornament */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 top-1/2 hidden h-[480px] w-[480px] -translate-y-1/2 rounded-full border border-white/15 lg:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-1/2 hidden h-[320px] w-[320px] -translate-y-1/2 rounded-full border border-white/10 lg:block"
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
              <div>
                <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-orange-100">
                  Sri Lanka&apos;s daily offers hub
                </p>

                <h1 className="font-display max-w-2xl text-balance text-5xl font-semibold leading-[1.05] text-white sm:text-7xl">
                  The island&apos;s best offers,
                  <br />
                  <em className="text-amber-200">gathered daily.</em>
                </h1>

                <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-white/85 sm:text-lg">
                  Restaurants, shops, furniture, coffee. Live deals from real businesses across Sri
                  Lanka, free to browse. When an offer ends, it disappears.
                </p>

                {/* Trust row */}
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] text-white/85">
                  {[`${total} live right now`, 'Free to browse', 'Always current'].map((point) => (
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

              {/* Poster collage: a few real, live offers, shown as a tilted
                  stack instead of a stock photo or plain graphic. */}
              {offers.length > 0 && (
                <div className="relative hidden h-[340px] lg:block" aria-hidden>
                  {offers.slice(0, 3).map((o, i) => (
                    <div
                      key={o.id}
                      className="absolute w-[210px] overflow-hidden rounded-2xl border border-white/10 bg-coal-soft shadow-[0_28px_60px_-20px_rgba(0,0,0,0.6)]"
                      style={{
                        top: `${i * 34}px`,
                        left: `${i * 52}px`,
                        transform: `rotate(${(i - 1) * 5}deg)`,
                        zIndex: 3 - i,
                      }}
                    >
                      <div className="aspect-[4/3] bg-coal/40">
                        {o.poster_thumb_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={o.poster_thumb_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="truncate text-[13px] font-semibold text-white">{o.title}</p>
                        <p className="mt-0.5 truncate text-[11px] text-white/50">{o.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===== Floating filter card ===== */}
        <div className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 sm:-mt-14 sm:px-6">
          <div className="animate-rise rounded-3xl border border-coal/10 bg-paper-soft/95 p-4 shadow-[0_28px_60px_-28px_rgba(18,13,10,0.45)] backdrop-blur-xl sm:p-5 dark:border-white/10 dark:bg-coal-soft/95">
            <Suspense fallback={<div className="h-[104px]" />}>
              <FilterBar categories={categories} cities={cities} />
            </Suspense>
          </div>
        </div>

        {/* ===== Grid ===== */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-coal-deep dark:text-paper">
              {hasFilters ? 'Matching offers' : "Today's offers"}
            </h2>
            <p className="text-sm text-coal/50 dark:text-paper/50">
              {total} {total === 1 ? 'offer' : 'offers'}
              {totalPages > 1 && ` · page ${page} of ${totalPages}`}
            </p>
          </div>

          {offers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-coal/20 bg-paper-soft/60 px-6 py-24 text-center dark:border-white/15 dark:bg-white/[0.03]">
              <p className="text-4xl" aria-hidden>
                🔍
              </p>
              <p className="font-display mt-4 text-xl font-semibold text-coal-deep dark:text-paper">
                Nothing matches yet
              </p>
              <p className="mt-1 text-sm text-coal/50 dark:text-paper/50">
                Try a different filter, or check back soon. New deals land here every day.
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
    </>
  );
}
