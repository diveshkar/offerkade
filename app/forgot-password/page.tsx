import type { Metadata } from 'next';
import Link from 'next/link';
import AuthSplit from '@/app/components/AuthSplit';
import ForgotPasswordForm from '@/app/forgot-password/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset your password | OfferCeylon',
  description: 'Request a password reset link for your OfferCeylon shop account.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthSplit
      title="Reset your password"
      subtitle="We will email you a link to choose a new one."
      footer={
        <Link href="/login" className="font-semibold text-flame-deep hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthSplit>
  );
}
