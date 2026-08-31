/**
 * GET /api/cron/balance-reminders — protected cron entrypoint.
 *
 * The Terms say we email a payment request for the remaining 70% thirty days
 * before arrival. Nothing charges that balance automatically, so somebody has
 * to send that request by hand. This route is what stops it being forgotten:
 * it emails the owner a few days ahead of each deadline, listing the stays
 * that need one.
 *
 * Same contract as `/api/ical/sync`: refuses anything without
 * `Authorization: Bearer ${CRON_SECRET}`, and refuses everything when
 * CRON_SECRET is unset, so an unauthenticated endpoint cannot ship by
 * accident. Schedule it once a day from Netlify Scheduled Functions, GitHub
 * Actions, or any external cron.
 *
 * Idempotence without a migration: each reminder is written to `email_logs`
 * with the type below, and a stay that already has one is skipped. Running the
 * job twice in a day, or replaying it, sends nothing twice.
 */

import { NextResponse } from 'next/server'

import { OWNER_EMAIL, sendCustomCustomerEmail } from '@/lib/resend'
import { adminClient } from '@/lib/supabase/admin'
import { shiftIsoDay } from '@/lib/booking/availability-client'
import { formatStayDate } from '@/lib/format/date'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Marker in `email_logs`, and the guard against sending twice. */
const EMAIL_TYPE = 'balance_reminder_owner'

/**
 * Days before arrival at which the owner is warned.
 *
 * The balance request is due at 30 days. Warning exactly then would leave no
 * margin: the reminder lands the same morning the request should already have
 * gone out. Five days of lead time lets it be sent calmly, and covers a job
 * that fails to run for a day or two.
 */
const LEAD_DAYS = 35

function money(amount: number | null, currency: string | null): string {
  if (amount == null) return 'n/a'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount)
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

  const today = new Date().toISOString().slice(0, 10)

  // Deposit paid, arrival inside the reminder window, balance still owed.
  // The window is open-ended towards today so a stay is still caught if the
  // job did not run for a few days.
  const { data: rows, error } = await adminClient
    .from('reservations')
    .select(
      'id, reservation_ref, check_in, check_out, balance_amount, display_currency, customers(first_name, last_name, email)',
    )
    .eq('payment_status', 'deposit_paid')
    .gte('check_in', today)
    .lte('check_in', shiftIsoDay(today, LEAD_DAYS))
    .order('check_in', { ascending: true })

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[cron:balance-reminders] query failed:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const due = (rows ?? []) as Array<{
    id: string
    reservation_ref: string
    check_in: string
    check_out: string
    balance_amount: number | null
    display_currency: string | null
    customers: { first_name: string | null; last_name: string | null; email: string | null } | null
  }>

  if (due.length === 0) {
    return NextResponse.json({ ok: true, checked: 0, sent: 0, skipped: 0 })
  }

  // Which of these already had their reminder?
  const { data: alreadySent } = await adminClient
    .from('email_logs')
    .select('reservation_id')
    .eq('email_type', EMAIL_TYPE)
    .in(
      'reservation_id',
      due.map((r) => r.id),
    )

  const done = new Set((alreadySent ?? []).map((l: { reservation_id: string | null }) => l.reservation_id))
  const pending = due.filter((r) => !done.has(r.id))

  let sent = 0
  for (const r of pending) {
    const guest = [r.customers?.first_name, r.customers?.last_name].filter(Boolean).join(' ') || 'Guest'
    const daysAway = Math.round(
      (Date.parse(`${r.check_in}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000,
    )

    const bodyText = [
      `Balance to collect for ${r.reservation_ref}.`,
      '',
      `Guest    : ${guest}${r.customers?.email ? ` (${r.customers.email})` : ''}`,
      `Arrival  : ${formatStayDate(r.check_in, 'en-US')} (in ${daysAway} days)`,
      `Departure: ${formatStayDate(r.check_out, 'en-US')}`,
      `Balance  : ${money(r.balance_amount, r.display_currency)}`,
      '',
      'Our Terms say the payment request for the remaining 70% goes out 30 days',
      `before arrival, so this one is due in ${Math.max(0, daysAway - 30)} day(s).`,
      'Nothing is charged automatically: send the guest a payment request, then',
      'mark the reservation as fully paid in the admin once it clears.',
      '',
      `https://villaparadisetahiti.com/admin/reservations/${r.id}`,
    ].join('\n')

    const result = await sendCustomCustomerEmail({
      to: OWNER_EMAIL,
      subject: `Balance due in ${Math.max(0, daysAway - 30)} day(s) — ${r.reservation_ref} — ${guest}`,
      bodyText,
    })

    // Logged whatever the outcome: a failed send must not be retried blindly
    // every day, and the failure is worth seeing on the reservation page.
    await adminClient.from('email_logs').insert({
      reservation_id: r.id,
      customer_id: null,
      email_type: EMAIL_TYPE,
      recipient_email: OWNER_EMAIL,
      status: result.ok ? 'sent' : 'failed',
      resend_message_id: result.ok ? result.id : null,
      error_message: result.ok ? null : (result.message ?? result.reason),
    })

    if (result.ok) sent += 1
  }

  return NextResponse.json({
    ok: true,
    checked: due.length,
    sent,
    skipped: due.length - pending.length,
  })
}
