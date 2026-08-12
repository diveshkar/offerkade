import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AuthSplit from '@/app/components/AuthSplit';
import RegisterForm from '@/app/register/RegisterForm';
import { ButtonLink } from '@/app/components/ui';
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
    >
      <RegisterForm />

      <div className="mt-3 border-t border-coal/10 pt-6">
        <p className="mb-2.5 text-sm font-medium text-coal-deep">Already have an account?</p>
        <ButtonLink href="/login" variant="secondary" className="w-full">
          Sign in
        </ButtonLink>
      </div>
    </AuthSplit>
  );
}
