/**
 * iCal sync orchestrator — Villa Paradise Tahiti.
 *
 * Single implementation of "refresh blocked dates from the channels", shared by:
 *   - the hourly cron route (`/api/ical/sync`) — runs unconditionally
 *   - the on-demand booking trigger (`/api/booking/availability`) — debounced,
 *     so the date picker always sees fresh external bookings without hammering
 *     Airbnb / Booking.com / VRBO on every page load.
 *
 * Never throws — provider/DB failures are caught and reported in the result so
 * the availability read can proceed with whatever is already in the DB.
 */

import {
  fetchAllRawRanges,
  hasAnyIcalSource,
  mergeBlockedRanges,
  MOCK_BLOCKED_RANGES,
  setCachedBlockedDates,
} from './index'
import { getLastSyncAt, markSyncedNow } from './cache'
import { syncBlockedDatesToDatabase } from './persist'
import type { SyncResult } from './persist'

const CACHE_TTL_MS = 60 * 60 * 1000

export interface IcalSyncResult {
  ok: boolean
  mode: 'live' | 'mock' | 'skipped'
  syncedAt: string
  mergedCount?: number
  persistence?: SyncResult
  error?: string
}

export interface RunIcalSyncOptions {
  /**
   * Skip the (expensive) external fetch if a sync ran less than this many ms
   * ago in this process. 0 = always run (cron). The on-demand booking path
   * passes a short window so concurrent visitors share one refresh.
   */
  minIntervalMs?: number
}

/**
 * Refresh `blocked_dates` from the iCal channels. Returns a structured result;
 * does not throw.
 */
export async function runIcalSync(
  options: RunIcalSyncOptions = {},
): Promise<IcalSyncResult> {
  const minInterval = options.minIntervalMs ?? 0

  // Debounce: within the freshness window, treat the data as fresh enough.
  if (minInterval > 0 && Date.now() - getLastSyncAt() < minInterval) {
    return {
      ok: true,
      mode: 'skipped',
      syncedAt: new Date(getLastSyncAt()).toISOString(),
    }
  }

  // Stamp immediately so concurrent requests (same instance) don't all fetch.
  markSyncedNow()

  try {
    if (!hasAnyIcalSource()) {
      // No channel configured (local dev) — seed mock cache, touch nothing.
      setCachedBlockedDates(MOCK_BLOCKED_RANGES, CACHE_TTL_MS)
      return { ok: true, mode: 'mock', syncedAt: new Date().toISOString() }
    }

    const raw = await fetchAllRawRanges()
    const persistence = await syncBlockedDatesToDatabase(raw)
    const merged = mergeBlockedRanges(raw.airbnb, raw.vrbo, raw.booking)
    setCachedBlockedDates(merged, CACHE_TTL_MS)

    return {
      ok: true,
      mode: 'live',
      mergedCount: merged.length,
      persistence,
      syncedAt: new Date().toISOString(),
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ical:sync] failed:', error)
    return {
      ok: false,
      mode: 'live',
      error: error instanceof Error ? error.message : String(error),
      syncedAt: new Date().toISOString(),
    }
  }
}
