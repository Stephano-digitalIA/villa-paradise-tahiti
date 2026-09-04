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

/**
 * Cache tag shared by every public read of operator-managed content.
 * Any admin save revalidates it, which costs one extra refetch on the other
 * tables and removes a whole class of "I saved it and nothing changed".
 */
export const PUBLIC_CONTENT_TAG = 'public-content'

/**
 * Client for reading operator-managed content on public pages.
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
      fetch: (input, init) => {
        // Built through the Headers API, never by spreading `init.headers`:
        // supabase-js may hand over a Headers instance, and spreading one
        // yields an empty object, dropping the apikey and Authorization
        // headers. Every read then fails with "No API key found in request".
        const headers = new Headers(init?.headers)
        // Next derives the Data Cache key from the request, headers included,
        // and not from the options below. Entries written before this client
        // existed carry no tag, never expire, and cannot be revalidated: a FAQ
        // corrected weeks ago was still being served with its old text.
        // Bumping this constant changes the key and abandons them. Raise it
        // again only if the cache is ever poisoned the same way.
        headers.set('x-content-cache', '2')
        return fetch(input, {
          ...init,
          headers,
          next: { revalidate: 60, tags: [PUBLIC_CONTENT_TAG] },
        })
      },
    },
  },
)
