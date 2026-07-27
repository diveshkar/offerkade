import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, Textarea, Button } from '@/app/components/ui';
import ConfirmButton from '@/app/components/ConfirmButton';
import Paginator from '@/app/components/Paginator';
import { EyeIcon } from '@/app/components/Icons';
import { getAdminStats, getTopOffers, listShops } from '@/lib/queries/admin';
import { approveShop, rejectShop } from '@/app/admin/actions';

export const metadata: Metadata = { title: 'Admin · OfferCeylon' };
export const dynamic = 'force-dynamic';

function when(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PER_PAGE = 8;

export default async function AdminOverview({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [stats, pending, topOffers] = await Promise.all([
    getAdminStats(),
    listShops('pending'),
    getTopOffers(5),
  ]);
  const { page: pageParam } = await searchParams;

  const totalPages = Math.max(1, Math.ceil(pending.length / PER_PAGE));
  const page = Math.min(Math.max(1, parseInt(pageParam ?? '1', 10) || 1), totalPages);
  const visiblePending = pending.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex flex-col gap-10">
      {/* Stats */}
      <section>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-coal-deep">Overview</h1>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Pending shops" value={stats.pendingShops} highlight={stats.pendingShops > 0} />
          <Stat label="Approved shops" value={stats.approvedShops} />
          <Stat label="Live offers" value={stats.liveOffers} />
          <Stat label="Offers posted (all time)" value={stats.publishedAllTime} />
          <Stat label="Total views" value={stats.totalViews} />
          <Stat label="Code reveals" value={stats.totalLeads} />
        </div>
      </section>

      {/* Approvals queue */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-coal-deep">Shops awaiting approval</h2>
          <Link href="/admin/shops" className="text-sm font-medium text-flame-deep hover:underline">
            All shops
          </Link>
        </div>

        {pending.length === 0 ? (
          <Card>
            <p className="text-sm text-coal/60">No shops waiting. You&apos;re all caught up.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {visiblePending.map((shop) => (
              <Card key={shop.id} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold text-coal-deep">{shop.name}</p>
                  <p className="mt-0.5 text-sm text-coal/60">
                    {shop.city ?? 'No district'} · applied {when(shop.created_at)}
                  </p>
                  <p className="mt-1 text-[13px] text-coal/55">
                    {shop.contact_email ?? 'no email'}
                    {shop.contact_phone ? ` · ${shop.contact_phone}` : ''}
                    {shop.whatsapp ? ` · WA ${shop.whatsapp}` : ''}
                  </p>
                  {shop.website && (
                    <a href={shop.website} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[13px] text-flame-deep hover:underline">
                      {shop.website}
                    </a>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-64">
                  <ConfirmButton
                    action={approveShop}
                    fields={{ id: shop.id }}
                    triggerLabel="Approve"
                    triggerClassName="inline-flex h-9 items-center justify-center rounded-xl bg-flame px-4 text-[13px] font-semibold text-coal-deep transition hover:brightness-105 active:scale-[0.98]"
                    title={`Approve ${shop.name}?`}
                    message="They'll be able to post offers immediately and get the verified badge."
                    confirmLabel="Approve"
                    tone="primary"
                  />
                  <form action={rejectShop} className="flex flex-col gap-2 rounded-xl border border-coal/10 bg-paper p-2.5">
                    <input type="hidden" name="id" value={shop.id} />
                    <Textarea name="reason" rows={2} placeholder="Reason (shown to the shop)" className="text-[13px]" />
                    <Button type="submit" variant="danger" size="sm">
                      Reject
                    </Button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Paginator
          page={page}
          totalPages={totalPages}
          hrefFor={(p) => (p > 1 ? `/admin?page=${p}` : '/admin')}
        />
      </section>

      {/* Top offers by views */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-coal-deep">Top offers by views</h2>
          <Link href="/admin/offers" className="text-sm font-medium text-flame-deep hover:underline">
            All offers
          </Link>
        </div>

        {topOffers.length === 0 || topOffers.every((o) => (o.view_count ?? 0) === 0) ? (
          <Card>
            <p className="text-sm text-coal/60">No views recorded yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {topOffers.map((o, i) => (
              <Card key={o.id} className="flex items-center gap-4">
                <span className="w-5 shrink-0 text-center font-display text-lg font-semibold text-coal/40">
                  {i + 1}
                </span>
                {o.poster_thumb_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.poster_thumb_url} alt="" className="h-12 w-10 shrink-0 rounded-md object-cover" />
                ) : (
                  <div className="h-12 w-10 shrink-0 rounded-md bg-coal/10" />
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/offer/${o.id}`} className="block truncate font-semibold text-coal-deep hover:text-flame-deep">
                    {o.title}
                  </Link>
                  <p className="mt-0.5 truncate text-[13px] text-coal/55">
                    {o.business?.name ?? 'Unknown shop'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-coal-deep">
                  <EyeIcon className="h-4 w-4 text-coal/40" />
                  <span className="font-semibold tabular-nums">{(o.view_count ?? 0).toLocaleString()}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? 'border-flame/40 bg-flame/5' : 'border-coal/12 bg-paper-soft'}`}>
      <p className="font-display text-2xl font-semibold text-coal-deep">{value.toLocaleString()}</p>
      <p className="text-xs text-coal/55">{label}</p>
    </div>
  );
}
