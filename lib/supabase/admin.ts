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
 * It is not tolerable for availability: a stale read shows a booked week as
 * free, and lets two guests reach checkout for the same dates. Anything that
 * gates a booking must read through this client. The admin content editors
 * read through it too: an operator has to be shown the row as it is, not a
 * snapshot of it.
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

/** Cache tag for the editable-copy table. Revalidated when the admin saves. */
export const SITE_CONTENT_TAG = 'site-content'

/**
 * Client for reading the public copy in `site_content`.
 *
 * `adminClient` cached this read forever, and Netlify restores `.next/cache`
 * between builds, so the snapshot outlived every deploy: copy saved in the
 * admin never reached the site. Overrides written before that snapshot were
 * live, later ones silently were not, which is a hard failure to spot.
 *
 * `liveAdminClient` would fix it by forcing every marketing page dynamic,
 * which is a heavy price for text that changes a few times a month. So this
 * client keeps the page static and bounds the staleness instead:
 *
 *  - `tags` lets the save action drop the entry immediately, so an edit is
 *    normally live as soon as the operator presses Enregistrer,
 *  - `revalidate` is the safety net for when on-demand revalidation does not
 *    reach us (another deploy, a cold cache), and caps the wait at a minute.
 */
export const contentClient = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          next: { revalidate: 60, tags: [SITE_CONTENT_TAG] },
        }),
    },
  },
)
