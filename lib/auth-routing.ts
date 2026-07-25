// Decides where a signed-in user should land: admins go to the admin panel,
// everyone else to their shop dashboard. Used by the login flow so nobody
// has to type /admin by hand.
import 'server-only';
import { getCurrentAdmin } from '@/lib/queries/admin';

export async function landingPathForCurrentUser(): Promise<'/admin' | '/dashboard'> {
  const admin = await getCurrentAdmin();
  return admin ? '/admin' : '/dashboard';
}
