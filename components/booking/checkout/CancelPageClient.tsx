'use client'

/**
 * CancelPageClient — neutral landing page after a cancelled or aborted
 * payment.
 *
 * Design notes:
 *  - Tone is calm, not alarming: we use `XCircle` in the midnight
 *    palette (no coral / red) — the goal is to reassure, not punish.
 *  - **We do NOT clear localStorage here**. Users who back out should be
 *    able to come straight back to /booking/checkout with their cart
 *    intact.
 *  - Phase E will pass through Stripe's `?session_id=` on the cancel URL;
 *    we accept it for forward compatibility but the page works without
 *    any query string at all.
 */

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, RefreshCcw, XCircle } from 'lucide-react'

import { Button, Container, Section } from '@/components/ui'

export function CancelPageClient() {
  const searchParams = useSearchParams()
  const reservationId =
    searchParams.get('ref') ?? searchParams.get('session_id') ?? null

  return (
    <>
      <Section tone="pearl" spacing="tight">
        <Container className="flex flex-col items-center gap-6 pt-16 text-center sm:pt-20">
          <span
            aria-hidden="true"
            className="flex h-20 w-20 items-center justify-center rounded-full bg-midnight/10 text-midnight sm:h-24 sm:w-24"
          >
            <XCircle className="h-12 w-12 sm:h-14 sm:w-14" strokeWidth={1.5} />
          </span>
          <p className="eyebrow flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Cancelled
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h1 className="font-display text-hero-sm font-light italic leading-[1.05] text-midnight sm:text-hero-md">
            Booking <span className="not-italic font-heading text-gold">Cancelled</span>
          </h1>
          <p className="max-w-2xl font-sans text-body-md text-midnight-400 sm:text-body-lg">
            Your booking wasn't processed. No charges have been made.
          </p>
          {reservationId ? (
            <p className="text-xs uppercase tracking-widest2 text-midnight-300">
              Reference · {reservationId}
            </p>
          ) : null}
        </Container>
      </Section>

      <Section tone="pearl" spacing="compact">
        <Container className="flex justify-center">
          <div className="flex w-full max-w-2xl flex-col gap-5 rounded-2xl border border-pearl-400 bg-pearl p-6 shadow-soft sm:p-8">
            <h2 className="font-heading text-h3-luxe font-medium text-midnight">
              Your selection is still saved
            </h2>
            <p className="font-sans text-body-md text-midnight-400">
              We've kept your dates, guest count and chosen experiences on this device. You can
              return to checkout whenever you're ready, or go back and tweak your stay first.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="primary" size="lg">
                <Link href="/booking/checkout">
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Return to checkout</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/booking">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Modify booking</span>
                </Link>
              </Button>
            </div>

            <p className="text-xs text-midnight-400">
              Need help? Write to{' '}
              <a
                href="mailto:villaparadisetahiti@gmail.com"
                className="font-semibold text-lagoon underline-offset-2 hover:underline"
              >
                villaparadisetahiti@gmail.com
              </a>{' '}
              and a human will get back to you within the hour.
            </p>
          </div>
        </Container>
      </Section>
    </>
  )
}
