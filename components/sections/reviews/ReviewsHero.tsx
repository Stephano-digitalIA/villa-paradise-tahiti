import Link from 'next/link'
import { Container, Section } from '@/components/ui'
import { StarRating } from '@/components/sections/_shared/StarRating'

export interface ReviewsHeroProps {
  averageRating: number
  totalReviews: number
}

/**
 * ReviewsHero — editorial intro to /reviews.
 * Sets the trust tone: average score + count of independent sources.
 */
export function ReviewsHero({ averageRating, totalReviews }: ReviewsHeroProps) {
  const rounded = averageRating.toFixed(2).replace(/\.?0+$/, '')

  return (
    <Section tone="pearl" spacing="default">
      <Container className="pt-24">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Guest Reviews
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>

          <h1 className="font-display text-hero-sm font-light italic leading-[1.02] text-midnight sm:text-hero-md">
            Stories from
            <span className="block not-italic font-heading font-normal text-gold">
              Our Guests
            </span>
          </h1>

          <p className="mt-8 max-w-prose font-sans text-body-md text-midnight-400 sm:text-body-lg">
            A small villa, a long memory. Read what couples, families and
            travelers from across the U.S. have written after their week at
            Villa Paradise — unfiltered, unedited, on the platforms they
            booked through.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
            <StarRating
              rating={averageRating}
              size="h-6 w-6"
              ariaLabel={`Average rating ${rounded} out of 5`}
            />
            <p className="font-sans text-body-md text-midnight">
              <span className="font-semibold text-midnight">{rounded}/5</span>{' '}
              <span className="text-midnight-400">
                from {totalReviews}+ reviews on{' '}
                <Link href="https://www.airbnb.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold transition-colors">Airbnb</Link>
                {', '}
                <Link href="https://www.booking.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold transition-colors">Booking</Link>
                {' & '}
                <Link href="https://www.vrbo.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold transition-colors">VRBO</Link>
              </span>
            </p>
          </div>
        </div>
      </Container>
    </Section>
  )
}
