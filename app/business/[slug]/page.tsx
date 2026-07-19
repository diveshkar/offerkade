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
        <section className="relative overflow-hidden bg-ink pb-16 pt-12 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/3 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
          />
          <div className="relative mx-auto flex max-w-6xl items-center gap-5 px-4 sm:px-6">
            {b.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.logo_url}
                alt={b.name}
                className="h-20 w-20 rounded-2xl border border-white/15 object-cover shadow-xl"
              />
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-strong text-3xl font-extrabold text-brand shadow-xl shadow-accent/20">
                {b.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{b.name}</h1>
                {b.verified && (
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-400/30">
                    ✓ Verified
                  </span>
                )}
              </div>
              {b.city && <p className="mt-1 text-sm text-zinc-400">📍 {b.city}</p>}
            </div>
          </div>
        </section>

        {/* ===== Offers ===== */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Live offers
            </h2>
            <p className="text-sm text-zinc-500">
              {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
            </p>
          </div>

          {offers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 px-6 py-20 text-center dark:border-white/15">
              <p className="text-4xl">🕐</p>
              <p className="mt-4 font-semibold text-zinc-800 dark:text-zinc-100">
                No live offers right now
              </p>
              <p className="mt-1 text-sm text-zinc-500">Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {offers.map((o, i) => (
                <div
                  key={o.id}
                  className="animate-rise"
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
