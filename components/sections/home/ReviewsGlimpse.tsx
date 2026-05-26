import Link from 'next/link'
import { ArrowRight, Quote, Star } from 'lucide-react'

import { Container, Section } from '@/components/ui'
import { sanityFetch } from '@/lib/sanity/fetcher'
import {
  featuredReviewsQuery,
  type Review,
} from '@/lib/sanity'

/**
 * Reviews glimpse section — Homepage.
 *
 * Renders three featured guest reviews as editorial quote cards.
 * Server component — fetches at render time.
 */
export async function ReviewsGlimpse() {
  const reviews = await sanityFetch<Review[]>(featuredReviewsQuery)
  if (!reviews || reviews.length === 0) return null

  const featured = reviews.slice(0, 4)

  return (
    <Section tone="midnight" spacing="default" className="mx-4 !w-auto rounded-3xl lg:mx-8">
      <Container>
        <div className="max-w-2xl">
          <p className="mb-4 flex items-center gap-3 font-sans text-eyebrow font-medium uppercase tracking-widest2 text-gold">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Guest Stories
          </p>
          <h2 className="font-heading text-h2-luxe font-medium leading-tight text-pearl">
            Loved by couples, families and honeymooners from across the US
          </h2>
          <div className="mt-6 flex items-center gap-2 text-pearl/85">
            <div className="flex" aria-label="Rated 4.9 out of 5 stars">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" aria-hidden="true" />
              ))}
            </div>
            <span className="font-sans text-body-sm font-semibold text-pearl">4.9</span>
            <span className="font-sans text-body-sm text-pearl/65">
              · 100+ verified reviews
            </span>
          </div>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-6 lg:gap-8">
          {featured.map((review) => (
            <li
              key={review._id}
              className="flex h-full flex-col gap-6 rounded-2xl border border-pearl/10 bg-midnight-700/40 p-8 backdrop-blur"
            >
              <Quote className="h-8 w-8 text-gold" strokeWidth={1.25} aria-hidden="true" />

              <div
                className="flex"
                aria-label={`Rated ${review.rating} out of 5 stars`}
              >
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" aria-hidden="true" />
                ))}
              </div>

              <blockquote className="flex-1 font-display text-body-lg italic leading-relaxed text-pearl">
                &ldquo;{review.body}&rdquo;
              </blockquote>

              <footer className="border-t border-pearl/10 pt-5">
                <p className="font-heading text-body-md text-pearl">{review.authorName}</p>
                {review.authorLocation ? (
                  <p className="font-sans text-body-sm text-pearl/60">
                    {review.authorLocation}
                  </p>
                ) : null}
              </footer>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-start">
          <Link
            href="/reviews"
            className="group inline-flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-luxe text-gold transition-colors hover:text-gold-300"
          >
            Read all reviews
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </Container>
    </Section>
  )
}
