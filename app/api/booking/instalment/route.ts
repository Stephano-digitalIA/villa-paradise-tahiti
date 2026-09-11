/**
 * POST /api/booking/instalment
 *
 * Creates a PayPal order for one instalment of a payment plan, from the token
 * in the emailed link.
 *
 * The amount is read from the row, never from the request. That is the same
 * rule the main checkout follows: what the guest owes is decided server-side,
 * so nobody can pay less by editing a payload.
 */
import { NextResponse } from 'next/server'

import { liveAdminClient } from '@/lib/supabase/admin'
import { createPayPalOrder, isPayPalConfigured } from '@/lib/paypal'
import { convertUsdToEur } from '@/lib/currency'
import { cmsFetch } from '@/lib/cms/fetcher'
import { settingsQuery, type Settings } from '@/lib/cms'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let token = ''
  try {
    const body = (await request.json()) as { token?: unknown }
    if (typeof body.token !== 'string' || !body.token) {
      return NextResponse.json({ error: 'Missing payment token.' }, { status: 400 })
    }
    token = body.token
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { data, error } = await liveAdminClient
    .from('payment_schedule')
    .select(
      'id, sequence, amount, status, reservations(reservation_ref, display_currency, exchange_rate, customers(email))',
    )
    .eq('pay_token', token)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'This payment link is not valid.' }, { status: 404 })
  }

  const item = data as unknown as {
    id: string
    sequence: number
    amount: number
    status: string
    reservations: {
      reservation_ref: string
      display_currency: string | null
      exchange_rate: number | null
      customers: { email: string | null } | null
    } | null
  }

  if (item.status === 'paid') {
    return NextResponse.json({ error: 'This instalment is already paid.' }, { status: 409 })
  }
  if (item.status === 'cancelled') {
    return NextResponse.json({ error: 'This instalment was cancelled.' }, { status: 409 })
  }
  if (!isPayPalConfigured()) {
    return NextResponse.json(
      { error: 'Online payment is temporarily unavailable. Please contact us.' },
      { status: 503 },
    )
  }

  const stay = item.reservations
  const currency = stay?.display_currency === 'EUR' ? 'EUR' : 'USD'

  // Charge in the currency the guest chose at booking, at the rate frozen on
  // the reservation. Re-reading today's rate would quietly change what a plan
  // costs between instalments, which is not what was agreed.
  let rate = stay?.exchange_rate ?? null
  if (currency === 'EUR' && !rate) {
    const settings = await cmsFetch<Settings | null>(settingsQuery).catch(() => null)
    rate = settings?.usdToEurRate ?? 0.88
  }
  const chargeAmount =
    currency === 'EUR' ? convertUsdToEur(item.amount, rate ?? 0.88) : item.amount

  const result = await createPayPalOrder({
    // The reference the webhook matches on. Suffixed with the instalment so a
    // capture can be attributed to the right row rather than to the booking.
    reservationId: `${stay?.reservation_ref ?? 'VPT'}#${item.sequence}`,
    chargeAmount,
    currency,
    paymentLabel: `Instalment ${item.sequence} of 3`,
    customer: { email: stay?.customers?.email ?? '' },
    metadata: { instalmentId: item.id, sequence: String(item.sequence) },
    // From an emailed link we do not know which button the guest prefers;
    // the card form serves both, since it also offers a PayPal sign-in.
    landingPage: 'GUEST_CHECKOUT',
  })

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  // Marked paid by the webhook on capture, never here: an approval link is not
  // a payment, and a guest who abandons on PayPal must still owe the money.
  return NextResponse.json({ url: result.approveUrl, orderId: result.orderId })
}
