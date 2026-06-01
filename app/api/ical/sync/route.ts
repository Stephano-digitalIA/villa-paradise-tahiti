/**
 * GET /api/ical/sync — protected cron entrypoint (Phase E1).
 *
 * Triggers a forced refresh of the in-process iCal cache. Designed to
 * be called every hour by Vercel Cron (see `vercel.json`). Vercel
 * automatically attaches an `Authorization: Bearer ${CRON_SECRET}`
 * header to cron requests when `CRON_SECRET` is set in the project's
 * environment variables — outside Vercel, schedule this URL from
 * GitHub Actions / Upstash QStash and inject the same header manually.
 *
 * Security: We refuse every request whose Authorization header does not
 * match `Bearer <CRON_SECRET>`. When `CRON_SECRET` itself is missing
 * from the env, we refuse all requests (fail-closed) to avoid an
 * unauthenticated endpoint shipping by accident.
 */

import { NextResponse } from 'next/server'

import {
  fetchAllRawRanges,
  hasAnyIcalSource,
  mergeBlockedRanges,
  MOCK_BLOCKED_RANGES,
  setCachedBlockedDates,
} from '@/lib/ical'
import { syncBlockedDatesToDatabase } from '@/lib/ical/persist'

const CACHE_TTL_MS = 60 * 60 * 1000

export const runtime = 'nodejs'
// We deliberately want this route to behave dynamically — Vercel Cron
// will call it hourly and expects fresh work each time, not a cached
// response.
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: 'CRON_SECRET not configured on the server.' },
      { status: 500 },
    )
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 },
    )
  }

  try {
    if (!hasAnyIcalSource()) {
      // No URL configured anywhere — keep mock behaviour for local dev,
      // don't touch the database.
      setCachedBlockedDates(MOCK_BLOCKED_RANGES, CACHE_TTL_MS)
      return NextResponse.json({
        ok: true,
        mode: 'mock',
        count: MOCK_BLOCKED_RANGES.length,
        syncedAt: new Date().toISOString(),
      })
    }

    // 1. Fetch + parse every source in parallel (raw, not merged).
    const raw = await fetchAllRawRanges()

    // 2. Persist to Supabase `blocked_dates` (idempotent upsert + cancel
    //    cleanup). This is what makes the admin calendar and the CRM
    //    link panel see external reservations.
    const persistence = await syncBlockedDatesToDatabase(raw)

    // 3. Refresh the in-memory merged cache so the public availability
    //    API returns the same data without an extra fetch round-trip.
    const merged = mergeBlockedRanges(raw.airbnb, raw.vrbo, raw.booking)
    setCachedBlockedDates(merged, CACHE_TTL_MS)

    return NextResponse.json({
      ok: true,
      mode: 'live',
      mergedCount: merged.length,
      sources: {
        airbnb: raw.airbnb.length,
        vrbo: raw.vrbo.length,
        booking: raw.booking.length,
      },
      persistence,
      syncedAt: new Date().toISOString(),
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[api/ical/sync] failed:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
