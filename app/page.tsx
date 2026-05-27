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
import { HeroVideo } from '@/components/sections/home/HeroVideo'
import { buildMetadata } from '@/lib/seo'
import { sanityFetch } from '@/lib/sanity/fetcher'
import { villaQuery, type Villa } from '@/lib/sanity'
import { mockVilla } from '@/lib/sanity'

export const metadata: Metadata = buildMetadata({
  title:
    'Villa Paradise Tahiti — Luxury Private Villa Rental in French Polynesia',
  description:
    'Your private paradise in Tahiti. 4 bedrooms, heated infinity pool, Moorea views, included car. Book direct for the best rate.',
  path: '/',
})

export default async function HomePage() {
  const villa = await sanityFetch<Villa | null>(villaQuery)
  const videoUrl = mockVilla.heroVideoUrl
  const posterUrl = mockVilla.heroImage.url ?? ''

  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      {villa ? <JsonLd data={vacationRentalSchema(villa)} /> : null}

      {/* Two-column layout: content scrolls left, portrait video sticky right */}
      {/* pb matches video bottom gap: p-4 + (100vh-95vh)/2 ≈ 2.5vh + 1rem */}
      <div className="relative lg:flex lg:pb-[calc(2.5vh+1rem)]">

        {/* Left column — all sections scroll normally */}
        <div className="min-w-0 lg:w-[55%]">
          <HeroHome />
          <KeyFeatures />
          <VillaPreview />
          <ExperiencesTeaser />
          <ReviewsGlimpse />
          <WhyDirectBooking />
          <FinalCTA />
        </div>

        {/* Right column — stretches to left column height, video sticky inside */}
        <div className="hidden lg:block lg:w-[45%]">
          <div className="sticky top-0 flex h-screen w-full items-start justify-center px-4 pb-4 pt-[5.5rem]">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-2xl">
              {videoUrl ? (
                <HeroVideo videoUrl={videoUrl} posterUrl={posterUrl} />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={posterUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
