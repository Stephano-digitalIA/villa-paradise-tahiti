import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Admin client using the service_role key.
 *
 * - Bypasses Row Level Security (RLS).
 * - ONLY use in server-side code: Route Handlers, Server Actions, webhooks.
 * - NEVER import this module in "use client" components or expose it to the browser.
 */
export const adminClient = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

/**
 * Same client, with the Next.js Data Cache disabled.
 *
 * supabase-js issues its queries through the global `fetch`, which the
 * App Router instruments and caches by default. `dynamic = 'force-dynamic'`
 * on a route only makes the *render* dynamic — it does not opt the
 * underlying fetches out of the Data Cache, so a route can go on serving
 * a snapshot of the table taken at the first request after a deploy.
 *
 * That is tolerable for marketing copy, which is why `adminClient` keeps
 * the cache. It is not tolerable for availability: a stale read shows a
 * booked week as free, and lets two guests reach checkout for the same
 * dates. Anything that gates a booking must read through this client.
 */
export const liveAdminClient = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  },
)
