'use client';

import { useState } from 'react';
import { Alert, Button, Field, Input } from '@/app/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (resetError) {
      setError(
        /rate limit/i.test(resetError.message)
          ? 'Too many emails have been sent recently. Please try again in an hour.'
          : resetError.message,
      );
      setBusy(false);
      return;
    }

    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-4">
        <p className="text-sm font-semibold text-emerald-800">Check your email</p>
        <p className="mt-1 text-sm leading-6 text-emerald-900/75">
          If an account exists for <span className="font-medium">{email}</span>, a reset link is on
          its way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {error && <Alert tone="error">{error}</Alert>}

      <Field label="Email" required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@yourshop.lk"
          required
        />
      </Field>

      <Button type="submit" disabled={busy}>
        {busy ? 'Sending link' : 'Send reset link'}
      </Button>
    </form>
  );
}
