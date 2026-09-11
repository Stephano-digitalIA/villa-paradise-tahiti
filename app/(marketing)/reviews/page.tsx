import type { Metadata } from 'next'

import {
  JsonLd,
  aggregateRatingSchema,
  breadcrumbSchema,
} from '@/components/seo'
import { ReviewsCta } from '@/components/sections/reviews/ReviewsCta'
import { ReviewsGrid } from '@/components/sections/reviews/ReviewsGrid'
import { ReviewsHero } from '@/components/sections/reviews/ReviewsHero'
import { ReviewsStats } from '@/components/sections/reviews/ReviewsStats'
import { cmsFetch } from '@/lib/cms/fetcher'
import { reviewsQuery, type Review } from '@/lib/cms'
import { SITE_URL, absoluteUrl, buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Guest Reviews — Villa Paradise Tahiti',
  description:
    'See what our guests say about Villa Paradise. 4.96/5 from 147 verified reviews on Airbnb, VRBO and Google. Real stories, unedited.',
  path: '/reviews',
})

/**
 * /reviews — Trust hub.
 *
 * Aggregates reviews into:
 *  1. Hero with average rating
 *  2. Stats strip (rating, count, repeat guests, response time)
 *  3. Filterable card grid (by source)
 *  4. Closing CTA → /booking
 *
 * Trust numbers (repeat guest %, response time) are placeholders pending
 * confirmation with Thierry — see docs/10-todo-post-assets.md.
 *
 * Structured data: AggregateRating tied to the VacationRental @id so it
 * powers the Google star snippet on the rental's listing.
 */
const PUBLISHED_RATING = 4.96
const PUBLISHED_REVIEW_COUNT = 147

export default async function ReviewsPage() {
  const reviews = await cmsFetch<Review[]>(reviewsQuery)

  // Published figures. The reviews stored here are a sample of what the villa
  // has collected across Airbnb, VRBO and Google; the numbers shown are the
  // owner's consolidated record (updated September 2026). Kept in one place so
  // the hero, the stats strip and the Google snippet can never disagree.
  const displayTotal = Math.max(reviews.length, PUBLISHED_REVIEW_COUNT)
  const averageRating = PUBLISHED_RATING
  const aggregate = aggregateRatingSchema(reviews, displayTotal, averageRating)

  return (
    <>
      {aggregate ? <JsonLd data={aggregate} /> : null}
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Reviews', url: absoluteUrl('/reviews') },
        ])}
      />
      <ReviewsHero averageRating={averageRating} totalReviews={displayTotal} />
      <ReviewsStats
        averageRating={averageRating}
        totalReviews={displayTotal}
        repeatGuestsPercent={28}
        responseTime="< 1 hour"
      />
      <ReviewsGrid reviews={reviews} />
      <ReviewsCta />
    </>
  )
}
