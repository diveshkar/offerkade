import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthSplit from '@/app/components/AuthSplit';
import RegisterForm from '@/app/register/RegisterForm';
import { getSessionUser } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Create a shop account | OfferCeylon',
  description: 'List your offers on OfferCeylon for free.',
};

export default async function RegisterPage() {
  if (await getSessionUser()) redirect('/dashboard');

  return (
    <AuthSplit
      title="Create your shop account"
      subtitle="Start with your email. Shop details come next."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-flame-deep hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthSplit>
  );
}
