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

/** Synthetic source tag for the days right after a guest stay. */
export const TURNOVER_SOURCE = 'turnover'

/**
 * Days kept free after a guest's last night, for cleaning and turnaround.
 *
 * Two, by the owner's decision: a stay ending the morning of the 22nd
 * frees the 22nd and the 23rd, so the next arrival is the 24th. Applies
 * to every guest-stay source, so a direct booking and an Airbnb stay
 * leave the same gap.
 *
 * Set to 1 to go back to a single cleaning day.
 */
export const TURNOVER_DAYS = 2

/**
 * Shift an ISO `YYYY-MM-DD` date by `days` (negative shifts backwards).
 * Returns the same format.
 */
export function shiftIsoDay(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y || 1970, (m || 1) - 1, d || 1))
  date.setUTCDate(date.getUTCDate() + days)
  const yy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

/** Add one ISO day. */
export function nextIsoDay(iso: string): string {
  return shiftIsoDay(iso, 1)
}

/**
 * Subtract one ISO day.
 *
 * Mostly used to turn an exclusive `check_out` into the inclusive
 * `blocked_to` that `blocked_dates` stores: a guest leaving the morning
 * of the 22nd occupied their last night on the 21st.
 */
export function previousIsoDay(iso: string): string {
  return shiftIsoDay(iso, -1)
}

/**
 * For every guest-stay block in `ranges`, inject `TURNOVER_DAYS` synthetic
 * one-day "turnover" ranges right after it (cleaning / turnaround). A
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

    for (let offset = 1; offset <= TURNOVER_DAYS; offset += 1) {
      const turnoverDay = shiftIsoDay(block.end, offset)

      // Skip when another block already covers this day (e.g. back-to-back
      // stays). The picker will show it in the other block's colour, which
      // is what we want.
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
