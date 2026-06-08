/**
 * Editable site copy — thin override layer over the hardcoded component text.
 *
 * Components keep their current English text as the *fallback* and wrap it:
 *   const t = await getSiteContent()
 *   <h1>{t('home.hero.title1', 'Your Private Paradise')}</h1>
 *
 * An operator can override any key from /admin/content/site (writes to the
 * Supabase `site_content` table). No override (or empty) → the fallback shows.
 *
 * Safe before migration 009: if the table doesn't exist yet the query fails
 * and every key resolves to its fallback.
 */
import { cache } from 'react'

import { adminClient } from '@/lib/supabase/admin'

export type ContentLookup = (key: string, fallback: string) => string

/** Cached per request — one DB hit no matter how many components call it. */
export const getSiteContent = cache(async (): Promise<ContentLookup> => {
  const map = new Map<string, string>()
  try {
    const { data } = await adminClient.from('site_content').select('key, value')
    if (data) for (const row of data) map.set(row.key, row.value as string)
  } catch {
    // Table absent (pre-migration) or transient error — fall back to defaults.
  }
  return (key, fallback) => {
    const v = map.get(key)
    return v != null && v.trim() !== '' ? v : fallback
  }
})

/** Raw override map — used by the admin editor to prefill current values. */
export async function getSiteContentMap(): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  try {
    const { data } = await adminClient.from('site_content').select('key, value')
    if (data) for (const row of data) out[row.key] = row.value as string
  } catch {
    /* table absent — empty map */
  }
  return out
}
