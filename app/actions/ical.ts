'use server'

import { revalidatePath } from 'next/cache'

import {
  fetchAllRawRanges,
  hasAnyIcalSource,
  mergeBlockedRanges,
  MOCK_BLOCKED_RANGES,
  setCachedBlockedDates,
} from '@/lib/ical'
import { syncBlockedDatesToDatabase } from '@/lib/ical/persist'

const CACHE_TTL_MS = 60 * 60 * 1000

export type IcalSyncResult =
  | {
      ok: true
      mode: 'live' | 'mock'
      mergedCount: number
      sources: { airbnb: number; vrbo: number; booking: number }
      persistence: {
        perSource: Record<
          'airbnb' | 'vrbo' | 'booking',
          { upserted: number; deleted: number; skippedNoUid: number }
        >
        durationMs: number
      } | null
      syncedAt: string
    }
  | { ok: false; error: string }

/**
 * Run the same pipeline the hourly Netlify Scheduled Function runs, but
 * called directly from the admin UI. Caller authentication is implicit:
 * server actions only run when invoked from an authenticated client of
 * the admin app (the admin middleware guards every admin page that can
 * import this action). No CRON_SECRET needed here.
 */
export async function triggerIcalSync(): Promise<IcalSyncResult> {
  try {
    if (!hasAnyIcalSource()) {
      setCachedBlockedDates(MOCK_BLOCKED_RANGES, CACHE_TTL_MS)
      return {
        ok: true,
        mode: 'mock',
        mergedCount: MOCK_BLOCKED_RANGES.length,
        sources: { airbnb: 0, vrbo: 0, booking: 0 },
        persistence: null,
        syncedAt: new Date().toISOString(),
      }
    }

    const raw = await fetchAllRawRanges()
    const persistence = await syncBlockedDatesToDatabase(raw)
    const merged = mergeBlockedRanges(raw.airbnb, raw.vrbo, raw.booking)
    setCachedBlockedDates(merged, CACHE_TTL_MS)

    revalidatePath('/admin/calendar')
    revalidatePath('/admin/settings/integrations')

    return {
      ok: true,
      mode: 'live',
      mergedCount: merged.length,
      sources: {
        airbnb: raw.airbnb.length,
        vrbo: raw.vrbo.length,
        booking: raw.booking.length,
      },
      persistence,
      syncedAt: new Date().toISOString(),
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[actions/ical] triggerIcalSync failed:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
