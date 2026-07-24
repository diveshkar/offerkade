import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SiteFooter from '@/app/components/SiteFooter';
import ConfirmButton from '@/app/components/ConfirmButton';
import { StatusPill } from '@/app/components/ui';
import { getSessionUser } from '@/lib/supabase/server';
import { getMyBusiness } from '@/lib/queries/shop';
import { signOut } from '@/app/dashboard/actions';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const business = await getMyBusiness();
  if (!business) redirect('/onboarding');

  return (
    <>
      <header className="border-b border-coal/10 bg-coal-deep text-paper">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/dashboard" className="flex min-w-0 flex-1 items-baseline gap-2.5">
            <span className="hidden shrink-0 font-display text-[15px] font-semibold tracking-tight text-flame sm:inline">
              Shop dashboard
            </span>
            <span aria-hidden className="hidden shrink-0 text-paper/25 sm:inline">|</span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-paper/70 sm:text-paper/60">
              {business?.name ?? 'Your shop'}
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2.5">
            <StatusPill status={business.status} size="md" />
            <ConfirmButton
              action={signOut}
              triggerLabel="Sign out"
              triggerClassName="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-[13px] font-semibold text-paper transition hover:border-white/40 active:scale-[0.98]"
              title="Sign out?"
              message="You’ll be signed out and need to log in again to manage your offers."
              confirmLabel="Sign out"
              tone="primary"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 bg-paper">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">{children}</div>
      </main>

      <SiteFooter width="lg" compact />
    </>
  );
}
