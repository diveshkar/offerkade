'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Field, Input } from '@/app/components/ui';
import PasswordInput from '@/app/components/PasswordInput';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const RESEND_COOLDOWN = 30; // seconds

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    setBusy(false);

    if (signUpError) {
      setError(
        /rate limit/i.test(signUpError.message)
          ? 'Too many attempts. Please wait a minute and try again.'
          : signUpError.message,
      );
      return;
    }

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
      type: 'signup',
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

    router.replace('/onboarding');
    router.refresh();
  }

  async function onResend() {
    if (resendIn > 0) return;
    setError('');
    const supabase = createSupabaseBrowserClient();
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
    if (resendError) {
      setError('Could not send a new code. Please wait a moment and try again.');
      return;
    }
    setResendIn(RESEND_COOLDOWN);
  }

  if (phase === 'code') {
    return (
      <form onSubmit={onVerify} className="flex flex-col gap-5">
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-4">
          <p className="text-sm font-semibold text-emerald-800">Check your email</p>
          <p className="mt-1 text-sm leading-6 text-emerald-900/75">
            We sent a 6 digit code to <span className="font-medium">{email}</span>. Enter it
            below to finish creating your account.
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
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@yourshop.lk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>

      <Field label="Password" hint="At least 8 characters" required>
        <PasswordInput
          name="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Field>

      <Button type="submit" disabled={busy}>
        {busy ? 'Creating account' : 'Create account'}
      </Button>

      <p className="text-xs leading-5 text-coal/50">
        You will add your shop details next. We review every shop before its offers go live.
      </p>
    </form>
  );
}
