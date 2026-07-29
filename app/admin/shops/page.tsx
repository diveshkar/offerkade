import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, StatusPill, Textarea, Button, ButtonLink } from '@/app/components/ui';
import ConfirmButton from '@/app/components/ConfirmButton';
import Paginator from '@/app/components/Paginator';
import { listShops } from '@/lib/queries/admin';
import { approveShop, suspendShop, reinstateShop, deleteShop } from '@/app/admin/actions';
import type { BusinessStatus } from '@/lib/database.types';

export const metadata: Metadata = { title: 'Shops · Admin' };
export const dynamic = 'force-dynamic';

const TABS: { label: string; value?: BusinessStatus }[] = [
  { label: 'All' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Rejected', value: 'rejected' },
];

const PER_PAGE = 8;

export default async function AdminShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page: pageParam } = await searchParams;
  const active = TABS.find((t) => t.value === status)?.value;
  const shops = await listShops(active);

  const totalPages = Math.max(1, Math.ceil(shops.length / PER_PAGE));
  const page = Math.min(Math.max(1, parseInt(pageParam ?? '1', 10) || 1), totalPages);
  const visible = shops.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const baseHref = active ? `/admin/shops?status=${active}` : '/admin/shops';
  const hrefFor = (p: number) => {
    if (p <= 1) return baseHref;
    return active ? `/admin/shops?status=${active}&page=${p}` : `/admin/shops?page=${p}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-coal-deep">Shops</h1>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const on = t.value === active || (!t.value && !active);
          return (
            <Link
              key={t.label}
              href={t.value ? `/admin/shops?status=${t.value}` : '/admin/shops'}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
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

      {shops.length === 0 ? (
        <Card>
          <p className="text-sm text-coal/60">No shops in this view.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((shop) => (
            <Card key={shop.id} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/business/${shop.slug}`} className="font-display text-lg font-semibold text-coal-deep hover:text-flame-deep">
                    {shop.name}
                  </Link>
                  <StatusPill status={shop.status} />
                </div>
                <p className="mt-0.5 text-sm text-coal/60">
                  {shop.city ?? 'No district'} · {shop.offer_count} offer{shop.offer_count === 1 ? '' : 's'}
                </p>
                <p className="mt-1 text-[13px] text-coal/55">
                  {shop.contact_email ?? 'no email'}
                  {shop.contact_phone ? ` · ${shop.contact_phone}` : ''}
                </p>
                {shop.status === 'rejected' && shop.rejection_reason && (
                  <p className="mt-1.5 text-[13px] text-ember">Reason: {shop.rejection_reason}</p>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-60">
                {shop.status === 'pending' && (
                  <ConfirmButton
                    action={approveShop}
                    fields={{ id: shop.id }}
                    triggerLabel="Approve"
                    triggerClassName="inline-flex h-9 items-center justify-center rounded-xl bg-flame px-4 text-[13px] font-semibold text-coal-deep transition hover:brightness-105 active:scale-[0.98]"
                    title={`Approve ${shop.name}?`}
                    message="They can post offers immediately and get the verified badge."
                    confirmLabel="Approve"
                    tone="primary"
                  />
                )}

                {shop.status === 'approved' && (
                  <form action={suspendShop} className="flex flex-col gap-2 rounded-xl border border-coal/10 bg-paper p-2.5">
                    <input type="hidden" name="id" value={shop.id} />
                    <Textarea name="reason" rows={2} placeholder="Reason (optional)" className="text-[13px]" />
                    <Button type="submit" variant="danger" size="sm">
                      Suspend (hides offers)
                    </Button>
                  </form>
                )}

                {(shop.status === 'suspended' || shop.status === 'rejected') && (
                  <ConfirmButton
                    action={reinstateShop}
                    fields={{ id: shop.id }}
                    triggerLabel="Reinstate"
                    triggerClassName="inline-flex h-9 items-center justify-center rounded-xl bg-flame px-4 text-[13px] font-semibold text-coal-deep transition hover:brightness-105 active:scale-[0.98]"
                    title={`Reinstate ${shop.name}?`}
                    message="Their status returns to approved and their offers become visible again."
                    confirmLabel="Reinstate"
                    tone="primary"
                  />
                )}

                <ButtonLink href={`/admin/shops/${shop.id}/edit`} variant="secondary" size="sm">
                  Edit details
                </ButtonLink>
                <ConfirmButton
                  action={deleteShop}
                  fields={{ id: shop.id }}
                  triggerLabel="Delete shop"
                  triggerClassName="inline-flex h-9 items-center justify-center rounded-xl border border-ember/30 bg-ember/5 px-4 text-[13px] font-semibold text-ember transition hover:bg-ember/10 active:scale-[0.98]"
                  title={`Delete ${shop.name}?`}
                  message="This permanently deletes the shop and all of its offers and posters. This cannot be undone."
                  confirmLabel="Delete shop"
                  tone="danger"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Paginator page={page} totalPages={totalPages} hrefFor={hrefFor} />
    </div>
  );
}
