'use server'

import { revalidatePath } from 'next/cache'

import { adminClient } from '@/lib/supabase/admin'
import { SITE_CONTENT_KEYS } from '@/lib/content/registry'

/**
 * Save site copy overrides. Non-empty values are upserted; cleared values are
 * deleted (so the key reverts to its in-code default). Only whitelisted keys
 * from the registry are written.
 */
export async function saveSiteContent(
  entries: Record<string, string>,
): Promise<{ error?: string }> {
  const now = new Date().toISOString()
  const upserts: { key: string; value: string; updated_at: string }[] = []
  const deletes: string[] = []

  for (const [key, raw] of Object.entries(entries)) {
    if (!SITE_CONTENT_KEYS.has(key)) continue
    const value = (raw ?? '').trim()
    if (value === '') deletes.push(key)
    else upserts.push({ key, value, updated_at: now })
  }

  if (upserts.length > 0) {
    const { error } = await adminClient
      .from('site_content')
      .upsert(upserts, { onConflict: 'key' })
    if (error) return { error: error.message }
  }
  if (deletes.length > 0) {
    const { error } = await adminClient.from('site_content').delete().in('key', deletes)
    if (error) return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/content/site')
  return {}
}
