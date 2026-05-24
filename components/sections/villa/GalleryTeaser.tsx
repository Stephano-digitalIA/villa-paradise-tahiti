import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { Container, Section } from '@/components/ui'
import type { Villa } from '@/lib/sanity'

interface GalleryTeaserProps {
  villa: Villa
}

/**
 * Villa gallery teaser.
 *
 * Six-image mosaic that gives a visual feel of the property and pushes
 * curious visitors to the full `/gallery` page (built by a sibling agent).
 *
 * Layout:
 *  - Mobile: 2-column grid, equal squares
 *  - Tablet+: hero-left + 5-tile grid right (editorial)
 */
export function GalleryTeaser({ villa }: GalleryTeaserProps) {
  const images = (villa.gallery ?? []).slice(0, 6)
  if (images.length === 0) return null

  // Pull a hero tile (first) + the rest.
  const [hero, ...rest] = images

  return (
    <Section tone="pearl" spacing="default">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              Gallery
            </p>
            <h2 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
              Slow scrolls and second looks
            </h2>
          </div>
          <Link
            href="/gallery"
            className="group inline-flex items-center gap-2 self-start font-sans text-sm font-bold uppercase tracking-luxe text-midnight transition-colors hover:text-gold sm:self-end"
          >
            View full gallery
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2">
          {/* Large hero — spans 2 columns and 2 rows on desktop */}
          {hero ? (
            <Link
              href="/gallery"
              className="group relative aspect-square overflow-hidden rounded-2xl col-span-2 lg:row-span-2 lg:aspect-auto"
              aria-label={`Open gallery — ${hero.alt ?? 'villa photo'}`}
            >
              <Image
                src={hero.url ?? ''}
                alt={hero.alt ?? 'Villa Paradise'}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-midnight/30 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                aria-hidden="true"
              />
            </Link>
          ) : null}

          {rest.map((image) => (
            <Link
              key={image.url ?? image.alt}
              href="/gallery"
              className="group relative aspect-square overflow-hidden rounded-2xl"
              aria-label={`Open gallery — ${image.alt ?? 'villa photo'}`}
            >
              <Image
                src={image.url ?? ''}
                alt={image.alt ?? 'Villa Paradise'}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-midnight/30 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}
