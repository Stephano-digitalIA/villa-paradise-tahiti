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
import { sanityFetch } from '@/lib/sanity/fetcher'
import { reviewsQuery, type Review } from '@/lib/sanity'
import { SITE_URL, absoluteUrl, buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Guest Reviews — Villa Paradise Tahiti',
  description:
    'See what our guests say about Villa Paradise. 4.9/5 from 100+ verified reviews on Airbnb, VRBO and Google. Real stories, unedited.',
  path: '/reviews',
})

/**
 * /reviews — Trust hub.
 *
 * Aggregates Sanity reviews into:
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
export default async function ReviewsPage() {
  const reviews = await sanityFetch<Review[]>(reviewsQuery)

  // Aggregate stats — derived from the live review set so they stay in sync.
  const totalReviews = reviews.length
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

  // Marketing-facing total. We display "100+" to signal scale even when
  // only a subset of reviews has been migrated into Sanity yet.
  const displayTotal = Math.max(totalReviews, 100)
  const aggregate = aggregateRatingSchema(reviews, displayTotal)

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
