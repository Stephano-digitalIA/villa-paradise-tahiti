import Image from 'next/image'

import { Container } from '@/components/ui'
import type { Villa } from '@/lib/sanity'

interface HeroVillaProps {
  villa: Villa
}

/**
 * Villa page hero.
 *
 * Editorial overlay-on-image hero (not fullscreen — the villa page is for
 * deep-diving, not selling at first glance). Uses the villa hero image and
 * displays the canonical name + tagline.
 */
export function HeroVilla({ villa }: HeroVillaProps) {
  const imageUrl = villa.heroImage.url ?? ''

  return (
    <section
      aria-label={`${villa.name} hero`}
      className="relative isolate flex min-h-[500px] w-full overflow-hidden bg-midnight text-pearl lg:min-h-[640px]"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src={imageUrl}
          alt={villa.heroImage.alt ?? villa.name}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>

      <Container className="relative z-10 flex flex-1 flex-col items-end justify-end pb-16 pt-32 text-right lg:pb-24">
        <p className="mb-6 flex items-center gap-3 font-sans text-eyebrow font-medium uppercase tracking-widest2 text-gold">
          <span className="h-px w-10 bg-gold" aria-hidden="true" />
          The Villa
        </p>

        <h1 className="max-w-4xl font-display text-hero-sm font-light italic leading-[1.02] text-pearl sm:text-hero-md lg:text-hero-lg">
          {villa.name}
        </h1>

        <p className="mt-6 max-w-2xl font-sans text-body-md text-pearl/80 sm:text-body-lg">
          {villa.tagline}
        </p>
      </Container>
    </section>
  )
}
