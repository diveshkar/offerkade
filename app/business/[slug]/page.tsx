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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          {b.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.logo_url}
              alt={b.name}
              className="h-16 w-16 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#10182b] text-2xl font-bold text-amber-500">
              {b.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {b.name} {b.verified && <span title="Verified business">✓</span>}
            </h1>
            {b.city && <p className="text-sm text-zinc-500">📍 {b.city}</p>}
          </div>
        </div>

        <h2 className="mb-3 text-lg font-semibold">
          {offers.length} live {offers.length === 1 ? 'offer' : 'offers'}
        </h2>
        {offers.length === 0 ? (
          <p className="text-zinc-500">No live offers right now — check back soon.</p>
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
