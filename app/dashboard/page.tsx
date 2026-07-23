import type { Metadata } from 'next';
import { Alert, ButtonLink, Card, StatusPill } from '@/app/components/ui';
import ConfirmButton from '@/app/components/ConfirmButton';
import Paginator from '@/app/components/Paginator';
import { getMyBusiness, getMyOffers } from '@/lib/queries/shop';
import { daysLeft } from '@/lib/queries/offers';
import { deleteOffer } from '@/app/dashboard/actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Dashboard | OfferCeylon' };

function prettyDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const PER_PAGE = 10;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; published?: string; draft?: string }>;
}) {
  const business = await getMyBusiness();

  if (!business) {
    return (
      <Alert tone="error" title="No shop linked to this account">
        Please contact support@offerceylon.lk and we will connect your shop.
      </Alert>
    );
  }

  if (business.status !== 'approved') {
    const pending = business.status === 'pending';
    return (
      <div className="mx-auto max-w-xl">
        <Card className="text-center">
          <StatusPill status={business.status} />
          <h2 className="font-display mt-4 text-2xl font-semibold tracking-tight text-coal-deep">
            {pending ? 'Your shop is under review' : 'Your shop was not approved'}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[15px] leading-7 text-coal/60">
            {pending
              ? 'We check every shop before its offers go live. This usually takes a day. We will email you as soon as you are approved.'
              : 'Reply to our email if you think this was a mistake and we will take another look.'}
          </p>
        </Card>
      </div>
    );
  }

  const offers = await getMyOffers(business.id);
  const { page: pageParam, published, draft } = await searchParams;
  const totalPages = Math.max(1, Math.ceil(offers.length / PER_PAGE));
  const page = Math.min(Math.max(1, parseInt(pageParam ?? '1', 10) || 1), totalPages);
  const visible = offers.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const live = offers.filter((o) => o.status === 'approved' && daysLeft(o.end_date) >= 0);
  const views = offers.reduce((sum, o) => sum + (o.view_count ?? 0), 0);
  const leads = offers.reduce((sum, o) => sum + (o.lead_count ?? 0), 0);

  const stats = [
    { label: 'Live offers', value: live.length },
    { label: 'Total posted', value: offers.length },
    { label: 'Views', value: views },
    { label: 'Code reveals', value: leads },
  ];

  return (
    <div className="flex flex-col gap-8">
      {published && (
        <Alert tone="success" title="Offer published">
          Your offer is now live on OfferCeylon. Published offers can’t be edited.
        </Alert>
      )}
      {draft && (
        <Alert tone="success" title="Draft saved">
          Your draft is saved. Open it any time to keep editing or publish it.
        </Alert>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-coal-deep">
            Your offers
          </h1>
          <p className="mt-1 text-[15px] text-coal/60">
            Offers go live the moment you post them.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <ButtonLink href="/dashboard/branches" variant="secondary">
            Branches
          </ButtonLink>
          <ButtonLink href="/offers/new">Post an offer</ButtonLink>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-coal/12 bg-paper-soft p-4">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-coal/45">
              {s.label}
            </dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-coal-deep">{s.value}</dd>
          </div>
        ))}
      </dl>

      {offers.length === 0 ? (
        <Card className="py-16 text-center">
          <h2 className="font-display text-xl font-semibold text-coal-deep">No offers yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-coal/55">
            Post your first deal and it will appear on OfferCeylon straight away.
          </p>
          <div className="mt-6">
            <ButtonLink href="/offers/new">Post an offer</ButtonLink>
          </div>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((offer) => {
            const left = daysLeft(offer.end_date);
            const isDraft = offer.status === 'draft';
            // Drafts never read as "expired" — their end date is a placeholder.
            const expired = !isDraft && (offer.status === 'expired' || left < 0);

            return (
              <li
                key={offer.id}
                className="flex items-center gap-4 rounded-2xl border border-coal/12 bg-paper-soft p-3 sm:p-4"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-coal/5">
                  {offer.poster_thumb_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={offer.poster_thumb_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-coal-deep">{offer.title}</p>
                    <StatusPill status={expired ? 'expired' : offer.status} />
                  </div>
                  <p className="mt-1 text-[13px] text-coal/55">
                    {offer.category?.name ? `${offer.category.name} in ` : ''}
                    {offer.city}
                  </p>
                  <p className="mt-0.5 text-[12px] tabular-nums text-coal/45">
                    {isDraft ? (
                      'Draft · not published yet'
                    ) : (
                      <>
                        Valid until {prettyDate(offer.end_date)}
                        {' | '}
                        {offer.view_count ?? 0} views
                      </>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {isDraft && (
                    <ButtonLink href={`/offers/${offer.id}/edit`} variant="secondary" size="sm">
                      Edit
                    </ButtonLink>
                  )}
                  <ConfirmButton
                    action={deleteOffer}
                    fields={{ id: offer.id }}
                    triggerLabel="Delete"
                    triggerClassName="rounded-lg px-3 py-2 text-sm font-medium text-coal/50 transition hover:bg-ember/8 hover:text-ember"
                    title={isDraft ? 'Delete this draft?' : 'Delete this offer?'}
                    message={`"${offer.title}" will be permanently removed and can’t be recovered.`}
                    confirmLabel={isDraft ? 'Delete draft' : 'Delete offer'}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Paginator
        page={page}
        totalPages={totalPages}
        hrefFor={(p) => (p > 1 ? `/dashboard?page=${p}` : '/dashboard')}
      />
    </div>
  );
}
