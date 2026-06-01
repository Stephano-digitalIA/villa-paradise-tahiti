/**
 * iCal domain types — Villa Paradise Tahiti (Phase E1).
 *
 * Shared shapes for the iCal sync pipeline (fetch → parse → merge → cache).
 * Kept in their own file so consumers (API routes, future date picker
 * widgets) can import just the type without dragging Node-only deps.
 */

/**
 * A single blocked date range, normalised across providers.
 *
 *  - `start` / `end`  : ISO `YYYY-MM-DD` strings, in UTC.
 *  - `end` is **inclusive** here — many iCal sources use exclusive end
 *    dates (DTEND), the parser normalises that for the consumer side so
 *    a one-night booking becomes `{ start: '2026-07-10', end: '2026-07-10' }`
 *    and a date-picker can simply do `start <= d <= end`.
 *  - `source` is a stable string we control ('airbnb', 'vrbo', 'mock', …).
 *  - `summary` is the raw iCal SUMMARY field (Airbnb sets things like
 *    "Reserved", "Airbnb (Not available)" — kept for debugging).
 */
export interface BlockedDateRange {
  start: string
  end: string
  source: string
  summary?: string
  /**
   * iCal `UID` of the originating VEVENT. Stable across syncs as long as the
   * provider keeps the reservation identifier — used by the DB persistence
   * layer to upsert/delete by `(source, source_ref)` rather than diffing
   * ranges naively. May be undefined for mock data.
   */
  uid?: string
}
