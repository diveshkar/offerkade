import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminOfferForm from '@/app/admin/offers/AdminOfferForm';
import {
  getAdminOffer,
  getBusinessBranches,
  getOfferBranchIds,
} from '@/lib/queries/admin';
import { getCategoriesForForm } from '@/lib/queries/shop';

export const metadata: Metadata = { title: 'Edit offer · Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminEditOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [offer, categories] = await Promise.all([getAdminOffer(id), getCategoriesForForm()]);
  if (!offer) notFound();

  const [branches, initialBranchIds] = await Promise.all([
    offer.business_id ? getBusinessBranches(offer.business_id) : Promise.resolve([]),
    getOfferBranchIds(offer.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/offers" className="text-sm text-coal/55 transition hover:text-coal-deep">
          Back to offers
        </Link>
        <h1 className="font-display mt-3 text-2xl font-semibold tracking-tight text-coal-deep">
          Edit offer
        </h1>
      </div>

      <AdminOfferForm
        offer={offer}
        categories={categories}
        shopName={offer.business?.name}
        branches={branches}
        initialBranchIds={initialBranchIds}
      />
    </div>
  );
}
