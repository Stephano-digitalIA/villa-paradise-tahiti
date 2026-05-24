/**
 * iCal parse helpers — Villa Paradise Tahiti (Phase E1).
 *
 * Wraps `node-ical` to turn a raw iCal text body into the normalised
 * `BlockedDateRange[]` shape the rest of the app consumes. Handles two
 * provider quirks:
 *
 *  1. Airbnb periodically emits VEVENTs whose SUMMARY is "Available" /
 *     "Reserved" / "Airbnb (Not available)". We treat the literal
 *     "Available" lines as no-ops (they happen when the host explicitly
 *     marks a date free) and everything else as blocked.
 *
 *  2. iCal `DTEND` is *exclusive* — a one-day event runs `DTSTART:20260710`
 *     to `DTEND:20260711`. The downstream API contract is **inclusive** on
 *     both ends so that date-picker code can write `start <= d <= end`.
 *     We normalise that here by subtracting one day from the end.
 *
 * No network, no fs — pure transform, easy to unit test.
 */

import nodeIcal from 'node-ical'

import type { BlockedDateRange } from './types'

/**
 * Format a `Date` as `YYYY-MM-DD` in UTC, regardless of the host timezone.
 */
function toIsoDate(value: Date): string {
  const y = value.getUTCFullYear()
  const m = String(value.getUTCMonth() + 1).padStart(2, '0')
  const d = String(value.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Subtract one UTC day from a `YYYY-MM-DD` string. Used to convert iCal's
 * exclusive DTEND into an inclusive end-of-range date.
 */
function previousDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() - 1)
  return toIsoDate(date)
}

/**
 * Soft-detect "free" markers that Airbnb sometimes emits. We exclude those
 * so the merged calendar doesn't artificially block dates the host has
 * explicitly opened.
 */
function isAvailableMarker(summary: string | undefined | null): boolean {
  if (!summary) return false
  const lower = summary.toLowerCase()
  return (
    lower === 'available' ||
    lower.includes('not blocked') ||
    lower.startsWith('available ')
  )
}

/**
 * Parse a raw iCal text body and return a normalised list of blocked
 * date ranges. Returns an empty array when the text is empty or no
 * VEVENT components are found.
 *
 * @param icalText  Raw `.ics` body, typically from `fetchAirbnbCalendar` etc.
 */
export function parseICalEvents(icalText: string): BlockedDateRange[] {
  if (!icalText || icalText.length < 20) return []

  let calendar: Record<string, unknown>
  try {
    calendar = nodeIcal.parseICS(icalText) as Record<string, unknown>
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[ical:parse] failed to parse iCal body:', err)
    return []
  }

  const ranges: BlockedDateRange[] = []

  for (const key of Object.keys(calendar)) {
    const component = calendar[key] as
      | {
          type?: string
          start?: Date | string
          end?: Date | string
          summary?: string
          status?: string
        }
      | undefined

    if (!component || component.type !== 'VEVENT') continue
    if (component.status === 'CANCELLED') continue
    if (isAvailableMarker(component.summary)) continue

    if (!component.start || !component.end) continue

    const startDate =
      component.start instanceof Date
        ? component.start
        : new Date(component.start)
    const endDate =
      component.end instanceof Date ? component.end : new Date(component.end)

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      continue
    }

    const startIso = toIsoDate(startDate)
    // DTEND is exclusive in the iCal spec — make it inclusive for our
    // downstream "date is blocked" predicate.
    const endIsoExclusive = toIsoDate(endDate)
    const endIso = endIsoExclusive > startIso ? previousDay(endIsoExclusive) : startIso

    ranges.push({
      start: startIso,
      end: endIso,
      source: 'unknown',
      summary:
        typeof component.summary === 'string' ? component.summary : undefined,
    })
  }

  return ranges
}
