import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  JsonLd,
  breadcrumbSchema,
  vacationRentalSchema,
} from '@/components/seo'
import {
  Amenities,
  BookingCTA,
  GalleryTeaser,
  HeroVilla,
  Location,
  SpecsGrid,
  VillaDescription,
} from '@/components/sections/villa'
import { SITE_URL, absoluteUrl, buildMetadata } from '@/lib/seo'
import { sanityFetch } from '@/lib/sanity/fetcher'
import { villaQuery, type Villa } from '@/lib/sanity'

export const metadata: Metadata = buildMetadata({
  title: 'The Villa — Villa Paradise Tahiti',
  description:
    'Discover our luxury beachfront villa: 4 bedrooms, heated infinity pool, lagoon access and Moorea views in Punaauia, Tahiti.',
  path: '/villa',
})

/**
 * `/villa` — The Villa page.
 *
 * Assembled from server-side section components. Each section receives the
 * fetched `Villa` document and renders its piece of the story. Order
 * matches docs/05-contenu-pages.md §2:
 *
 *  1. Hero — image, name, tagline
 *  2. Description — Portable Text long-form
 *  3. Specs grid — six headline stats
 *  4. Amenities — grouped Indoor / Outdoor / Services
 *  5. Location — map placeholder + distances
 *  6. Gallery teaser — 6-image grid, links to /gallery
 *  7. Booking CTA — close on conversion
 *
 * Structured data: VacationRental (primary product) + BreadcrumbList.
 */
export default async function VillaPage() {
  const villa = await sanityFetch<Villa | null>(villaQuery)
  if (!villa) notFound()

  return (
    <>
      <JsonLd data={vacationRentalSchema(villa)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'The Villa', url: absoluteUrl('/villa') },
        ])}
      />
      <HeroVilla villa={villa} />
      <VillaDescription villa={villa} />
      <SpecsGrid villa={villa} />
      <Amenities villa={villa} />
      <Location villa={villa} />
      <GalleryTeaser villa={villa} />
      <BookingCTA />
    </>
  )
}
