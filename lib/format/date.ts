/**
 * Date and time formatting for the back-office.
 *
 * Two kinds of value live in this database, and confusing them is how you
 * end up showing the wrong day or the wrong hour.
 *
 * **Instants** (`timestamptz`: `created_at`, `deposit_paid_at`, `sent_at`,
 * `processed_at`) are a precise point in time, stored in UTC. They must be
 * rendered in the villa's own time zone: the operator reads "a booking came
 * in at 1pm" and means 1pm in Tahiti. Rendering them raw shows UTC, because
 * server-side rendering runs on a UTC host — a silent ten-hour shift that
 * looks plausible enough to go unnoticed.
 *
 * **Calendar dates** (`date`: `check_in`, `check_out`, `blocked_from`,
 * `blocked_to`) carry no time at all. `new Date('2027-01-13')` is parsed as
 * UTC midnight, so formatting it in a negative offset like Tahiti's would
 * roll it back to the 12th. These must stay in UTC — the correct fix for
 * the instants above is exactly the wrong one here.
 */

/** French Polynesia, UTC-10. No daylight saving. */
export const VILLA_TIME_ZONE = 'Pacific/Tahiti'

/**
 * A point in time, in the villa's local time zone.
 *
 * Use for anything the operator reads as "when did this happen".
 */
export function formatInstant(
  value: string | Date | null | undefined,
  locale = 'fr-FR',
): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: VILLA_TIME_ZONE,
  })
}

/** Same, day only: "when did this happen", without the hour. */
export function formatInstantDate(
  value: string | Date | null | undefined,
  locale = 'fr-FR',
): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: VILLA_TIME_ZONE,
  })
}

/**
 * A calendar date with no time of day: arrival, departure, blocked range.
 *
 * Pinned to UTC on purpose. See the note at the top of this file.
 */
export function formatStayDate(
  value: string | null | undefined,
  locale = 'fr-FR',
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale, { ...options, timeZone: 'UTC' })
}
