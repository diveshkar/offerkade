import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AuthSplit from '@/app/components/AuthSplit';
import LoginForm from '@/app/login/LoginForm';
import { ButtonLink } from '@/app/components/ui';
import { getSessionUser } from '@/lib/supabase/server';
import { landingPathForCurrentUser } from '@/lib/auth-routing';

export const metadata: Metadata = {
  title: 'Shop login | OfferCeylon',
  description: 'Sign in to manage your business offers on OfferCeylon.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSessionUser()) redirect(await landingPathForCurrentUser());

  const { error } = await searchParams;
  const notice =
    error === 'link_expired' ? 'That link has expired. Sign in or request a new one.' : undefined;

  return (
    <AuthSplit
      title="Welcome back"
      subtitle="Sign in to post and manage your offers."
      footer={
        <p className="text-center text-coal/50">
          Don&apos;t have a shop account yet? Use the button below.
        </p>
      }
    >
      <LoginForm notice={notice} />

      <div className="mt-3 border-t border-coal/10 pt-6">
        <p className="mb-2.5 text-sm font-medium text-coal-deep">New shop owner?</p>
        <ButtonLink href="/register" variant="secondary" className="w-full">
          Create a shop account
        </ButtonLink>
      </div>
    </AuthSplit>
  );
}
