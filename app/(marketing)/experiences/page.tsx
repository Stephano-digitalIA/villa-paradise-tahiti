import type { Metadata } from 'next'
import Link from 'next/link'

import { Button, Container, Section } from '@/components/ui'
import { ExperienceList } from '@/components/sections/experiences/ExperienceList'
import {
  JsonLd,
  breadcrumbSchema,
  collectionPageSchema,
} from '@/components/seo'
import { sanityFetch } from '@/lib/sanity/fetcher'
import {
  experiencesQuery,
  type Experience,
} from '@/lib/sanity'
import { bookingHref } from '@/lib/navigation'
import { SITE_URL, absoluteUrl, buildMetadata } from '@/lib/seo'

/**
 * /experiences — Catalog page for curated experiences.
 *
 *  - Hero introduces the section.
 *  - The data layer comes from `experiencesQuery` (Sanity in prod,
 *    fixtures in mock mode).
 *  - The `<ExperienceList />` client component owns the category filter
 *    chips so the rest of the page stays as a server component.
 *  - Closing bandeau pushes to `/booking`.
 */

export const metadata: Metadata = buildMetadata({
  title: 'Experiences — Snorkeling, Sunset Cruises & Private Chef',
  description:
    'From lagoon adventures to romantic dinners — curate your perfect Tahiti experience and add it to your stay at Villa Paradise.',
  path: '/experiences',
})

export default async function ExperiencesPage() {
  const experiences = await sanityFetch<Experience[]>(experiencesQuery)

  return (
    <>
      <JsonLd
        data={collectionPageSchema({
          name: 'Curated Polynesian Experiences',
          description:
            'A handpicked catalogue of dining, excursion and wellness experiences guests can add to their Villa Paradise Tahiti stay.',
          path: '/experiences',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Experiences', url: absoluteUrl('/experiences') },
        ])}
      />
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <Section tone="pearl" spacing="compact">
        <Container className="pt-24 text-center">
          <p className="eyebrow mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Experiences & Dining
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h1 className="font-display text-hero-sm font-light italic leading-[1.02] text-midnight sm:text-hero-md">
            Curated Polynesian{' '}
            <span className="not-italic font-heading text-gold">Experiences</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-body-md text-midnight-400 sm:text-body-lg">
            From thrilling lagoon adventures to romantic private dinners — we handle every
            detail so your stay feels less like a trip and more like a memory you keep.
          </p>
        </Container>
      </Section>

      {/* ─── Filter + grid ───────────────────────────────────────────── */}
      <Section tone="pearl" spacing="default">
        <Container>
          <ExperienceList experiences={experiences ?? []} />
        </Container>
      </Section>

      {/* ─── Closing bandeau ─────────────────────────────────────────── */}
      <Section tone="midnight" spacing="compact">
        <Container className="text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3 text-gold">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Add to your stay
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h2 className="font-display text-h2-luxe font-light italic text-pearl">
            Build your custom Tahiti experience.
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-sans text-body-md text-pearl/70">
            Pick the moments that matter to you. We coordinate the rest — chefs, captains,
            guides, transport, timing.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="primary" size="lg" asChild>
              <Link href={bookingHref}>Start Booking</Link>
            </Button>
            <Button variant="outline-light" size="lg" asChild>
              <Link href="/gallery">Browse the Gallery</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
