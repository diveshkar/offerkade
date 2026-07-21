'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Field, Input } from '@/app/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function LoginForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(
        /confirm/i.test(signInError.message)
          ? 'Confirm your email first. Open the link we sent you.'
          : 'That email and password combination is not right.',
      );
      setBusy(false);
      return;
    }

    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {notice && <Alert tone="error">{notice}</Alert>}
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

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-coal-deep">
            Password<span className="ml-0.5 text-ember">*</span>
          </span>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-flame-deep hover:underline"
          >
            Forgot password
          </Link>
        </div>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="Your password"
          required
        />
      </div>

      <Button type="submit" disabled={busy}>
        {busy ? 'Signing in' : 'Sign in'}
      </Button>
    </form>
  );
}
