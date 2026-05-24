'use client'

/**
 * CheckoutPageClient — orchestrates the /booking/checkout layout.
 *
 * Responsibilities:
 *  - Read `useBooking()` and decide which view to render:
 *      1. Skeleton while the provider rehydrates from localStorage.
 *      2. "Booking incomplete" guard if `validation.isValid === false`
 *         after hydration — sends the user back to /booking to finish
 *         their selection. This is intentional: the form is meaningless
 *         without a complete cart.
 *      3. The full 2-column checkout otherwise.
 *  - Keep the page declarative: the form and the summary handle their own
 *    state — this component just wires them together.
 */

import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

import { Button, Container, Section } from '@/components/ui'

import { useBooking } from '../BookingProvider'
import { CheckoutBreadcrumb } from './CheckoutBreadcrumb'
import { CheckoutForm } from './CheckoutForm'
import { CheckoutFormSkeleton } from './CheckoutFormSkeleton'
import { CheckoutSummary } from './CheckoutSummary'
import { CheckoutTrustBadges } from './CheckoutTrustBadges'

export function CheckoutPageClient() {
  const { hydrated, validation } = useBooking()

  return (
    <>
      {/* ─── Page header (always visible) ────────────────────────── */}
      <Section tone="pearl" spacing="tight">
        <Container className="flex flex-col items-center gap-5 pt-16 text-center sm:pt-20">
          <p className="eyebrow flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Checkout
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h1 className="font-display text-hero-sm font-light italic leading-[1.05] text-midnight sm:text-hero-md">
            Review Your <span className="not-italic font-heading text-gold">Stay</span>
          </h1>
          <p className="max-w-2xl font-sans text-body-md text-midnight-400 sm:text-body-lg">
            One more step. Confirm your details, choose how to pay, and our concierge will get to
            work on your arrival.
          </p>
          <CheckoutBreadcrumb current="checkout" />
        </Container>
      </Section>

      {/* ─── Body ──────────────────────────────────────────────────── */}
      {!hydrated ? (
        <CheckoutFormSkeleton />
      ) : !validation.isValid ? (
        <IncompleteBookingNotice issues={validation.issues} />
      ) : (
        <CheckoutBody />
      )}
    </>
  )
}

/* ---------------------------------------------------------------------------
 * Main layout — 2 columns on desktop, stacked on mobile.
 * ------------------------------------------------------------------------- */

function CheckoutBody() {
  return (
    <>
      <Section tone="pearl" spacing="compact">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <CheckoutForm />
            </div>
            <div className="lg:col-span-5">
              <CheckoutSummary />
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="sand" spacing="tight">
        <Container>
          <CheckoutTrustBadges />
        </Container>
      </Section>
    </>
  )
}

/* ---------------------------------------------------------------------------
 * Guard — incomplete booking notice.
 * ------------------------------------------------------------------------- */

interface IncompleteBookingNoticeProps {
  issues: string[]
}

function IncompleteBookingNotice({ issues }: IncompleteBookingNoticeProps) {
  return (
    <Section tone="pearl" spacing="compact">
      <Container className="flex justify-center">
        <div className="flex max-w-xl flex-col gap-5 rounded-2xl border border-coral/30 bg-coral/10 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-coral" aria-hidden="true" />
            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading text-h3-luxe font-medium text-midnight">
                Your booking is incomplete
              </h2>
              <p className="font-sans text-body-sm text-midnight-400">
                Please return to the previous step and complete your selection before continuing
                to checkout.
              </p>
            </div>
          </div>

          {issues.length > 0 ? (
            <ul className="ml-8 flex list-disc flex-col gap-1 text-body-sm text-midnight">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button asChild variant="primary" size="md">
              <Link href="/booking">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back to build your stay</span>
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
