import type { Config } from '@netlify/functions'

/**
 * Hourly iCal sync — Netlify Scheduled Function.
 *
 * Hits the Next.js route `/api/ical/sync` with the bearer `CRON_SECRET`
 * so the route itself stays the single source of truth for the sync
 * logic (fetch + parse + persist + cache refresh). This function is a
 * thin scheduler shim — its only job is "wake up every hour, call the
 * endpoint, log the result".
 *
 * Notes:
 *  - `process.env.URL` is automatically injected by Netlify with the
 *    canonical deploy URL (e.g. https://villa-paradise-tahiti-thierry.netlify.app).
 *  - `CRON_SECRET` must be set in Netlify → Site configuration →
 *    Environment variables (same value as in `.env.local` for parity).
 *  - The cron schedule uses standard 5-field cron syntax. `@hourly` is
 *    a valid shortcut (== "0 * * * *").
 */

export default async (_req: Request) => {
  const siteUrl = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL
  const cronSecret = process.env.CRON_SECRET?.trim()

  if (!siteUrl) {
    console.error('[ical-sync] no site URL available (process.env.URL missing)')
    return new Response('Missing site URL', { status: 500 })
  }
  if (!cronSecret) {
    console.error('[ical-sync] CRON_SECRET not configured')
    return new Response('Missing CRON_SECRET', { status: 500 })
  }

  const endpoint = new URL('/api/ical/sync', siteUrl).toString()
  const startedAt = Date.now()

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        'User-Agent': 'NetlifyScheduledFunction/ical-sync',
      },
    })

    const body = await response.text()
    const ms = Date.now() - startedAt

    if (!response.ok) {
      console.error(
        `[ical-sync] endpoint failed (${response.status}) in ${ms}ms:`,
        body.slice(0, 500),
      )
      return new Response(body, { status: response.status })
    }

    console.log(`[ical-sync] OK in ${ms}ms — ${body.slice(0, 500)}`)
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[ical-sync] fetch threw:', err)
    return new Response(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}

export const config: Config = {
  schedule: '@hourly',
}
