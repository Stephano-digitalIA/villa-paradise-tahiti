/**
 * POST /api/booking/sync — on-demand iCal refresh for the booking date picker.
 *
 * The "book now" page renders availability instantly from the last persisted
 * data, then calls this in the background. It pulls the latest Airbnb / Booking /
 * VRBO bookings into `blocked_dates`; the client re-reads
 * `/api/booking/availability` once this resolves.
 *
 * Debounced per instance so a burst of visitors shares a single refresh, and
 * `runIcalSync` never throws — a slow/failed channel just leaves the last data
 * in place. No secret required: it only triggers an idempotent refresh of our
 * own availability (the privileged cron entrypoint stays at /api/ical/sync).
 */

import { NextResponse } from 'next/server'

import { runIcalSync } from '@/lib/ical/sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Share one refresh across visitors arriving within this window (per instance).
const ON_DEMAND_SYNC_WINDOW_MS = 90 * 1000

export async function POST() {
  // Always 200 — this is a best-effort background refresh; the client ignores
  // failures and keeps the already-displayed availability.
  const result = await runIcalSync({ minIntervalMs: ON_DEMAND_SYNC_WINDOW_MS })
  return NextResponse.json(result)
}
