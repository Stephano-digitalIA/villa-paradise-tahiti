/**
 * POST /api/paypal/capture — Phase E2.
 *
 * Called by the client (from `/booking/paypal/return`) after the user
 * approves the PayPal order. We capture the funds inline so the success
 * page can show a real confirmation as soon as the redirect lands.
 *
 * The PayPal webhook (`/api/paypal/webhook`) is the source of truth for
 * *email dispatch* — relying on the client-driven capture for emails
 * would mean a flaky network or a closed tab silently drops the
 * confirmation. The webhook is independent: it fires from PayPal's
 * servers and triggers email regardless of what happened to the browser.
 *
 * Request:  `{ "orderId": "..." }`
 * Response: `{ status: "COMPLETED" | ..., reservationId?: string }`
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { capturePayPalOrder, getPayPalOrder, isPayPalConfigured } from '@/lib/paypal'

export const runtime = 'nodejs'

const requestSchema = z.object({
  orderId: z.string().min(1),
})

export async function POST(request: Request) {
  if (!isPayPalConfigured()) {
    return NextResponse.json(
      { error: 'PayPal is not configured on the server.' },
      { status: 503 },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing orderId.', issues: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const { orderId } = parsed.data

  const result = await capturePayPalOrder(orderId)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  // Pull the reservation id from the order itself if the capture response
  // didn't carry one (it should, but be defensive).
  let reservationId = result.reservationId
  if (!reservationId) {
    const order = await getPayPalOrder(orderId)
    if (!('error' in order)) reservationId = order.reservationId
  }

  return NextResponse.json({
    status: result.status,
    captureId: result.captureId,
    reservationId,
  })
}
