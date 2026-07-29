import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Alert } from '@/app/components/ui';
import ShopDetailsForm from '@/app/dashboard/settings/ShopDetailsForm';
import { getMyBusiness } from '@/lib/queries/shop';

export const metadata: Metadata = { title: 'Shop details | OfferCeylon' };
export const dynamic = 'force-dynamic';

export default async function ShopSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const business = await getMyBusiness();
  if (!business) redirect('/onboarding');
  const { saved } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-coal-deep">
          Shop details
        </h1>
        <p className="mt-1 text-[15px] text-coal/60">
          Update how your shop appears to customers, or delete your shop.
        </p>
      </div>

      {business.status !== 'approved' && (
        <Alert tone="info">
          You can edit your details anytime. Your changes go live once your shop is approved.
        </Alert>
      )}

      <ShopDetailsForm business={business} saved={saved === '1'} />
    </div>
  );
}
