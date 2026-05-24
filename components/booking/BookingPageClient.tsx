'use client'

/**
 * BookingPageClient — composes the calculator UI inside the Provider.
 *
 * Kept as a separate client component so the route's `page.tsx` can stay
 * a server component (Sanity fetching + metadata). The Suspense boundary
 * is required by Next 14 around any `useSearchParams()` consumer.
 */

import { Suspense } from 'react'

import { Container, Section } from '@/components/ui'

import { DateRangePicker } from './DateRangePicker'
import { ExperiencePrefill } from './ExperiencePrefill'
import { ExperienceSelector } from './ExperienceSelector'
import { GuestSelector } from './GuestSelector'
import { PriceSummary } from './PriceSummary'

export function BookingPageClient() {
  return (
    <>
      {/* Search-param-driven side effect. Suspense-wrapped because Next 14 requires it. */}
      <Suspense fallback={null}>
        <ExperiencePrefill />
      </Suspense>

      {/* ─── Page header ─────────────────────────────────────────────── */}
      <Section tone="pearl" spacing="tight">
        <Container className="pt-20 text-center sm:pt-24">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Booking
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h1 className="font-display text-hero-sm font-light italic leading-[1.05] text-midnight sm:text-hero-md">
            Build Your <span className="not-italic font-heading text-gold">Stay</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-sans text-body-md text-midnight-400 sm:text-body-lg">
            Customize your villa stay and the experiences you'd like to add. No commitment
            until you reach checkout — adjust freely.
          </p>
        </Container>
      </Section>

      {/* ─── Calculator layout ───────────────────────────────────────── */}
      <Section tone="pearl" spacing="compact">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Form column */}
            <div className="flex flex-col gap-10 lg:col-span-8">
              <section
                aria-labelledby="step-dates"
                className="rounded-2xl border border-pearl-400 bg-pearl p-6 shadow-soft sm:p-8"
              >
                <h2 id="step-dates" className="sr-only">Step 1 — Dates</h2>
                <DateRangePicker />
              </section>

              <section
                aria-labelledby="step-guests"
                className="rounded-2xl border border-pearl-400 bg-pearl p-6 shadow-soft sm:p-8"
              >
                <h2 id="step-guests" className="sr-only">Step 2 — Guests</h2>
                <GuestSelector />
              </section>

              <section
                aria-labelledby="step-experiences"
                className="rounded-2xl border border-pearl-400 bg-pearl p-6 shadow-soft sm:p-8"
              >
                <h2 id="step-experiences" className="sr-only">Step 3 — Experiences</h2>
                <ExperienceSelector />
              </section>
            </div>

            {/* Summary column */}
            <div className="lg:col-span-4">
              <PriceSummary />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
