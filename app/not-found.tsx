import type { Metadata } from 'next';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import { ButtonLink } from '@/app/components/ui';

export const metadata: Metadata = { title: 'Page not found · OfferCeylon' };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-md text-center">
          <p className="font-display text-7xl font-semibold leading-none text-flame sm:text-8xl">
            404
          </p>
          <h1 className="font-display mt-4 text-2xl font-semibold tracking-tight text-coal-deep sm:text-3xl">
            This deal wandered off
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-7 text-coal/60">
            The page you&apos;re looking for doesn&apos;t exist, or the offer may have already
            expired and come down. Let&apos;s find you a fresh one.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/">Browse offers</ButtonLink>
            <ButtonLink href="/register" variant="secondary">
              List your offer
            </ButtonLink>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
