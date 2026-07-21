import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthSplit from '@/app/components/AuthSplit';
import LoginForm from '@/app/login/LoginForm';
import { getSessionUser } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Shop login | OfferCeylon',
  description: 'Sign in to manage your business offers on OfferCeylon.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSessionUser()) redirect('/dashboard');

  const { error } = await searchParams;
  const notice =
    error === 'link_expired' ? 'That link has expired. Sign in or request a new one.' : undefined;

  return (
    <AuthSplit
      title="Welcome back"
      subtitle="Sign in to post and manage your offers."
      footer={
        <>
          New to OfferCeylon?{' '}
          <Link href="/register" className="font-semibold text-flame-deep hover:underline">
            Create a shop account
          </Link>
        </>
      }
    >
      <LoginForm notice={notice} />
    </AuthSplit>
  );
}
