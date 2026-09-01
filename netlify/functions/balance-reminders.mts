import type { Config } from '@netlify/functions'

/**
 * Daily balance reminder: Netlify Scheduled Function.
 *
 * Twin of `ical-sync.mts`: a thin scheduler shim whose only job is to wake
 * up once a day and call `/api/cron/balance-reminders` with the bearer
 * `CRON_SECRET`. All the logic (which stays are due, whether a reminder was
 * already sent, sending it) lives in the route, so there is one place to
 * read and one place to fix.
 *
 * The route warns the owner five days before each balance falls due, and the
 * Terms put that due date thirty days before arrival. Running daily is what
 * makes that lead time meaningful: a weekly job would miss the window
 * entirely for some stays.
 *
 * Timing: schedules are UTC. `0 18 * * *` is 08:00 in Tahiti (UTC-10), so
 * Thierry finds the reminder waiting at the start of his day rather than in
 * the middle of the night.
 *
 * Requires `CRON_SECRET` in Netlify → Site configuration → Environment
 * variables, the same value the route checks.
 */

export default async (_req: Request) => {
  const siteUrl = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL
  const cronSecret = process.env.CRON_SECRET?.trim()

  if (!siteUrl) {
    console.error('[balance-reminders] no site URL available (process.env.URL missing)')
    return new Response('Missing site URL', { status: 500 })
  }
  if (!cronSecret) {
    console.error('[balance-reminders] CRON_SECRET not configured')
    return new Response('Missing CRON_SECRET', { status: 500 })
  }

  const endpoint = new URL('/api/cron/balance-reminders', siteUrl).toString()
  const startedAt = Date.now()

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        'User-Agent': 'NetlifyScheduledFunction/balance-reminders',
      },
    })

    const body = await response.text()
    const ms = Date.now() - startedAt

    if (!response.ok) {
      console.error(
        `[balance-reminders] endpoint failed (${response.status}) in ${ms}ms:`,
        body.slice(0, 500),
      )
      return new Response(body, { status: response.status })
    }

    console.log(`[balance-reminders] OK in ${ms}ms: ${body.slice(0, 500)}`)
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[balance-reminders] fetch threw:', err)
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
  // 18:00 UTC = 08:00 in Tahiti.
  schedule: '0 18 * * *',
}
