'use server';

import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { authRedirect } from '@/lib/site-url';

export interface RegisterState {
  error?: string;
  sent?: string;
}

export async function registerShop(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'Enter your email and a password.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

  const origin = (await headers()).get('origin');
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: authRedirect('/onboarding', origin) },
  });

  if (error) {
    if (error.status === 429 || /rate limit/i.test(error.message)) {
      return {
        error:
          'Too many confirmation emails have been sent from this project in the last hour. Wait an hour or connect an SMTP provider in Supabase.',
      };
    }
    return { error: error.message };
  }

  return { sent: email };
}
