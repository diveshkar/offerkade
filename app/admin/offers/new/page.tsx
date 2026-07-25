import type { Metadata } from 'next';
import Link from 'next/link';
import AdminOfferForm from '@/app/admin/offers/AdminOfferForm';
import { Card } from '@/app/components/ui';
import { listApprovedShopsForOffer } from '@/lib/queries/admin';
import { getCategoriesForForm } from '@/lib/queries/shop';

export const metadata: Metadata = { title: 'Quick-add offer · Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminNewOfferPage() {
  const [businesses, categories] = await Promise.all([
    listApprovedShopsForOffer(),
    getCategoriesForForm(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/offers" className="text-sm text-coal/55 transition hover:text-coal-deep">
          Back to offers
        </Link>
        <h1 className="font-display mt-3 text-2xl font-semibold tracking-tight text-coal-deep">
          Quick-add an offer
        </h1>
        <p className="mt-1 text-[15px] text-coal/60">
          Post an offer on behalf of an approved shop. It goes live immediately.
        </p>
      </div>

      {businesses.length === 0 ? (
        <Card>
          <p className="text-sm text-coal/60">
            There are no approved shops yet. Approve a shop first, then post its offers here.
          </p>
        </Card>
      ) : (
        <AdminOfferForm businesses={businesses} categories={categories} />
      )}
    </div>
  );
}
