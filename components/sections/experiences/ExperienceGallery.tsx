import Image from 'next/image'

import { Container, Section } from '@/components/ui'
import type { ExperienceGalleryItem } from '@/lib/supabase/types'

interface ExperienceGalleryProps {
  images: ExperienceGalleryItem[]
  /** Used for descriptive alt fallbacks. */
  experienceTitle: string
}

/**
 * Photo gallery for an experience detail page — the extra photos curated in the
 * admin (`experience_gallery`), shown below the hero/cover. Renders nothing when
 * there are no photos.
 */
export function ExperienceGallery({ images, experienceTitle }: ExperienceGalleryProps) {
  if (images.length === 0) return null

  return (
    <Section tone="sand" spacing="default">
      <Container>
        <div className="mb-10 text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Gallery
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h2 className="font-display text-h2-luxe font-light italic text-midnight">
            A glimpse of the experience
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {images.map((image, idx) => (
            <div
              key={image.id}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-pearl-300 shadow-soft"
            >
              <Image
                src={image.image_url}
                alt={image.alt ?? `${experienceTitle} — photo ${idx + 1}`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 ease-luxe hover:scale-105"
              />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
