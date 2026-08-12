'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Field, Input } from '@/app/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const RESEND_COOLDOWN = 30; // seconds

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<'form' | 'code'>('form');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  async function sendCode() {
    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

    if (resetError) {
      setError(
        /rate limit/i.test(resetError.message)
          ? 'Too many emails have been sent recently. Please try again in an hour.'
          : resetError.message,
      );
      return false;
    }
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const ok = await sendCode();
    setBusy(false);
    if (!ok) return;

    setPhase('code');
    setResendIn(RESEND_COOLDOWN);
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (code.trim().length !== 6) {
      setError('Enter the 6 digit code from your email.');
      return;
    }

    setVerifying(true);
    const supabase = createSupabaseBrowserClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'recovery',
    });
    setVerifying(false);

    if (verifyError) {
      setError(
        /expired/i.test(verifyError.message)
          ? 'That code has expired. Send a new one below.'
          : 'That code is not right. Check your email and try again.',
      );
      return;
    }

    router.replace('/reset-password');
    router.refresh();
  }

  async function onResend() {
    if (resendIn > 0) return;
    setError('');
    const ok = await sendCode();
    if (ok) setResendIn(RESEND_COOLDOWN);
  }

  if (phase === 'code') {
    return (
      <form onSubmit={onVerify} className="flex flex-col gap-5">
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-4">
          <p className="text-sm font-semibold text-emerald-800">Check your email</p>
          <p className="mt-1 text-sm leading-6 text-emerald-900/75">
            We sent a 6 digit code to <span className="font-medium">{email}</span>. Enter it
            below to choose a new password.
          </p>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <Field label="6 digit code" required>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={6}
            className="text-center text-2xl font-semibold tracking-[0.4em]"
            autoFocus
            required
          />
        </Field>

        <Button type="submit" disabled={verifying}>
          {verifying ? 'Checking' : 'Verify and continue'}
        </Button>

        <p className="text-center text-sm text-coal/55">
          Didn&apos;t get a code?{' '}
          {resendIn > 0 ? (
            <span>Send a new one in {resendIn}s</span>
          ) : (
            <button
              type="button"
              onClick={onResend}
              className="font-semibold text-flame-deep hover:underline"
            >
              Send a new code
            </button>
          )}
        </p>
      </form>
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
        {busy ? 'Sending code' : 'Send code'}
      </Button>
    </form>
  );
}
