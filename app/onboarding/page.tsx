import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import OnboardingForm from '@/app/onboarding/OnboardingForm';
import { getSessionUser } from '@/lib/supabase/server';
import { getMyBusiness } from '@/lib/queries/shop';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Set up your shop | OfferCeylon' };

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (await getMyBusiness()) redirect('/dashboard');

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="border-b border-coal/10 bg-coal-deep text-paper">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image
              src="/brand/logo-mark.webp"
              alt=""
              width={13}
              height={22}
              unoptimized
              className="h-[22px] w-auto object-contain"
            />
            <span className="font-display text-lg font-semibold tracking-tight">
              Offer<span className="text-flame">Ceylon</span>
            </span>
          </Link>
          <span className="text-sm text-paper/60">Shop setup</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-coal-deep">
          Set up your shop
        </h1>
        <p className="mt-1.5 max-w-lg text-[15px] leading-6 text-coal/60">
          A few details and you are ready to post offers across Sri Lanka.
        </p>

        <div className="mt-8 rounded-2xl border border-coal/12 bg-paper-soft p-6 sm:p-8">
          <OnboardingForm />
        </div>
      </main>
    </div>
  );
}
