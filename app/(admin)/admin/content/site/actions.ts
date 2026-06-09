'use server'

import { revalidatePath } from 'next/cache'

import { adminClient } from '@/lib/supabase/admin'
import { SITE_CONTENT_KEYS } from '@/lib/content/registry'

export interface SiteContentInput {
  value: string
  value_fr: string
}

/**
 * Save site copy overrides. `value` is the published English text (read by the
 * public site); `value_fr` is the operator's French source, kept for re-edits.
 * A row is deleted only when BOTH are empty (so the key reverts to its in-code
 * default). Only whitelisted keys from the registry are written.
 */
export async function saveSiteContent(
  entries: Record<string, SiteContentInput>,
): Promise<{ error?: string }> {
  const now = new Date().toISOString()
  const upserts: { key: string; value: string; value_fr: string; updated_at: string }[] = []
  const deletes: string[] = []

  for (const [key, raw] of Object.entries(entries)) {
    if (!SITE_CONTENT_KEYS.has(key)) continue
    const value = (raw?.value ?? '').trim()
    const valueFr = (raw?.value_fr ?? '').trim()
    if (value === '' && valueFr === '') deletes.push(key)
    else upserts.push({ key, value, value_fr: valueFr, updated_at: now })
  }

  if (upserts.length > 0) {
    const { error } = await adminClient
      .from('site_content')
      .upsert(upserts, { onConflict: 'key' })
    if (error) {
      // Before migration 010 the `value_fr` column doesn't exist yet — retry
      // English-only so the live admin keeps working until the SQL is applied.
      const isMissingFr = /value_fr/.test(error.message)
      if (!isMissingFr) return { error: error.message }
      const enOnly = upserts.map(({ key, value, updated_at }) => ({ key, value, updated_at }))
      const { error: retryError } = await adminClient
        .from('site_content')
        .upsert(enOnly, { onConflict: 'key' })
      if (retryError) return { error: retryError.message }
    }
  }
  if (deletes.length > 0) {
    const { error } = await adminClient.from('site_content').delete().in('key', deletes)
    if (error) return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/legal/terms')
  revalidatePath('/legal/cancellation')
  revalidatePath('/legal/privacy-policy')
  revalidatePath('/admin/content/site')
  return {}
}
