import type { Metadata } from 'next'

import {
  JsonLd,
  organizationSchema,
  vacationRentalSchema,
  websiteSchema,
} from '@/components/seo'
import {
  ExperiencesTeaser,
  FinalCTA,
  HeroHome,
  KeyFeatures,
  ReviewsGlimpse,
  VillaPreview,
  WhyDirectBooking,
} from '@/components/sections/home'
import { buildMetadata } from '@/lib/seo'
import { sanityFetch } from '@/lib/sanity/fetcher'
import { villaQuery, type Villa } from '@/lib/sanity'

export const metadata: Metadata = buildMetadata({
  title:
    'Villa Paradise Tahiti — Luxury Private Villa Rental in French Polynesia',
  description:
    'Your private paradise in Tahiti. 4 bedrooms, heated infinity pool, Moorea views, included car. Book direct for the best rate.',
  path: '/',
})

/**
 * Homepage `/` — Villa Paradise Tahiti.
 *
 * Assembles the full homepage from server-side section components. Each
 * section is responsible for its own data fetching (Sanity) where needed —
 * keeping this file declarative and easy to reorder.
 *
 * Order follows docs/05-contenu-pages.md §1:
 *  1. Hero (fullscreen, video/poster)
 *  2. Key features / USPs
 *  3. Villa preview (image + copy, links to /villa)
 *  4. Experiences teaser (3 featured)
 *  5. Reviews glimpse (3 featured)
 *  6. Why direct booking
 *  7. Final CTA banner
 *
 * SEO surface: Organization + WebSite + VacationRental JSON-LD attached
 * server-side so crawlers see structured data on the first paint.
 */
export default async function HomePage() {
  const villa = await sanityFetch<Villa | null>(villaQuery)

  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      {villa ? <JsonLd data={vacationRentalSchema(villa)} /> : null}
      <HeroHome />
      <KeyFeatures />
      <VillaPreview />
      <ExperiencesTeaser />
      <ReviewsGlimpse />
      <WhyDirectBooking />
      <FinalCTA />
    </>
  )
}
