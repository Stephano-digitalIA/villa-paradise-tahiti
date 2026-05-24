/**
 * iCal mock data — Villa Paradise Tahiti (Phase E1).
 *
 * When neither `AIRBNB_ICAL_URL` nor `VRBO_ICAL_URL` is configured (the
 * default in `.env.example`), `getBlockedDates()` falls back to this
 * deterministic list. That keeps the date-picker and `/api/booking/
 * availability` endpoint working out-of-the-box for new contributors —
 * they can see realistic blocked windows without provisioning real
 * calendars first.
 *
 * Dates are intentionally tied to the next high-season window so that
 * a developer running the app in May 2026 (the current release window)
 * sees something visually meaningful.
 */

import type { BlockedDateRange } from './types'

export const MOCK_BLOCKED_RANGES: BlockedDateRange[] = [
  // A one-week Airbnb booking around mid-July high season.
  {
    start: '2026-07-13',
    end: '2026-07-19',
    source: 'mock',
    summary: 'Mock — Airbnb reservation',
  },
  // A long-weekend VRBO booking in August.
  {
    start: '2026-08-07',
    end: '2026-08-10',
    source: 'mock',
    summary: 'Mock — VRBO reservation',
  },
  // A two-week holiday block straddling Christmas / New Year (peak).
  {
    start: '2026-12-23',
    end: '2027-01-04',
    source: 'mock',
    summary: 'Mock — Holiday block',
  },
]
