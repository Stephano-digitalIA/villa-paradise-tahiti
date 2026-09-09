import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Button, Container, Section } from '@/components/ui'
import { liveAdminClient } from '@/lib/supabase/admin'
import { formatUSD } from '@/lib/booking/pricing'
import { formatStayDate } from '@/lib/format/date'

import { PayInstalmentButton } from './PayInstalmentButton'

export const metadata: Metadata = {
  title: 'Payment — Villa Paradise Tahiti',
  // A payment link must never be indexed, and never leak its token in a
  // referrer to whatever the guest clicks next.
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export const dynamic = 'force-dynamic'

/**
 * One instalment of a three-payment plan, opened from the link in the
 * reminder email.
 *
 * The token is the only credential. It authenticates a single instalment, not
 * the reservation: paying the second must not hand over a way to reach the
 * third. Nothing identifying is shown beyond the guest's own first name and
 * their dates, so a forwarded link discloses very little.
 */
export default async function PayInstalmentPage({
  params,
}: {
  params: { token: string }
}) {
  const { data, error } = await liveAdminClient
    .from('payment_schedule')
    .select(
      'id, sequence, label, amount, due_date, status, reservation_id, reservations(reservation_ref, check_in, check_out, display_currency, customers(first_name, email))',
    )
    .eq('pay_token', params.token)
    .maybeSingle()

  if (error || !data) notFound()

  const item = data as unknown as {
    id: string
    sequence: number
    label: string
    amount: number
    due_date: string
    status: string
    reservations: {
      reservation_ref: string
      check_in: string
      check_out: string
      display_currency: string | null
      customers: { first_name: string | null; email: string | null } | null
    } | null
  }

  const stay = item.reservations
  const firstName = stay?.customers?.first_name ?? ''
  const alreadyPaid = item.status === 'paid'
  const cancelled = item.status === 'cancelled'

  return (
    <Section tone="pearl" spacing="default">
      <Container className="max-w-xl pt-24">
        <p className="eyebrow mb-4 flex items-center gap-3 text-gold">
          <span className="h-px w-8 bg-gold" aria-hidden="true" />
          Villa Paradise Tahiti
        </p>

        {cancelled ? (
          <>
            <h1 className="font-display text-hero-sm font-light italic text-midnight">
              This payment was cancelled.
            </h1>
            <p className="mt-6 font-sans text-body-md text-midnight-400">
              Nothing is due from this link. If you think that is a mistake, write to
              us and we will sort it out.
            </p>
          </>
        ) : alreadyPaid ? (
          <>
            <h1 className="font-display text-hero-sm font-light italic text-midnight">
              Already paid. Thank you.
            </h1>
            <p className="mt-6 font-sans text-body-md text-midnight-400">
              This instalment of {formatUSD(item.amount)} has been received. There is
              nothing more to do here.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-hero-sm font-light italic text-midnight">
              {firstName ? `${firstName}, your` : 'Your'} payment
              <span className="block not-italic font-heading font-normal text-gold">
                {item.sequence} of 3
              </span>
            </h1>

            <div className="mt-8 rounded-2xl border border-pearl-400 bg-white p-6 shadow-soft">
              <dl className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between gap-4 border-b border-pearl-400 pb-4">
                  <dt className="font-sans text-body-sm text-midnight-400">Amount due</dt>
                  <dd className="font-heading text-h2-luxe font-medium text-midnight">
                    {formatUSD(item.amount)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-sans text-body-sm text-midnight-400">Due by</dt>
                  <dd className="font-sans text-body-sm font-semibold text-midnight">
                    {formatStayDate(item.due_date, 'en-US')}
                  </dd>
                </div>
                {stay ? (
                  <>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="font-sans text-body-sm text-midnight-400">Your stay</dt>
                      <dd className="font-sans text-body-sm text-midnight">
                        {formatStayDate(stay.check_in, 'en-US')} to{' '}
                        {formatStayDate(stay.check_out, 'en-US')}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="font-sans text-body-sm text-midnight-400">Reference</dt>
                      <dd className="font-mono text-body-sm text-midnight">
                        {stay.reservation_ref}
                      </dd>
                    </div>
                  </>
                ) : null}
              </dl>

              <div className="mt-6">
                <PayInstalmentButton token={params.token} />
              </div>

              <p className="mt-4 font-sans text-caption text-midnight-400">
                Secure payment by PayPal. A card works without a PayPal account.
              </p>
            </div>
          </>
        )}

        <div className="mt-10">
          <Button asChild variant="outline" size="md">
            <Link href="/contact">A question about this payment?</Link>
          </Button>
        </div>
      </Container>
    </Section>
  )
}
