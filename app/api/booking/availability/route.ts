/**
 * GET /api/booking/availability — public read of blocked dates.
 *
 * Source of truth: the Supabase `blocked_dates` table, which receives
 * every block from every channel:
 *   - hourly iCal sync writes `airbnb`, `vrbo`, `booking`
 *   - admin manual form writes `owner`, `maintenance`
 *   - payment webhooks write `direct_booking`
 *
 * Plus pending reservations (rows in `reservations` with
 * `payment_status='pending'`) — these aren't in `blocked_dates` yet
 * because the webhook hasn't fired, but they DO hold the dates as
 * tentatively booked.
 *
 * Caching:
 *   - `s-maxage=60`             — CDN caches identical responses 60s.
 *   - `stale-while-revalidate=300` — serves stale during background
 *      refresh, never blocks the page on DB latency.
 */

import { NextResponse } from 'next/server'

import { getPublicBlockedRanges } from '@/lib/booking/availability'
import { runIcalSync } from '@/lib/ical/sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// On-demand iCal freshness window: the date picker triggers this read on the
// "book now" page, so we refresh the channels first — but at most once per
// window per instance, so concurrent visitors share a single refresh.
const ON_DEMAND_SYNC_WINDOW_MS = 90 * 1000

export async function GET() {
  try {
    // Pull the latest external bookings BEFORE returning availability, so the
    // guest never picks a date that was just taken on Airbnb/Booking/VRBO.
    // Never throws; on failure we fall through to the last persisted data.
    await runIcalSync({ minIntervalMs: ON_DEMAND_SYNC_WINDOW_MS })

    const ranges = await getPublicBlockedRanges()

    return NextResponse.json(
      {
        blockedRanges: ranges,
        count: ranges.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[api/booking/availability] failed:', error)
    return NextResponse.json(
      {
        blockedRanges: [],
        count: 0,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
