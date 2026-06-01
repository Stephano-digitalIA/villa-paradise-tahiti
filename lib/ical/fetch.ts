/**
 * iCal fetch helpers — Villa Paradise Tahiti (Phase E1).
 *
 * Pure network layer: a single function per source returning the raw iCal
 * text body, with a 10s timeout and clean error handling. Parsing happens
 * downstream in `parse.ts`, so this module stays trivially testable with
 * `fetch` mocks.
 */

const TIMEOUT_MS = 10_000

/**
 * Read an environment variable, returning `undefined` for empty / missing.
 */
function readEnvUrl(name: string): string | undefined {
  const raw = process.env[name]?.trim()
  return raw && raw.length > 0 ? raw : undefined
}

/**
 * Fetch an iCal URL with timeout + status code guard.
 *
 * Returns `null` when the URL is not configured (mock mode), or on any
 * network / HTTP error. We never throw — the caller decides how to fall
 * back (typically to cached or mock data).
 */
async function fetchIcalText(
  url: string | undefined,
  sourceLabel: string,
): Promise<string | null> {
  if (!url) {
    // eslint-disable-next-line no-console
    console.info(`[ical:${sourceLabel}] no URL configured — skipping`)
    return null
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      // iCal hosts (Airbnb / VRBO) frown on default Node UAs.
      headers: { 'User-Agent': 'VillaParadiseTahiti-iCalSync/1.0' },
      // We always want fresh data here; the in-process cache layer
      // sits one level up.
      cache: 'no-store',
    })

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(
        `[ical:${sourceLabel}] HTTP ${response.status} ${response.statusText}`,
      )
      return null
    }

    const text = await response.text()
    if (!text || text.length < 20) {
      // eslint-disable-next-line no-console
      console.error(
        `[ical:${sourceLabel}] empty / suspicious response (${text.length} chars)`,
      )
      return null
    }

    return text
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[ical:${sourceLabel}] fetch failed:`, err)
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Fetch the Airbnb iCal export — returns `null` when `AIRBNB_ICAL_URL`
 * is missing or the request fails.
 */
export async function fetchAirbnbCalendar(): Promise<string | null> {
  return fetchIcalText(readEnvUrl('AIRBNB_ICAL_URL'), 'airbnb')
}

/**
 * Fetch the VRBO iCal export — returns `null` when `VRBO_ICAL_URL`
 * is missing or the request fails.
 */
export async function fetchVrboCalendar(): Promise<string | null> {
  return fetchIcalText(readEnvUrl('VRBO_ICAL_URL'), 'vrbo')
}

/**
 * Fetch the Booking.com iCal export — returns `null` when `BOOKING_ICAL_URL`
 * is missing or the request fails. Generated in the Booking.com Extranet
 * under Rates & Availability → Sync calendars → Export calendars.
 */
export async function fetchBookingCalendar(): Promise<string | null> {
  return fetchIcalText(readEnvUrl('BOOKING_ICAL_URL'), 'booking')
}

/**
 * Convenience: `true` when at least one iCal source URL is configured.
 * Used by the high-level `getBlockedDates` to decide whether to fall
 * back to mock data.
 */
export function hasAnyIcalSource(): boolean {
  return Boolean(
    readEnvUrl('AIRBNB_ICAL_URL') ||
      readEnvUrl('VRBO_ICAL_URL') ||
      readEnvUrl('BOOKING_ICAL_URL'),
  )
}
