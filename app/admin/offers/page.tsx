import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, StatusPill, Input, Button, ButtonLink } from '@/app/components/ui';
import ConfirmButton from '@/app/components/ConfirmButton';
import Paginator from '@/app/components/Paginator';
import { PlusIcon, SearchIcon, EyeIcon } from '@/app/components/Icons';
import { listAllOffers } from '@/lib/queries/admin';
import { removeOffer, expireOffer, toggleFeatured, toggleTourist } from '@/app/admin/actions';
import type { OfferStatus } from '@/lib/database.types';

// Shared styling for the compact per-offer action buttons, so Edit / Feature /
// Expire / Remove line up and stay comfortable to tap on a phone.
const ACTION_BTN =
  'inline-flex h-9 items-center justify-center rounded-lg border px-3 text-[12px] font-semibold transition active:scale-[0.98]';
const ACTION_NEUTRAL = 'border-coal/15 bg-paper-soft text-coal-deep hover:border-coal/30';
const ACTION_DANGER = 'border-ember/30 bg-ember/5 text-ember hover:bg-ember/10';

export const metadata: Metadata = { title: 'Offers · Admin' };
export const dynamic = 'force-dynamic';

function when(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const PER_PAGE = 8;

const TABS: { label: string; value?: OfferStatus }[] = [
  { label: 'All' },
  { label: 'Approved', value: 'approved' },
  { label: 'Draft', value: 'draft' },
  { label: 'Expired', value: 'expired' },
  { label: 'Rejected', value: 'rejected' },
];

export default async function AdminOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}) {
  const { page: pageParam, status, q } = await searchParams;
  const active = TABS.find((t) => t.value === status)?.value;
  const search = (q ?? '').trim();

  const offers = await listAllOffers({ status: active, q: search || undefined });

  const totalPages = Math.max(1, Math.ceil(offers.length / PER_PAGE));
  const page = Math.min(Math.max(1, parseInt(pageParam ?? '1', 10) || 1), totalPages);
  const visible = offers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Build hrefs that carry the active filter + search across tab and page links.
  const hrefWith = (over: { status?: OfferStatus; q?: string; page?: number }) => {
    const sp = new URLSearchParams();
    const s = 'status' in over ? over.status : active;
    const query = 'q' in over ? over.q : search || undefined;
    if (s) sp.set('status', s);
    if (query) sp.set('q', query);
    if (over.page && over.page > 1) sp.set('page', String(over.page));
    const str = sp.toString();
    return str ? `/admin/offers?${str}` : '/admin/offers';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-coal-deep">Offers</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <ButtonLink href="/admin/offers/curate" variant="secondary" size="sm" className="w-full sm:w-auto">
            <PlusIcon className="h-4 w-4" />
            Post as OfferCeylon
          </ButtonLink>
          <ButtonLink href="/admin/offers/new" size="sm" className="w-full sm:w-auto">
            <PlusIcon className="h-4 w-4" />
            Quick-add (shop)
          </ButtonLink>
        </div>
      </div>

      {/* Status tabs. Scroll sideways on small screens instead of wrapping. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => {
          const on = t.value === active || (!t.value && !active);
          return (
            <Link
              key={t.label}
              href={hrefWith({ status: t.value, page: 1 })}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                on
                  ? 'border-coal bg-coal text-paper'
                  : 'border-coal/15 bg-paper-soft text-coal/70 hover:border-coal/30'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Search (title). Preserves the active status tab via a hidden field. */}
      <form method="get" action="/admin/offers" className="flex flex-wrap items-center gap-2">
        {active && <input type="hidden" name="status" value={active} />}
        <div className="relative min-w-[12rem] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coal/40" />
          <Input name="q" defaultValue={search} placeholder="Search by title" className="pl-10" />
        </div>
        <Button type="submit" variant="secondary" size="md" className="shrink-0">
          Search
        </Button>
        {search && (
          <ButtonLink href={hrefWith({ q: undefined, page: 1 })} variant="secondary" size="md" className="shrink-0">
            Clear
          </ButtonLink>
        )}
      </form>

      <p className="text-sm text-coal/55">
        {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
        {active || search ? ' match this filter' : ' shown (newest 200)'}
      </p>

      {offers.length === 0 ? (
        <Card>
          <p className="text-sm text-coal/60">No offers in this view.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((o) => (
            <Card key={o.id} className="flex items-start gap-4">
              {o.poster_thumb_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={o.poster_thumb_url} alt="" className="h-20 w-16 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-20 w-16 shrink-0 rounded-lg bg-coal/10" />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/offer/${o.id}`} className="font-semibold text-coal-deep hover:text-flame-deep">
                    {o.title}
                  </Link>
                  <StatusPill status={o.status} />
                  {o.is_featured && (
                    <span className="rounded-full bg-flame/15 px-2 py-0.5 text-[11px] font-semibold text-flame-deep">Featured</span>
                  )}
                  {o.tourist_friendly && (
                    <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300">Tourist</span>
                  )}
                </div>
                <p className="mt-0.5 text-[13px] text-coal/60">
                  {o.business ? (
                    <Link href={`/business/${o.business.slug}`} className="hover:underline">
                      {o.business.name}
                    </Link>
                  ) : (
                    'Unknown shop'
                  )}
                  {o.business && o.business.status !== 'approved' ? ` (${o.business.status})` : ''}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] tabular-nums text-coal/50">
                  <span>ends {when(o.end_date)}</span>
                  <span className="inline-flex items-center gap-1">
                    <EyeIcon className="h-3.5 w-3.5 text-coal/35" /> {o.view_count}
                  </span>
                  <span>{o.lead_count} leads</span>
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/admin/offers/${o.id}/edit`} className={`${ACTION_BTN} ${ACTION_NEUTRAL}`}>
                    Edit
                  </Link>
                  {/* Admin-only tourist toggle — works on every offer, incl. shop-posted. */}
                  <form action={toggleTourist}>
                    <input type="hidden" name="id" value={o.id} />
                    <input type="hidden" name="tourist" value={String(o.tourist_friendly)} />
                    <button
                      className={`${ACTION_BTN} ${
                        o.tourist_friendly
                          ? 'border-sky-400 bg-sky-500/10 text-sky-700 dark:text-sky-300'
                          : ACTION_NEUTRAL
                      }`}
                    >
                      {o.tourist_friendly ? 'Untag tourist' : 'Tag tourist'}
                    </button>
                  </form>
                  <ConfirmButton
                    action={toggleFeatured}
                    fields={{ id: o.id, featured: String(o.is_featured) }}
                    triggerLabel={o.is_featured ? 'Unfeature' : 'Feature'}
                    triggerClassName={`${ACTION_BTN} ${ACTION_NEUTRAL}`}
                    title={o.is_featured ? 'Remove featured?' : 'Feature this offer?'}
                    message={o.is_featured ? 'It will no longer be pinned.' : 'It will be pinned to the top of the grid.'}
                    confirmLabel="Confirm"
                    tone="primary"
                  />
                  {o.status === 'approved' && (
                    <ConfirmButton
                      action={expireOffer}
                      fields={{ id: o.id }}
                      triggerLabel="Expire"
                      triggerClassName={`${ACTION_BTN} ${ACTION_NEUTRAL}`}
                      title="Expire this offer now?"
                      message="It will be hidden from the public site but not deleted."
                      confirmLabel="Expire"
                      tone="primary"
                    />
                  )}
                  <ConfirmButton
                    action={removeOffer}
                    fields={{ id: o.id }}
                    triggerLabel="Remove"
                    triggerClassName={`${ACTION_BTN} ${ACTION_DANGER}`}
                    title="Delete this offer?"
                    message="This permanently deletes the offer and its poster. This cannot be undone."
                    confirmLabel="Delete"
                    tone="danger"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Paginator page={page} totalPages={totalPages} hrefFor={(p) => hrefWith({ page: p })} />
    </div>
  );
}
