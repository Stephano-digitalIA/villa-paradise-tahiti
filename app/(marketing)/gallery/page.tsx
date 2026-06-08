import type { Metadata } from 'next'
import Link from 'next/link'

import { Button, Container, Section } from '@/components/ui'
import { GalleryGrid } from '@/components/sections/gallery/GalleryGrid'
import {
  JsonLd,
  breadcrumbSchema,
  imageGallerySchema,
} from '@/components/seo'
import {
  galleryImages as fallbackImages,
  type GalleryCategory,
  type GalleryImage,
} from '@/lib/data/gallery-images'
import { getGalleryItems } from '@/lib/supabase/queries'
import { bookingHref } from '@/lib/navigation'
import { SITE_URL, absoluteUrl, buildMetadata } from '@/lib/seo'

/**
 * Live gallery loader — reads Supabase `gallery_items` (managed from
 * /admin/content/gallery) and falls back to the bundled static images when
 * the table is empty, so the page is never blank.
 */
const CATEGORY_MAP: Record<string, GalleryCategory> = {
  exterior: 'exterior',
  interior: 'interior',
  pool: 'pool',
  lagoon: 'lagoon',
  sunset: 'sunset',
  experiences: 'experiences',
  bedrooms: 'interior',
  night: 'sunset',
}

async function loadGalleryImages(): Promise<GalleryImage[]> {
  const rows = await getGalleryItems()
  if (rows.length === 0) return fallbackImages
  return rows.map((g, i) => ({
    id: g.id ?? `gal-${i}`,
    url: g.image_url ?? '',
    alt: g.alt ?? '',
    category: CATEGORY_MAP[g.category] ?? 'exterior',
    width: g.width ?? 1400,
    height: g.height ?? 1050,
    caption: g.caption ?? undefined,
  }))
}

/**
 * /gallery — Villa Paradise photo gallery.
 *
 *  - Compact hero introduces the page.
 *  - `<GalleryGrid />` (client component) owns the filter chips,
 *    the masonry rendering, and the lightbox interaction.
 *  - Closing CTA pushes visitors toward `/booking`.
 *
 * Image data lives in `lib/data/gallery-images.ts` for now; the rest of
 * the UI is data-shape agnostic so we can drop in a Sanity feed later
 * without touching this file.
 */

export const metadata: Metadata = buildMetadata({
  title: 'Gallery — Villa Paradise Tahiti',
  description:
    'Step inside Villa Paradise — a curated visual tour of the villa, the lagoon, the pool and the experiences that wait for you in Tahiti.',
  path: '/gallery',
})

export default async function GalleryPage() {
  const galleryImages = await loadGalleryImages()
  const galleryStructured = galleryImages.slice(0, 24).map((image) => ({
    url: image.url,
    caption: image.caption,
  }))

  return (
    <>
      <JsonLd
        data={imageGallerySchema({
          name: 'Villa Paradise Tahiti — Photo Gallery',
          description:
            'A curated visual tour of Villa Paradise, the lagoon, the pool and the experiences guests enjoy in Tahiti.',
          path: '/gallery',
          images: galleryStructured,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Gallery', url: absoluteUrl('/gallery') },
        ])}
      />
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <Section tone="pearl" spacing="compact">
        <Container className="pt-24 text-center">
          <p className="eyebrow mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Gallery
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h1 className="font-display text-hero-sm font-light italic leading-[1.02] text-midnight sm:text-hero-md">
            Step Inside <span className="not-italic font-heading text-gold">Villa Paradise</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-sans text-body-md text-midnight-400 sm:text-body-lg">
            A visual tour of the villa, the lagoon and the moments that wait for you.
          </p>
        </Container>
      </Section>

      {/* ─── Grid + filters + lightbox ───────────────────────────────── */}
      <Section tone="pearl" spacing="tight">
        <Container>
          <GalleryGrid images={galleryImages} />
        </Container>
      </Section>

      {/* ─── Closing CTA ────────────────────────────────────────────── */}
      <Section tone="midnight" spacing="compact">
        <Container className="text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3 text-gold">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Ready to see it in person?
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h2 className="font-display text-h2-luxe font-light italic text-pearl">
            Photos can only do so much.
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-sans text-body-md text-pearl/70">
            Check availability for your dates and let us handle the rest — direct booking,
            best rate guaranteed.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="primary" size="lg" asChild>
              <Link href={bookingHref}>Book Now</Link>
            </Button>
            <Button variant="outline-light" size="lg" asChild>
              <Link href="/villa">Discover the Villa</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
