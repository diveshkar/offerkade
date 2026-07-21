import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import OfferForm from '@/app/offers/new/OfferForm';
import SiteFooter from '@/app/components/SiteFooter';
import { getSessionUser } from '@/lib/supabase/server';
import { getCategoriesForForm, getMyBranches, getMyBusiness } from '@/lib/queries/shop';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Post an offer | OfferCeylon' };

export default async function NewOfferPage() {
  if (!(await getSessionUser())) redirect('/login');

  const business = await getMyBusiness();
  if (!business) redirect('/onboarding');
  if (business.status !== 'approved') redirect('/dashboard');

  const [categories, branches] = await Promise.all([
    getCategoriesForForm(),
    getMyBranches(business.id),
  ]);

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="shrink-0 border-b border-coal/10 bg-coal-deep text-paper">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-baseline gap-2.5">
            <p className="font-display text-[15px] font-semibold tracking-tight text-flame">Post an offer</p>
            <span aria-hidden className="text-paper/25">|</span>
            <p className="truncate text-[13px] text-paper/60">{business.name}</p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 text-[13px] font-medium text-paper/70 transition hover:text-paper"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-9">
        <div className="rounded-2xl border border-coal/12 bg-paper-soft p-6 shadow-[0_1px_2px_rgba(18,13,10,0.04)] sm:p-8">
          <OfferForm
            categories={categories}
            branches={branches}
            shopName={business.name}
            verified={business.verified}
          />
        </div>
      </main>

      <SiteFooter width="lg" />
    </div>
  );
}
