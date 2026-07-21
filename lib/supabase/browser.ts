'use client';

import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side session holder. Writes the auth cookies the server reads.
export function createSupabaseBrowserClient() {
  return createBrowserClient(url, anonKey);
}
