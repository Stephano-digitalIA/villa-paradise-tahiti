/**
 * iCal in-process cache — Villa Paradise Tahiti (Phase E1).
 *
 * Minimum-viable cache for blocked date ranges. We stash the merged
 * result on `globalThis` so it survives Hot Module Reload during dev,
 * and TTL-evict on read. This keeps Airbnb / VRBO under their rate
 * limits without bringing in Redis just yet.
 *
 * Trade-offs:
 *  - Single-process only. On Vercel each lambda instance has its own
 *    cache; this is fine because the data is read-heavy and the
 *    `/api/ical/sync` cron forces a refresh hourly.
 *  - Phase F+ may replace this with Edge KV / Upstash for cross-instance
 *    consistency. The interface here is small on purpose to make that
 *    swap mechanical.
 */

import type { BlockedDateRange } from './types'

interface CacheEntry {
  expiresAt: number
  ranges: BlockedDateRange[]
}

const GLOBAL_KEY = '__vpt_ical_cache' as const

interface GlobalWithCache {
  [GLOBAL_KEY]?: CacheEntry | undefined
}

function getStore(): GlobalWithCache {
  return globalThis as unknown as GlobalWithCache
}

/**
 * Read the cached ranges, or `null` when the cache is empty / expired.
 * Does not mutate the cache (expired entries are cleared on the next
 * `setCachedBlockedDates` call to keep this function side-effect-free).
 */
export function getCachedBlockedDates(): BlockedDateRange[] | null {
  const entry = getStore()[GLOBAL_KEY]
  if (!entry) return null
  if (entry.expiresAt <= Date.now()) return null
  return entry.ranges
}

/**
 * Write a fresh batch of merged ranges to the cache. `ttlMs` defaults to
 * one hour to match the Vercel cron schedule.
 */
export function setCachedBlockedDates(
  ranges: BlockedDateRange[],
  ttlMs = 60 * 60 * 1000,
): void {
  getStore()[GLOBAL_KEY] = {
    expiresAt: Date.now() + ttlMs,
    ranges,
  }
}

/**
 * Drop the cache entry. Mainly useful in tests; the regular path is to
 * let it expire on its own.
 */
export function clearCachedBlockedDates(): void {
  getStore()[GLOBAL_KEY] = undefined
}

// ─────────────────────────────────────────────────────────────────────────────
// Last-sync timestamp — drives the on-demand debounce (per process instance).
// Separate from the range cache TTL so an on-demand booking sync can use a much
// shorter freshness window than the hourly cron cache.
// ─────────────────────────────────────────────────────────────────────────────

const SYNC_AT_KEY = '__vpt_ical_last_sync_at' as const

interface GlobalWithSyncAt {
  [SYNC_AT_KEY]?: number | undefined
}

function getSyncStore(): GlobalWithSyncAt {
  return globalThis as unknown as GlobalWithSyncAt
}

/** Epoch ms of the last sync attempt in this process, or 0 if never. */
export function getLastSyncAt(): number {
  return getSyncStore()[SYNC_AT_KEY] ?? 0
}

/** Record that a sync just ran (used to debounce on-demand triggers). */
export function markSyncedNow(): void {
  getSyncStore()[SYNC_AT_KEY] = Date.now()
}
