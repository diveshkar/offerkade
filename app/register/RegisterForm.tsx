'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Field, Input } from '@/app/components/ui';
import PasswordInput from '@/app/components/PasswordInput';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { authRedirect } from '@/lib/site-url';

// While waiting for confirmation, poll sign-in so this (the signup device)
// continues to onboarding the moment the email is confirmed on ANY device.
const POLL_MS = 5000;
const POLL_LIMIT = 48; // ~4 minutes

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phase, setPhase] = useState<'form' | 'waiting'>('form');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);

  // Background poll: signInWithPassword only succeeds once the email is
  // confirmed, so a success means "confirmed" and gives this device a session.
  useEffect(() => {
    if (phase !== 'waiting') return;
    const supabase = createSupabaseBrowserClient();
    let attempts = 0;
    let active = true;

    const id = setInterval(async () => {
      attempts += 1;
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (!active) return;
      if (!signInError) {
        clearInterval(id);
        router.replace('/onboarding');
        router.refresh();
      } else if (attempts >= POLL_LIMIT) {
        clearInterval(id);
      }
    }, POLL_MS);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [phase, email, password, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: authRedirect('/onboarding') },
    });
    setBusy(false);

    if (signUpError) {
      setError(
        /rate limit/i.test(signUpError.message)
          ? 'Too many attempts. Please wait a minute and try again.'
          : signUpError.message,
      );
      return;
    }

    // If email confirmation is off, signUp already returns a session.
    if (data.session) {
      router.replace('/onboarding');
      router.refresh();
      return;
    }

    setPhase('waiting');
  }

  async function onManualContinue() {
    setChecking(true);
    setError('');
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setChecking(false);
    if (!signInError) {
      router.replace('/onboarding');
      router.refresh();
    } else {
      setError('Not confirmed yet. Open the link in your email, then try again.');
    }
  }

  if (phase === 'waiting') {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-4">
          <p className="text-sm font-semibold text-emerald-800">Confirm your email</p>
          <p className="mt-1 text-sm leading-6 text-emerald-900/75">
            We sent a link to <span className="font-medium">{email}</span>. Open it on any device
            (your phone is fine). This page continues on its own the moment you confirm.
          </p>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="button" onClick={onManualContinue} disabled={checking}>
          {checking ? 'Checking' : 'I have confirmed, continue'}
        </Button>

        <p className="text-sm leading-6 text-coal/55">
          Keep this tab open so it can continue automatically. Nothing arrived? Check your spam
          folder, or wait a minute.
        </p>
      </div>
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
