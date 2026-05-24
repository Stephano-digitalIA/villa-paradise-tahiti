/**
 * iCal merge helpers — Villa Paradise Tahiti (Phase E1).
 *
 * Pure functions to combine and query `BlockedDateRange[]` lists:
 *   - `mergeBlockedRanges(...sources)` collapses overlapping/adjacent
 *     ranges into the smallest equivalent set, preserving provenance via
 *     a comma-joined `source` (e.g. `"airbnb,vrbo"`) when two providers
 *     happen to block the same dates.
 *   - `isDateBlocked(date, ranges)` returns whether a single ISO date is
 *     covered by any range.
 *
 * Inputs/outputs are normalised to ISO `YYYY-MM-DD` strings so that the
 * routes don't have to ship `Date` objects across the wire. Two ranges
 * are considered "touching" when one ends the day before the next begins
 * — the goal is a clean visual calendar, not strict mathematical union.
 */

import type { BlockedDateRange } from './types'

/* ---------- internal date helpers ---------------------------------------- */

function toUtcDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y || 1970, (m || 1) - 1, d || 1))
}

function toIso(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(iso: string, delta: number): string {
  const date = toUtcDate(iso)
  date.setUTCDate(date.getUTCDate() + delta)
  return toIso(date)
}

function mergeSourceLabels(a: string, b: string): string {
  if (!a) return b
  if (!b) return a
  const parts = new Set([
    ...a.split(',').map((s) => s.trim()).filter(Boolean),
    ...b.split(',').map((s) => s.trim()).filter(Boolean),
  ])
  return Array.from(parts).sort().join(',')
}

/* ---------- public API --------------------------------------------------- */

/**
 * Combine multiple lists of blocked ranges. Overlapping or adjacent
 * ranges (end + 1 day === next start) are merged. Provenance is preserved
 * in `source` as a comma-joined sorted list.
 *
 * The result is sorted by `start` ascending and is safe to ship as-is
 * via JSON (all fields are strings).
 */
export function mergeBlockedRanges(
  ...sources: BlockedDateRange[][]
): BlockedDateRange[] {
  const flat = sources.flat().filter((r) => r.start && r.end && r.start <= r.end)
  if (flat.length === 0) return []

  // Sort by start asc, then end asc as a tiebreaker.
  flat.sort((a, b) => {
    if (a.start === b.start) return a.end < b.end ? -1 : 1
    return a.start < b.start ? -1 : 1
  })

  const merged: BlockedDateRange[] = []
  for (const current of flat) {
    const last = merged[merged.length - 1]
    // Two ranges merge when `current.start` is at most one day after
    // `last.end`. We compare via the day-after of `last.end`.
    if (last && current.start <= addDays(last.end, 1)) {
      // Extend the open range and merge the source labels.
      last.end = current.end > last.end ? current.end : last.end
      last.source = mergeSourceLabels(last.source, current.source)
      // Keep the first summary we saw; don't pile them up.
    } else {
      merged.push({ ...current })
    }
  }

  return merged
}

/**
 * `true` when the given `YYYY-MM-DD` date falls inside any of the
 * provided blocked ranges (inclusive on both ends).
 */
export function isDateBlocked(
  date: string,
  ranges: BlockedDateRange[],
): boolean {
  for (const range of ranges) {
    if (date >= range.start && date <= range.end) return true
  }
  return false
}
