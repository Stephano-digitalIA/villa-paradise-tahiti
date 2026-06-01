'use server'

import { adminClient } from '@/lib/supabase/admin'

/**
 * Verify that a Supabase auth user is in the `admin_users` whitelist.
 *
 * Uses the service-role client to bypass RLS on `admin_users`. The same
 * pattern used in `/admin/auth/callback/route.ts` for Google OAuth — the
 * client-side `@supabase/ssr` session is not always primed for an
 * RLS-protected SELECT within the request that just established it.
 *
 * Returns `{ isAdmin: true, role }` if found, otherwise `{ isAdmin: false }`.
 * Never throws — every failure is reported via the `error` field.
 */
export async function verifyAdminMembership(
  userId: string,
): Promise<
  | { isAdmin: true; role: string }
  | { isAdmin: false; error?: string }
> {
  if (!userId) return { isAdmin: false, error: 'Missing user id' }

  const { data, error } = await adminClient
    .from('admin_users')
    .select('id, role')
    .eq('id', userId)
    .maybeSingle()

  if (error) return { isAdmin: false, error: error.message }
  if (!data) return { isAdmin: false }
  return { isAdmin: true, role: data.role }
}
