import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import BranchManager from '@/app/dashboard/branches/BranchManager';
import { getMyBranches, getMyBusiness } from '@/lib/queries/shop';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Branches | OfferCeylon' };

export default async function BranchesPage() {
  const business = await getMyBusiness();
  if (!business) redirect('/onboarding');

  const branches = await getMyBranches(business.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/dashboard" className="text-sm text-coal/55 transition hover:text-coal-deep">
          Back to dashboard
        </Link>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-coal-deep">
          Your branches
        </h1>
        <p className="mt-1 text-[15px] text-coal/60">
          Add a branch whenever you open a new location. You can pick which branches each offer
          applies to.
        </p>
      </div>

      <BranchManager branches={branches} />
    </div>
  );
}
