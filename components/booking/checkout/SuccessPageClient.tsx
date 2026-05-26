'use client'

/**
 * SuccessPageClient — confirmation view shown after a successful checkout.
 *
 *  - Reads the reservation reference from `?ref=` and renders a friendly
 *    summary card.
 *  - **Clears the booking localStorage entry** on mount — the cart has
 *    been consumed, we don't want it to follow the user around if they
 *    open `/booking` again later.
 *  - No call to `useBooking()` here: by the time the user reaches this
 *    page the Provider may not even be in the tree (success is a leaf
 *    page wrapped in its own minimal layout).
 *
 * Phase E will likely receive `?session_id=` from Stripe instead of our
 * stub's `?ref=` — keep this component tolerant: it accepts both.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Mail, Phone, Sparkles, Wallet } from 'lucide-react'

import { Button, Container, Section } from '@/components/ui'
import { clearBookingState } from '@/lib/booking'

import { CheckoutBreadcrumb } from './CheckoutBreadcrumb'

export function SuccessPageClient() {
  const searchParams = useSearchParams()
  // We accept either our stub's `ref` or a future `session_id` (Phase E /
  // Stripe Checkout). Whatever shows up first wins; never crash on absence.
  const reservationId =
    searchParams.get('ref') ?? searchParams.get('session_id') ?? null
  const [clearedAt] = useState(() => Date.now())

  // Clear persisted cart once we know the user has reached the
  // confirmation page. Wrapped in useEffect → no SSR mismatch.
  useEffect(() => {
    clearBookingState()
    // `clearedAt` is intentionally captured so we don't accidentally
    // re-run this on every render. ESLint is happy with the bare deps.
  }, [clearedAt])

  return (
    <>
      <Section tone="pearl" spacing="tight">
        <Container className="flex flex-col items-center gap-6 pt-16 text-center sm:pt-20">
          <span
            aria-hidden="true"
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/15 text-gold sm:h-24 sm:w-24"
          >
            <CheckCircle2 className="h-12 w-12 sm:h-14 sm:w-14" strokeWidth={1.5} />
          </span>
          <p className="eyebrow flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Confirmed
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h1 className="font-display text-hero-sm font-light italic leading-[1.05] text-midnight sm:text-hero-md">
            Thank You! Your Stay Is{' '}
            <span className="not-italic font-heading text-gold">Reserved</span>
          </h1>
          <p className="max-w-2xl font-sans text-body-md text-midnight-400 sm:text-body-lg">
            {reservationId ? (
              <>
                Reservation{' '}
                <span className="font-semibold text-midnight">
                  #{reservationId}
                </span>
                . A confirmation email is on its way with everything you need for your trip.
              </>
            ) : (
              <>
                A confirmation email is on its way with everything you need for your trip.
              </>
            )}
          </p>
          <CheckoutBreadcrumb current="confirmation" />
        </Container>
      </Section>

      <Section tone="pearl" spacing="compact">
        <Container className="flex flex-col items-center gap-8">
          <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            <NextStep
              icon={<Mail className="h-5 w-5" />}
              title="Check your inbox"
              body="A detailed confirmation email is on its way. Add villaparadisetahiti@gmail.com to your contacts so it doesn't get lost."
            />
            <NextStep
              icon={<Wallet className="h-5 w-5" />}
              title="Balance due 30 days before arrival"
              body="We'll send a friendly reminder before the due date. Pay by card or wire — no surprises."
            />
            <NextStep
              icon={<Sparkles className="h-5 w-5" />}
              title="Pre-arrival concierge"
              body="Our team will reach out about 7 days before your arrival to coordinate transfers, experiences, and any special requests."
            />
            <NextStep
              icon={<Phone className="h-5 w-5" />}
              title="Questions? We're here."
              body={
                <>
                  Reply directly to your confirmation email, or write to{' '}
                  <a
                    href="mailto:villaparadisetahiti@gmail.com"
                    className="font-semibold text-lagoon underline-offset-2 hover:underline"
                  >
                    villaparadisetahiti@gmail.com
                  </a>
                  .
                </>
              }
            />
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/">Return to homepage</Link>
            </Button>
            <Link
              href="/blog"
              className="text-xs font-semibold uppercase tracking-widest2 text-midnight-400 transition-colors hover:text-gold focus-visible:text-gold focus-visible:outline-none focus-visible:underline"
            >
              Read our travel journal while you wait
            </Link>
          </div>
        </Container>
      </Section>
    </>
  )
}

/* ---------------------------------------------------------------------------
 * NextStep — single tile in the "what's next" grid.
 * ------------------------------------------------------------------------- */

interface NextStepProps {
  icon: React.ReactNode
  title: string
  body: React.ReactNode
}

function NextStep({ icon, title, body }: NextStepProps) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-pearl-400 bg-pearl p-5 text-left shadow-soft">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gold/15 text-gold"
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="font-heading text-base font-semibold leading-tight text-midnight">
          {title}
        </p>
        <p className="font-sans text-body-sm leading-snug text-midnight-400">
          {body}
        </p>
      </div>
    </div>
  )
}
