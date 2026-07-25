import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BusinessEditForm from '@/app/admin/shops/BusinessEditForm';
import { getBusinessById } from '@/lib/queries/admin';

export const metadata: Metadata = { title: 'Edit shop · Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminEditShopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getBusinessById(id);
  if (!business) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/shops" className="text-sm text-coal/55 transition hover:text-coal-deep">
          Back to shops
        </Link>
        <h1 className="font-display mt-3 text-2xl font-semibold tracking-tight text-coal-deep">
          Edit shop details
        </h1>
        <p className="mt-1 text-[15px] text-coal/60">
          Approval status and verification are managed from the shops list, not here.
        </p>
      </div>

      <BusinessEditForm business={business} />
    </div>
  );
}
