'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { adminClient, PUBLIC_CONTENT_TAG } from '@/lib/supabase/admin'
import type { Settings } from '@/lib/supabase/types'

export async function saveSettings(
  data: Partial<Settings>,
): Promise<{ error?: string }> {
  // Upsert — settings table should have exactly one row
  const { error } = await adminClient
    .from('settings')
    .upsert({ ...data }, { onConflict: 'id' })

  if (error) return { error: error.message }

  // Admin + every public surface. Pricing AND the currency rate are shown
  // site-wide (the rate feeds the header currency switcher on every page), so
  // revalidate the whole app rather than a handful of routes.
  // Drop the cached public read first. Revalidating a path only re-renders
// it, and the re-render would be served the same cached Supabase response.
  revalidateTag(PUBLIC_CONTENT_TAG)
  revalidatePath('/admin/settings')
  // Drop the cached public read first. Revalidating a path only re-renders
// it, and the re-render would be served the same cached Supabase response.
  revalidateTag(PUBLIC_CONTENT_TAG)
  revalidatePath('/', 'layout')
  return {}
}
