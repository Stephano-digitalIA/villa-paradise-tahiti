/**
 * POST /api/newsletter/subscribe
 *
 * Backs the form at the bottom of /blog, which until now had `action="#"` and
 * silently discarded every address it was given.
 *
 * Single opt-in: the row is written and the welcome email goes out at once.
 * The response is deliberately the same whether the address was new, already
 * on the list, or previously unsubscribed and now back. Saying "you are
 * already subscribed" would turn this endpoint into a way to test whether a
 * given person is on the list.
 *
 * A failed welcome email does not fail the request: the address is saved,
 * which is the part that matters, and the operator sees the send failure in
 * the Resend log.
 */
import { NextResponse } from 'next/server'

import { adminClient } from '@/lib/supabase/admin'
import { sendCustomCustomerEmail } from '@/lib/resend'
import {
  isPlausibleEmail,
  newUnsubscribeToken,
  normaliseEmail,
  unsubscribeUrl,
} from '@/lib/newsletter'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Same answer for every outcome, so the endpoint reveals nothing. */
const OK = NextResponse.json({ ok: true })

export async function POST(request: Request) {
  let email = ''
  let website = ''
  try {
    const body = (await request.json()) as { email?: unknown; website?: unknown }
    email = typeof body.email === 'string' ? normaliseEmail(body.email) : ''
    // Honeypot: a field hidden from people and irresistible to naive bots.
    website = typeof body.website === 'string' ? body.website : ''
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  if (website.trim() !== '') return OK
  if (!isPlausibleEmail(email)) {
    return NextResponse.json(
      { ok: false, error: 'Please enter a valid email address.' },
      { status: 400 },
    )
  }

  const token = newUnsubscribeToken()

  // Insert, or bring a previously unsubscribed address back. `onConflict` on
  // the email keeps one row per inbox; the stored token is left alone on an
  // existing row so links already sent out keep working.
  const { data, error } = await adminClient
    .from('newsletter_subscribers')
    .upsert(
      {
        email,
        status: 'subscribed',
        unsubscribe_token: token,
        source: 'blog',
        unsubscribed_at: null,
      },
      { onConflict: 'email', ignoreDuplicates: false },
    )
    .select('unsubscribe_token, created_at')
    .maybeSingle()

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[newsletter:subscribe]', error.message)
    return NextResponse.json(
      { ok: false, error: 'We could not save your address. Please try again.' },
      { status: 500 },
    )
  }

  const unsubUrl = unsubscribeUrl(data?.unsubscribe_token ?? token)

  const result = await sendCustomCustomerEmail({
    to: email,
    subject: 'Welcome to The Slow Letter',
    bodyText: [
      'Thank you for subscribing to The Slow Letter.',
      '',
      'Once a month, we send honest island recommendations, new journal',
      'entries, and the occasional last-minute date at Villa Paradise.',
      'Nothing else, and never your address to anyone.',
      '',
      'If this was not you, or you change your mind, one click is enough:',
      unsubUrl,
      '',
      'See you in Tahiti,',
      'Villa Paradise Tahiti',
    ].join('\n'),
  })

  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.error('[newsletter:welcome] send failed:', result.reason)
  }

  return OK
}
