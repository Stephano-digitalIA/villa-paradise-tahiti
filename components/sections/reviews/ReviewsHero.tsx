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
                <Link href="https://fr.airbnb.com/rooms/23511994?check_in=2026-06-04&check_out=2026-06-14&search_mode=regular_search&source_impression_id=p3_1779804651_P3uvx4LK0vgt136U&previous_page_section_name=1000&federated_search_id=4a365e88-6b56-4812-878d-f69cf918aacd" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold transition-colors">Airbnb</Link>
                {', '}
                <Link href="https://www.booking.com/hotel/pf/mata-miti.fr.html?aid=304142&label=gen173nr-10CAEoggI46AdIM1gEaLIBiAEBmAEzuAEXyAEM2AED6AEB-AEBiAIBqAIBuAKS1dbQBsACAdICJDBhMDIwY2YxLWYyMDQtNGI2ZC1hOWIzLTBhZjM2MDMxNTVkM9gCAeACAQ&sid=85c9e8b54bd5cce93de7a15d901c5dbd&checkin=2026-06-17&checkout=2026-06-26&dest_id=2877973&dest_type=hotel&dist=0&group_adults=2&group_children=0&hapos=1&hpos=1&no_rooms=1&req_adults=2&req_children=0&room1=A%2CA&sb_price_type=total&soh=1&sr_order=popularity&srepoch=1779804865&srpvid=4deb641a7255047c&type=total&ucfs=1&#no_availability_msg" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold transition-colors">Booking</Link>
                {' & '}
                <Link href="https://www.vrbo.com/2700862?chkin=2026-06-06&chkout=2026-06-20&d1=2026-06-06&d2=2026-06-20&startDate=2026-06-06&endDate=2026-06-20&x_pwa=1&rfrr=HSR&pwa_ts=1779805004744&referrerUrl=aHR0cHM6Ly93d3cudnJiby5jb20vSG90ZWwtU2VhcmNo&useRewards=false&adults=2&regionId=180199&destination=Punaauia%2C+Windward+Islands%2C+French+Polynesia&destType=MARKET&latLong=-17.622994%2C-149.604574&searchId=ad8e74c2-d4fc-401d-858b-c2e87f8fac9f&sort=RECOMMENDED&top_dp=806&top_cur=USD&userIntent=&selectedRoomType=76325727&selectedRatePlan=00046055c6039f1e455db56123f811559df8&expediaPropertyId=76325727" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold transition-colors">VRBO</Link>
              </span>
            </p>
          </div>
        </div>
      </Container>
    </Section>
  )
}
