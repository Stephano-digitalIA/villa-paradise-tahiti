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
