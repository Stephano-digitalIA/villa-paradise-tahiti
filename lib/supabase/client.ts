import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Browser client — safe to use in "use client" components.
 * No server-only imports in this file.
 */
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}

/**
 * Browser client using the OAuth *implicit* flow — used ONLY by the admin
 * Google sign-in. The default PKCE flow depends on a code-verifier cookie
 * surviving the round-trip to Google; in production that cookie repeatedly
 * failed to be found ("PKCE code verifier not found in storage"), killing the
 * login. Implicit flow returns the tokens in the URL fragment directly, needs
 * no verifier at all, and stores the session through the same cookie adapter
 * (same storage key), so the SSR middleware & server components see the
 * session exactly as before.
 */
export function createImplicitClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { flowType: 'implicit' },
  })
}
