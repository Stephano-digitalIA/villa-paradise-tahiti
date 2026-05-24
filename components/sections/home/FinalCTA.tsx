import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'

import { Button, Container } from '@/components/ui'
import { bookingHref } from '@/lib/navigation'
import { mockVilla } from '@/lib/sanity'

/**
 * Final CTA banner — Homepage.
 *
 * Full-width banner that closes the homepage on a strong conversion note.
 * Uses the villa hero image as an atmospheric backdrop (heavily darkened)
 * with a single primary CTA pointing to the booking funnel.
 */
export function FinalCTA() {
  const heroUrl = mockVilla.heroImage.url ?? ''

  return (
    <section
      aria-label="Plan your Tahiti escape"
      className="relative isolate overflow-hidden bg-midnight text-pearl"
    >
      {/* Background image with darkening overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={heroUrl}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/85 to-midnight/60"
          aria-hidden="true"
        />
      </div>

      <Container className="relative py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 flex items-center justify-center gap-3 font-sans text-eyebrow font-medium uppercase tracking-widest2 text-gold">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Reserve Your Stay
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h2 className="font-display text-hero-sm font-light italic leading-tight text-pearl sm:text-hero-md">
            Ready to start planning
            <span className="block font-heading not-italic text-gold">
              your Tahiti escape?
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-body-md text-pearl/80 sm:text-body-lg">
            Tell us your dates and the number of travelers — we will hold the villa for 48
            hours while you finalize your flights and design the perfect week with our
            concierge.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild variant="primary" size="lg">
              <Link href={bookingHref}>Check Availability</Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href="/contact">Message the Owner</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-pearl/70">
            <div className="flex items-center gap-1.5">
              <div className="flex" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <span className="font-sans text-body-sm text-pearl">4.9 / 5</span>
            </div>
            <span className="hidden h-4 w-px bg-pearl/20 sm:block" aria-hidden="true" />
            <span className="font-sans text-body-sm">Free cancellation up to 60 days</span>
            <span className="hidden h-4 w-px bg-pearl/20 sm:block" aria-hidden="true" />
            <span className="font-sans text-body-sm">Secure booking by Stripe</span>
          </div>
        </div>
      </Container>
    </section>
  )
}
