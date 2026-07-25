import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/server';
import { landingPathForCurrentUser } from '@/lib/auth-routing';

// Neutral landing after login. Reads the session server-side and routes
// admins to /admin and shops to /dashboard.
export const dynamic = 'force-dynamic';

export default async function ContinuePage() {
  if (!(await getSessionUser())) redirect('/login');
  redirect(await landingPathForCurrentUser());
}
