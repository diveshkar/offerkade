import type { Metadata } from 'next';
import AuthSplit from '@/app/components/AuthSplit';
import ForgotPasswordForm from '@/app/forgot-password/ForgotPasswordForm';
import { ButtonLink } from '@/app/components/ui';

export const metadata: Metadata = {
  title: 'Reset your password | OfferCeylon',
  description: 'Request a password reset code for your OfferCeylon shop account.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthSplit title="Reset your password" subtitle="We will email you a code to choose a new one.">
      <ForgotPasswordForm />

      <div className="mt-3 border-t border-coal/10 pt-6">
        <ButtonLink href="/login" variant="secondary" className="w-full">
          Back to sign in
        </ButtonLink>
      </div>
    </AuthSplit>
  );
}
