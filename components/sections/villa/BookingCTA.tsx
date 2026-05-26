import Link from 'next/link'

import { Button, Container, Section } from '@/components/ui'
import { bookingHref } from '@/lib/navigation'

/**
 * Booking CTA — closes the villa page on a clear next step.
 *
 * Sand background for a softer end-of-page tone than the homepage's
 * dramatic midnight banner.
 */
export function BookingCTA() {
  return (
    <Section tone="sand" spacing="default">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Reserve Your Stay
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h2 className="font-display text-hero-sm font-light italic leading-tight text-midnight sm:text-hero-md">
            Looks perfect?
            <span className="block font-heading not-italic">
              Let&rsquo;s find your dates.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-sans text-body-md text-midnight-400 sm:text-body-lg">
            Most of our guests book three to six months ahead, especially for the dry
            season. Drop us your dates and we will hold the villa while you finalize
            flights.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild variant="primary" size="lg">
              <Link href={bookingHref}>Book Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/experiences">Browse Experiences</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
