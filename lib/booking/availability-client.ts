/**
 * Booking availability — CLIENT-SAFE bits.
 *
 * Split out from `./availability` so that client components (the
 * BookingProvider, the date picker) can import the pure overlap helper
 * + the public range type WITHOUT pulling in the Supabase admin client
 * (which requires a server-only env var and throws on the client).
 *
 * Server code should import from `./availability` instead.
 */

export interface PublicBlockedRange {
  start: string
  end: string
  source: string
}

/**
 * Sources of "guest stay" blocks that get an automatic cleaning/turnover
 * day after their last night. Owner and maintenance blocks don't trigger
 * a turnover — they're already maintenance-style blocks themselves.
 */
export const GUEST_STAY_SOURCES = new Set([
  'airbnb',
  'booking',
  'vrbo',
  'direct_booking',
])

/** Synthetic source tag for the day right after a guest stay. */
export const TURNOVER_SOURCE = 'turnover'

/**
 * Add an ISO day. `iso` must be `YYYY-MM-DD`. Returns the same format.
 */
export function nextIsoDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y || 1970, (m || 1) - 1, d || 1))
  date.setUTCDate(date.getUTCDate() + 1)
  const yy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

/**
 * For every guest-stay block in `ranges`, inject a synthetic 1-day
 * "turnover" range right after it (for cleaning / maintenance). The
 * turnover day is skipped when another block already covers it
 * (back-to-back stays — the next stay's first day shadows the turnover).
 *
 * Source of truth stays in `blocked_dates`; turnovers are computed at
 * read time so we don't need a migration or new column.
 */
export function applyTurnoverDays(
  ranges: ReadonlyArray<PublicBlockedRange>,
): PublicBlockedRange[] {
  const result = [...ranges]
  for (const block of ranges) {
    if (!GUEST_STAY_SOURCES.has(block.source)) continue
    const turnoverDay = nextIsoDay(block.end)

    // Skip when another block already covers the turnover day
    // (e.g. back-to-back stays). The picker will show that day in the
    // other block's colour, which is what we want.
    const shadowed = ranges.some(
      (other) =>
        other !== block &&
        other.start <= turnoverDay &&
        other.end >= turnoverDay,
    )
    if (shadowed) continue

    result.push({
      start: turnoverDay,
      end: turnoverDay,
      source: TURNOVER_SOURCE,
    })
  }
  return result
}

/**
 * Pure helper for the CLIENT side: does the picked `[checkIn, checkOut)`
 * range overlap any of the provided blocked ranges?
 *
 * Same semantics as the server check: `end` is inclusive (matches the
 * `blocked_dates` table convention), `checkOut` is exclusive (guest
 * leaves the morning of). Used by the BookingProvider after each date
 * change to surface inline feedback without hitting the network.
 */
export function rangeOverlapsAny(
  checkIn: string,
  checkOut: string,
  ranges: ReadonlyArray<{ start: string; end: string }>,
): { conflict: { start: string; end: string } | null } {
  if (!checkIn || !checkOut || checkIn >= checkOut) {
    return { conflict: null }
  }
  for (const r of ranges) {
    if (r.start < checkOut && r.end >= checkIn) {
      return { conflict: r }
    }
  }
  return { conflict: null }
}
