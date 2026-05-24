/**
 * POST /api/track — Phase F2.
 *
 * Server-side GA4 event relay using the Measurement Protocol
 * (https://developers.google.com/analytics/devguides/collection/protocol/ga4).
 *
 * Why this exists:
 *   Webhook handlers (Stripe / PayPal confirmation in Phase E2/E3) run
 *   server-side and don't have access to `window.gtag`, so they can't
 *   fire the `purchase` event that GA4 expects after a successful
 *   payment. They can POST to this endpoint instead.
 *
 * Status in Phase F2:
 *   Exposed but NOT yet wired. The webhook handlers are out of scope
 *   for F2 — see "TODOs for next phase" in the F2 report. Until then,
 *   this endpoint is a no-op stub that returns `200 { ok: false,
 *   reason: 'not_configured' }` when the GA env vars are missing.
 *
 * Configuration:
 *   - `NEXT_PUBLIC_GA_ID`  → the GA4 Measurement ID (G-XXXXXXXXXX).
 *   - `GA_API_SECRET`      → API secret created in GA4
 *                            (Admin → Data Streams → Measurement Protocol).
 *
 * Both must be set for the endpoint to actually forward events.
 */

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MP_ENDPOINT = 'https://www.google-analytics.com/mp/collect'

type TrackRequestBody = {
  eventName: string
  params?: Record<string, string | number | boolean | undefined>
  clientId?: string
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseBody(raw: unknown): TrackRequestBody | null {
  if (!isPlainObject(raw)) return null
  const eventName = raw.eventName
  if (typeof eventName !== 'string' || eventName.length === 0) return null

  const params =
    isPlainObject(raw.params)
      ? (raw.params as Record<string, string | number | boolean | undefined>)
      : undefined
  const clientId = typeof raw.clientId === 'string' ? raw.clientId : undefined

  return { eventName, params, clientId }
}

export async function POST(req: Request) {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json(
      { ok: false, reason: 'invalid_json' },
      { status: 400 }
    )
  }

  const body = parseBody(json)
  if (!body) {
    return NextResponse.json(
      { ok: false, reason: 'invalid_payload' },
      { status: 400 }
    )
  }

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID
  const GA_API_SECRET = process.env.GA_API_SECRET

  if (!GA_ID || !GA_API_SECRET) {
    // Mock / unconfigured mode — accept the call but don't forward it.
    return NextResponse.json({ ok: false, reason: 'not_configured' })
  }

  try {
    const url = `${MP_ENDPOINT}?measurement_id=${encodeURIComponent(
      GA_ID
    )}&api_secret=${encodeURIComponent(GA_API_SECRET)}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: body.clientId ?? 'server',
        events: [
          {
            name: body.eventName,
            params: body.params ?? {},
          },
        ],
      }),
    })

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, reason: 'upstream_error', status: res.status },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { ok: false, reason: 'network_error' },
      { status: 502 }
    )
  }
}
