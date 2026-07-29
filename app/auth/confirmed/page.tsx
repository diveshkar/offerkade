import type { Metadata } from 'next';
import AuthSplit from '@/app/components/AuthSplit';
import { ButtonLink } from '@/app/components/ui';

export const metadata: Metadata = { title: 'Email confirmed | OfferCeylon' };

// The confirming device (often a phone) lands here after clicking the email
// link. If they signed up on another device, that device continues on its own;
// this page just lets them go back, or continue here if this is their only one.
export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/onboarding';

  return (
    <AuthSplit title="Email confirmed" subtitle="Your account is now active.">
      <div className="flex flex-col gap-5">
        <p className="text-sm leading-6 text-coal/70">
          If you signed up on another device, head back there to finish setting up your shop. It
          continues on its own. Only using this device? Continue here.
        </p>
        <ButtonLink href={target}>Continue setup</ButtonLink>
      </div>
    </AuthSplit>
  );
}
