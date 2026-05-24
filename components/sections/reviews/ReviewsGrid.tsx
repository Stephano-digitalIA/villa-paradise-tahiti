'use client'

import { useMemo, useState } from 'react'
import { Container, Section } from '@/components/ui'
import { StarRating } from '@/components/sections/_shared/StarRating'
import { cn } from '@/lib/utils'
import type { Review, ReviewSource } from '@/lib/sanity'

const FILTERS: ReadonlyArray<{ label: string; value: 'all' | ReviewSource }> = [
  { label: 'All Reviews', value: 'all' },
  { label: 'Direct', value: 'direct' },
  { label: 'Airbnb', value: 'airbnb' },
  { label: 'VRBO', value: 'vrbo' },
  { label: 'Google', value: 'google' },
]

const SOURCE_LABEL: Record<ReviewSource, string> = {
  direct: 'Direct booking',
  airbnb: 'Airbnb',
  vrbo: 'VRBO',
  google: 'Google',
  tripadvisor: 'Tripadvisor',
}

interface ReviewsGridProps {
  reviews: Review[]
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  } catch {
    return ''
  }
}

/**
 * ReviewsGrid — filterable card grid of all guest reviews.
 *
 * The filter chip set is intentionally tactile (rounded-full, gold active
 * state) and lives client-side via `useState`. The data itself is passed
 * in pre-fetched from the server so SEO still gets all reviews.
 */
export function ReviewsGrid({ reviews }: ReviewsGridProps) {
  const [active, setActive] = useState<'all' | ReviewSource>('all')

  const filtered = useMemo(() => {
    if (active === 'all') return reviews
    return reviews.filter((r) => r.source === active)
  }, [active, reviews])

  return (
    <Section tone="pearl" spacing="default" id="all-reviews">
      <Container>
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow mb-3">All Reviews</p>
            <h2 className="font-heading text-h2-luxe font-medium text-midnight">
              What guests are saying
            </h2>
          </div>
          <p className="font-sans text-body-sm text-midnight-400">
            Showing <span className="font-semibold text-midnight">{filtered.length}</span>{' '}
            of {reviews.length}
          </p>
        </div>

        <div
          className="mb-12 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter reviews by source"
        >
          {FILTERS.map((filter) => {
            const isActive = active === filter.value
            return (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(filter.value)}
                className={cn(
                  'rounded-full border px-5 py-2 font-sans text-body-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pearl',
                  isActive
                    ? 'border-gold bg-gold text-midnight shadow-soft'
                    : 'border-pearl-400 bg-pearl text-midnight-400 hover:border-gold/40 hover:text-midnight',
                )}
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="font-sans text-body-md text-midnight-400">
            No reviews found for this source yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}

interface ReviewCardProps {
  review: Review
}

function ReviewCard({ review }: ReviewCardProps) {
  const body =
    review.body.length > 240 ? `${review.body.slice(0, 240).trim()}…` : review.body

  return (
    <article className="flex h-full flex-col gap-5 rounded-2xl border border-pearl-400 bg-pearl p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <header className="flex items-center justify-between gap-3">
        <StarRating rating={review.rating} size="h-4 w-4" />
        {review.verified ? (
          <span className="text-eyebrow uppercase tracking-widest2 text-leaf">
            ✓ Verified
          </span>
        ) : null}
      </header>

      <h3 className="font-heading text-h3-luxe font-medium leading-snug text-midnight">
        {review.title}
      </h3>

      <p className="font-sans text-body-sm leading-relaxed text-midnight-400">
        “{body}”
      </p>

      <footer className="mt-auto flex items-end justify-between gap-3 border-t border-pearl-400 pt-4">
        <div>
          <p className="font-sans text-body-sm font-semibold text-midnight">
            {review.authorName}
          </p>
          <p className="font-sans text-body-sm text-midnight-400">
            {review.authorLocation ?? '—'}
            {' · '}
            {formatDate(review.publishedAt)}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-pearl-500 bg-pearl-200 px-3 py-1 text-eyebrow uppercase tracking-widest2 text-midnight-400">
          {SOURCE_LABEL[review.source]}
        </span>
      </footer>
    </article>
  )
}
