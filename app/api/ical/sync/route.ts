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

import { getBlockedDates, hasAnyIcalSource } from '@/lib/ical'

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
    const ranges = await getBlockedDates(true)
    const sources = hasAnyIcalSource()
      ? ['airbnb', 'vrbo'].filter((name) =>
          ranges.some((r) => r.source.split(',').includes(name)),
        )
      : ['mock']

    return NextResponse.json({
      ok: true,
      count: ranges.length,
      sources,
      mode: hasAnyIcalSource() ? 'live' : 'mock',
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
