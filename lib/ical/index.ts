/**
 * iCal barrel — Villa Paradise Tahiti (Phase E1).
 *
 * Public surface consumed by:
 *   - `app/api/ical/sync/route.ts`              (cron entrypoint)
 *   - `app/api/booking/availability/route.ts`   (public read)
 *   - any future date-picker hook in Phase F+
 *
 * Top-level helper:
 *   - `getBlockedDates(forceRefresh?)` — single source of truth for the
 *     merged blocked ranges. Hits the in-memory cache, falls back to a
 *     parallel fetch + merge, and degrades to mock data when no
 *     provider URLs are configured.
 */

import {
  fetchAirbnbCalendar,
  fetchVrboCalendar,
  hasAnyIcalSource,
} from './fetch'
import {
  getCachedBlockedDates,
  setCachedBlockedDates,
} from './cache'
import { MOCK_BLOCKED_RANGES } from './mock'
import { mergeBlockedRanges } from './merge'
import { parseICalEvents } from './parse'
import type { BlockedDateRange } from './types'

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour, matches the Vercel cron cadence.

/**
 * Tag every parsed range with a stable provider name so downstream
 * consumers can filter by source if needed.
 */
function tagSource(
  ranges: BlockedDateRange[],
  source: string,
): BlockedDateRange[] {
  return ranges.map((r) => ({ ...r, source }))
}

/**
 * Load and merge blocked date ranges from every configured provider.
 *
 *  - When the cache holds a fresh value and `forceRefresh` is false →
 *    returns it immediately (no network).
 *  - When no provider URL is configured → returns `MOCK_BLOCKED_RANGES`
 *    so the rest of the app behaves naturally in local dev.
 *  - Otherwise: fetches Airbnb + VRBO in parallel, parses each body,
 *    merges, caches, returns.
 *
 * This function never throws — provider failures are logged and the
 * remaining sources still contribute to the merged output.
 */
export async function getBlockedDates(
  forceRefresh = false,
): Promise<BlockedDateRange[]> {
  if (!forceRefresh) {
    const cached = getCachedBlockedDates()
    if (cached) return cached
  }

  // Mock fallback — nothing configured at all.
  if (!hasAnyIcalSource()) {
    // We still seed the cache so repeated reads don't re-evaluate the
    // env on every request.
    setCachedBlockedDates(MOCK_BLOCKED_RANGES, CACHE_TTL_MS)
    return MOCK_BLOCKED_RANGES
  }

  const [airbnbText, vrboText] = await Promise.all([
    fetchAirbnbCalendar(),
    fetchVrboCalendar(),
  ])

  const airbnbRanges = airbnbText
    ? tagSource(parseICalEvents(airbnbText), 'airbnb')
    : []
  const vrboRanges = vrboText
    ? tagSource(parseICalEvents(vrboText), 'vrbo')
    : []

  const merged = mergeBlockedRanges(airbnbRanges, vrboRanges)
  setCachedBlockedDates(merged, CACHE_TTL_MS)
  return merged
}

/* Re-exports for granular consumers / tests. */

export {
  fetchAirbnbCalendar,
  fetchVrboCalendar,
  hasAnyIcalSource,
} from './fetch'
export {
  clearCachedBlockedDates,
  getCachedBlockedDates,
  setCachedBlockedDates,
} from './cache'
export { isDateBlocked, mergeBlockedRanges } from './merge'
export { parseICalEvents } from './parse'
export { MOCK_BLOCKED_RANGES } from './mock'
export type { BlockedDateRange } from './types'
