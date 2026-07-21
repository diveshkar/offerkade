import type { Metadata } from 'next';
import AuthSplit from '@/app/components/AuthSplit';
import ResetPasswordForm from '@/app/reset-password/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Choose a new password | OfferCeylon',
};

export default function ResetPasswordPage() {
  return (
    <AuthSplit title="Choose a new password" subtitle="Pick something you have not used before.">
      <ResetPasswordForm />
    </AuthSplit>
  );
}
