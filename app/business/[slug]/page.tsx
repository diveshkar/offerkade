import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import OfferCard from '@/app/components/OfferCard';
import VerifiedBadge from '@/app/components/VerifiedBadge';
import { PinIcon, WhatsAppIcon, PhoneIcon, GlobeIcon } from '@/app/components/Icons';
import { getBusinessBySlug } from '@/lib/queries/offers';

function waLink(number: string) {
  return `https://wa.me/${number.replace(/[^\d]/g, '')}`;
}

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
        <section className="relative overflow-hidden bg-coal-deep pb-16 pt-12 text-paper">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 right-[-6%] h-72 w-72 rounded-full bg-flame/12 blur-3xl"
          />
          <div className="relative mx-auto flex max-w-6xl items-center gap-5 px-4 sm:px-6">
            {b.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.logo_url}
                alt={b.name}
                className="h-20 w-20 rounded-full border border-flame/25 object-cover shadow-xl"
              />
            ) : (
              <div className="font-display grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-flame-bright to-flame-deep text-3xl font-bold text-coal-deep shadow-xl shadow-flame/20">
                {b.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-4xl">
                  {b.name}
                </h1>
                {b.verified && <VerifiedBadge size="md" />}
              </div>
              {b.city && (
                <p className="mt-1 flex items-center gap-1 text-sm text-paper/60">
                  <PinIcon className="h-3.5 w-3.5" /> {b.city}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ===== Contact ===== */}
        {(b.whatsapp || b.contact_phone || b.website || b.address) && (
          <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
            <div className="rounded-3xl border border-coal/10 bg-paper-soft p-5 shadow-[0_1px_2px_rgba(18,13,10,0.04)] dark:border-white/10 dark:bg-coal-soft sm:p-6">
              {b.address && (
                <p className="mb-4 flex items-start gap-2 text-sm leading-6 text-coal/70 dark:text-paper/70">
                  <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-flame" /> {b.address}
                </p>
              )}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {b.whatsapp && (
                  <a
                    href={waLink(b.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white shadow-md shadow-[#25D366]/25 transition hover:brightness-105 active:scale-[0.98]"
                  >
                    <WhatsAppIcon className="h-4.5 w-4.5" /> WhatsApp
                  </a>
                )}
                {b.contact_phone && (
                  <a
                    href={`tel:${b.contact_phone}`}
                    className="flex h-11 items-center justify-center gap-2 rounded-full bg-coal text-sm font-semibold text-paper shadow-md shadow-coal/25 transition hover:bg-coal-soft active:scale-[0.98]"
                  >
                    <PhoneIcon /> Call now
                  </a>
                )}
                {b.website && (
                  <a
                    href={b.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center justify-center gap-2 rounded-full border border-coal/20 text-sm font-semibold text-coal transition hover:border-flame hover:text-flame-deep active:scale-[0.98] dark:border-white/15 dark:text-paper dark:hover:text-flame-bright"
                  >
                    <GlobeIcon /> Website
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ===== Offers ===== */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-coal-deep dark:text-paper">
              Live offers
            </h2>
            <p className="text-sm text-coal/50 dark:text-paper/50">
              {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
            </p>
          </div>

          {offers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-coal/20 px-6 py-20 text-center dark:border-white/15">
              <p className="text-4xl">🕐</p>
              <p className="font-display mt-4 text-xl font-semibold text-coal-deep dark:text-paper">
                No live offers right now
              </p>
              <p className="mt-1 text-sm text-coal/50 dark:text-paper/50">Check back soon.</p>
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
      <SiteFooter compact />
    </>
  );
}
