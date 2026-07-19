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
        <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="transition hover:text-accent-strong dark:hover:text-accent">
            Offers
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate text-zinc-400">{offer.title}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10">
          {/* ===== Poster ===== */}
          <div className="md:sticky md:top-24 md:self-start">
            <div className="animate-rise overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-100 shadow-[0_24px_60px_-24px_rgba(11,18,32,0.35)] dark:border-white/10 dark:bg-white/5">
              {offer.poster_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={offer.poster_url} alt={offer.title} className="w-full object-cover" />
              ) : (
                <div className="grid aspect-[4/5] place-items-center text-5xl text-zinc-300">
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
                <span className="rounded-full bg-brand/5 px-3 py-1.5 text-[13px] font-medium text-brand ring-1 ring-brand/10 dark:bg-white/10 dark:text-zinc-200 dark:ring-white/10">
                  {offer.category.icon} {offer.category.name}
                </span>
              )}
              {offer.is_featured && (
                <span className="rounded-full bg-gradient-to-b from-accent to-accent-strong px-3 py-1.5 text-[13px] font-bold text-brand shadow-sm">
                  ★ Featured
                </span>
              )}
              {urgent && (
                <span className="rounded-full bg-red-600 px-3 py-1.5 text-[13px] font-bold text-white shadow-sm">
                  ⏰ {left <= 0 ? 'Last day' : left === 1 ? '1 day left' : `${left} days left`}
                </span>
              )}
            </div>

            <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              {offer.title}
            </h1>

            {offer.description && (
              <p className="whitespace-pre-line text-pretty leading-7 text-zinc-600 dark:text-zinc-300">
                {offer.description}
              </p>
            )}

            {/* Meta cards */}
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {offer.city && (
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 dark:border-white/10 dark:bg-ink-soft">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    📍 {offer.city}
                  </dd>
                </div>
              )}
              {offer.location_note && (
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 dark:border-white/10 dark:bg-ink-soft">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Branches
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {offer.location_note}
                  </dd>
                </div>
              )}
              <div
                className={`rounded-2xl border p-3.5 ${
                  urgent
                    ? 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10'
                    : 'border-zinc-200/80 bg-white dark:border-white/10 dark:bg-ink-soft'
                }`}
              >
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Valid until
                </dt>
                <dd
                  className={`mt-1 text-sm font-semibold ${
                    urgent ? 'text-red-600 dark:text-red-400' : 'text-zinc-800 dark:text-zinc-100'
                  }`}
                >
                  {prettyDate(offer.end_date)}
                </dd>
              </div>
            </dl>

            {/* Business card */}
            {b && (
              <div className="mt-1 rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-ink-soft">
                <div className="flex items-center gap-3.5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-lg font-extrabold text-accent">
                    {b.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Offered by
                    </p>
                    <Link
                      href={`/business/${b.slug}`}
                      className="block truncate text-lg font-bold text-zinc-900 transition hover:text-accent-strong dark:text-zinc-50 dark:hover:text-accent"
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
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white shadow-md shadow-[#25D366]/25 transition hover:brightness-105 active:scale-[0.98]"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                  {b.contact_phone && (
                    <a
                      href={`tel:${b.contact_phone}`}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand-light active:scale-[0.98]"
                    >
                      📞 Call now
                    </a>
                  )}
                  {b.website && (
                    <a
                      href={b.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 transition hover:border-accent hover:text-accent-strong active:scale-[0.98] dark:border-white/15 dark:text-zinc-200 dark:hover:text-accent"
                    >
                      🌐 Website
                    </a>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs leading-5 text-zinc-400">
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
