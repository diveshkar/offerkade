'use client';

import { useActionState } from 'react';
import { Alert, Button, Field, Input } from '@/app/components/ui';
import { registerShop, type RegisterState } from '@/app/register/actions';

export default function RegisterForm() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(registerShop, {});

  if (state.sent) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-4">
          <p className="text-sm font-semibold text-emerald-800">Confirm your email</p>
          <p className="mt-1 text-sm leading-6 text-emerald-900/75">
            We sent a link to <span className="font-medium">{state.sent}</span>. Open it to activate
            your account, then finish setting up your shop.
          </p>
        </div>
        <p className="text-sm leading-6 text-coal/55">
          Nothing arrived? Check your spam folder, or wait a minute and try again.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <Field label="Email" required>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@yourshop.lk"
          required
        />
      </Field>

      <Field label="Password" hint="At least 8 characters" required>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="Create a password"
          required
        />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? 'Creating account' : 'Create account'}
      </Button>

      <p className="text-xs leading-5 text-coal/50">
        You will add your shop details next. We review every shop before its offers go live.
      </p>
    </form>
  );
}
