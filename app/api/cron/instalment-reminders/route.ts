/**
 * GET /api/cron/instalment-reminders — protected cron entrypoint.
 *
 * Emails the guest a payment link a few days before each instalment falls
 * due, and again once it is overdue. Nothing is charged automatically: no card
 * is stored, so the guest clicks and pays. That is the whole difference
 * between this and what the large platforms do, and it is why there is no
 * failed-charge machinery to maintain here.
 *
 * The first instalment is never chased: it was paid at booking, or the
 * booking does not exist.
 *
 * Same contract as the other cron routes: refuses anything without
 * `Authorization: Bearer ${CRON_SECRET}`, and refuses everything when
 * CRON_SECRET is unset, so an open endpoint cannot ship by accident.
 *
 * Idempotence: `reminded_at` is stamped whatever the send outcome, so a
 * failing address is not mailed every morning for a month.
 */
import { NextResponse } from 'next/server'

import { liveAdminClient } from '@/lib/supabase/admin'
import { sendCustomCustomerEmail } from '@/lib/resend'
import { SITE_URL } from '@/lib/seo'
import { formatStayDate } from '@/lib/format/date'
import { formatUSD } from '@/lib/booking/pricing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Days before the due date at which the guest is asked. */
const LEAD_DAYS = 7

function isoDay(offsetDays: number): string {
  return new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10)
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: 'CRON_SECRET not configured on the server.' },
      { status: 500 },
    )
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  // Due within the lead window, including anything already overdue: a missed
  // run must not let an instalment slip past unasked.
  const { data, error } = await liveAdminClient
    .from('payment_schedule')
    .select(
      'id, sequence, label, amount, due_date, pay_token, reminded_at, reservations(reservation_ref, check_in, customers(first_name, email))',
    )
    .eq('status', 'pending')
    .gt('sequence', 1)
    .lte('due_date', isoDay(LEAD_DAYS))
    .is('reminded_at', null)
    .order('due_date', { ascending: true })

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[cron:instalment-reminders] query failed:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const due = (data ?? []) as unknown as Array<{
    id: string
    sequence: number
    label: string
    amount: number
    due_date: string
    pay_token: string
    reservations: {
      reservation_ref: string
      check_in: string
      customers: { first_name: string | null; email: string | null } | null
    } | null
  }>

  if (due.length === 0) {
    return NextResponse.json({ ok: true, checked: 0, sent: 0 })
  }

  let sent = 0
  for (const item of due) {
    const guestEmail = item.reservations?.customers?.email
    if (!guestEmail) continue

    const firstName = item.reservations?.customers?.first_name ?? ''
    const payUrl = `${SITE_URL}/booking/pay/${encodeURIComponent(item.pay_token)}`
    const overdue = item.due_date < isoDay(0)

    const result = await sendCustomCustomerEmail({
      to: guestEmail,
      subject: overdue
        ? `Payment ${item.sequence} of 3 is now due, ${item.reservations?.reservation_ref ?? ''}`
        : `Payment ${item.sequence} of 3 for your Tahiti stay`,
      bodyText: [
        firstName ? `Hello ${firstName},` : 'Hello,',
        '',
        overdue
          ? `Payment ${item.sequence} of 3 for your stay was due on ${formatStayDate(item.due_date, 'en-US')}.`
          : `Payment ${item.sequence} of 3 for your stay is due on ${formatStayDate(item.due_date, 'en-US')}.`,
        '',
        `Amount: ${formatUSD(item.amount)}`,
        item.reservations?.check_in
          ? `Arrival: ${formatStayDate(item.reservations.check_in, 'en-US')}`
          : '',
        '',
        'You can pay it here, in a couple of clicks:',
        payUrl,
        '',
        'A card works without a PayPal account. Nothing is charged automatically,',
        'so this link is the only way the payment goes through.',
        '',
        'Any question, simply reply to this email.',
        '',
        'Villa Paradise Tahiti',
      ]
        .filter((line) => line !== '')
        .join('\n'),
    })

    // Stamped whatever happened. A bouncing address must not be retried every
    // morning; the failure shows in the Resend log instead.
    await liveAdminClient
      .from('payment_schedule')
      .update({ reminded_at: new Date().toISOString() })
      .eq('id', item.id)

    if (result.ok) sent += 1
  }

  return NextResponse.json({ ok: true, checked: due.length, sent })
}
