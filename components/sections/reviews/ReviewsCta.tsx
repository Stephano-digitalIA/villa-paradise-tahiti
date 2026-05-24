import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button, Container, Section } from '@/components/ui'
import { bookingHref } from '@/lib/navigation'

/**
 * ReviewsCta — closing call-to-action on /reviews.
 * Mirrors the closing block of the home page but reframed around the
 * reader as "the next guest". Dark tone for contrast against the white
 * card grid above.
 */
export function ReviewsCta() {
  return (
    <Section tone="midnight" spacing="default">
      <Container className="text-center">
        <p className="eyebrow mb-6 flex items-center justify-center gap-3 text-gold">
          <span className="h-px w-8 bg-gold" aria-hidden="true" />
          Your Story Begins Here
          <span className="h-px w-8 bg-gold" aria-hidden="true" />
        </p>

        <h2 className="mx-auto max-w-3xl font-display text-hero-sm font-light italic leading-[1.05] text-pearl sm:text-h1-luxe">
          Ready to write
          <span className="block not-italic font-heading font-normal text-gold">
            your own review?
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-prose font-sans text-body-md text-pearl/70">
          Eight days, four bedrooms, one private lagoon. Check availability
          for your dates and lock in our direct rate — always lower than the
          platforms above.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild variant="primary" size="lg">
            <Link href={bookingHref}>
              Check Availability
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline-light" size="lg">
            <Link href="/contact">Ask a Question</Link>
          </Button>
        </div>
      </Container>
    </Section>
  )
}
