import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ConfirmButton from '@/app/components/ConfirmButton';
import DashboardNav from '@/app/dashboard/DashboardNav';
import { StatusPill } from '@/app/components/ui';
import { getSessionUser } from '@/lib/supabase/server';
import { getMyBusiness } from '@/lib/queries/shop';
import { getCurrentAdmin } from '@/lib/queries/admin';
import { signOut } from '@/app/dashboard/actions';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const [business, admin] = await Promise.all([getMyBusiness(), getCurrentAdmin()]);
  // An admin without a shop belongs in the admin panel, not onboarding.
  if (!business) redirect(admin ? '/admin' : '/onboarding');

  // Nav only makes sense once approved, since the offer tools redirect otherwise.
  const approved = business.status === 'approved';

  const signOutBtn = (
    <ConfirmButton
      action={signOut}
      triggerLabel="Sign out"
      triggerClassName="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 text-[13px] font-semibold text-paper/90 transition hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
      title="Sign out?"
      message="You’ll be signed out and need to log in again to manage your offers."
      confirmLabel="Sign out"
      tone="primary"
    />
  );

  const brand = (
    <div className="flex min-w-0 flex-col gap-2">
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-flame-bright to-flame-deep">
          <Image src="/brand/logo-mark.webp" alt="" width={13} height={22} unoptimized className="h-[22px] w-auto object-contain" />
        </span>
        <span className="font-display text-[15px] font-semibold tracking-tight text-paper">
          Offer<span className="text-flame">Ceylon</span>
          <span className="ml-1.5 rounded bg-flame/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-flame">
            Shop
          </span>
        </span>
      </Link>
      <div className="flex min-w-0 items-center gap-2 pl-0.5">
        <span className="min-w-0 truncate text-[13px] text-paper/60">{business.name}</span>
        <StatusPill status={business.status} />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Desktop sidebar: sticky so nav + footer buttons stay reachable */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-coal-deep p-5 lg:flex lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="flex flex-col gap-8">
          {brand}
          {approved && <DashboardNav variant="sidebar" />}
        </div>
        <div className="flex flex-col gap-2 border-t border-white/10 pt-4 text-[13px]">
          <Link href="/" className="rounded-lg px-3.5 py-2 font-medium text-paper/60 transition hover:bg-white/10 hover:text-paper">
            View site
          </Link>
          {admin && (
            <Link href="/admin" className="rounded-lg px-3.5 py-2 font-medium text-paper/60 transition hover:bg-white/10 hover:text-paper">
              Admin panel
            </Link>
          )}
          {signOutBtn}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between gap-3 bg-coal-deep px-4 py-3 lg:hidden">
          {brand}
          <div className="flex shrink-0 items-center gap-1">
            <Link href="/" className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-paper/70 hover:text-paper">
              View site
            </Link>
            {admin && (
              <Link href="/admin" className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-paper/70 hover:text-paper">
                Admin
              </Link>
            )}
            <ConfirmButton
              action={signOut}
              triggerLabel="Sign out"
              triggerClassName="inline-flex h-9 items-center justify-center rounded-lg border border-white/20 bg-white/5 px-3 text-[13px] font-semibold text-paper/90 transition hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
              title="Sign out?"
              message="You’ll be signed out and need to log in again to manage your offers."
              confirmLabel="Sign out"
              tone="primary"
            />
          </div>
        </header>
        {approved && (
          <div className="bg-coal-deep px-4 pb-3 lg:hidden">
            <DashboardNav variant="top" />
          </div>
        )}

        <main className="flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
