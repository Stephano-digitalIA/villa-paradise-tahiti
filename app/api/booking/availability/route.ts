/**
 * GET /api/booking/availability — public read of blocked dates (Phase E1).
 *
 * Returns the merged Airbnb + VRBO blocked ranges in the normalised
 * `{ start, end, source, summary? }` shape so a future date-picker can
 * render unavailability without hitting Airbnb directly.
 *
 * Caching strategy:
 *   - `s-maxage=60`           — CDN serves the same payload for 60 s
 *     between origin hits, capping our cost during traffic spikes.
 *   - `stale-while-revalidate=300` — even stale entries are served while
 *     the CDN refreshes in the background, so we never block a page
 *     render on iCal latency.
 *   - The hourly Vercel cron at `/api/ical/sync` forces an upstream
 *     refresh; this endpoint stays read-only.
 */

import { NextResponse } from 'next/server'

import { getBlockedDates, hasAnyIcalSource } from '@/lib/ical'

export const runtime = 'nodejs'
// Force dynamic so each request consults the live in-memory cache
// (refreshed hourly by `/api/ical/sync`) rather than serving a snapshot
// frozen at build time. Edge caching for the response itself is handled
// by the `Cache-Control` header below.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const ranges = await getBlockedDates()

    return NextResponse.json(
      {
        blockedRanges: ranges,
        mode: hasAnyIcalSource() ? 'live' : 'mock',
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
        mode: 'error',
        count: 0,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
