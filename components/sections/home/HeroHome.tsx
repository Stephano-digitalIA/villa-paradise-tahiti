import Link from 'next/link'
import { Star } from 'lucide-react'

import { Button, Container } from '@/components/ui'
import { bookingHref } from '@/lib/navigation'
import { mockVilla } from '@/lib/sanity'
import { HeroVideo } from './HeroVideo'

/**
 * Hero section — Homepage.
 *
 * Fullscreen, immersive entry point. A muted-autoplay `<video>` plays the
 * villa aerial loop with the villa hero image used as the poster — this is
 * also the static fallback when the video URL is unavailable or motion is
 * reduced (the browser handles `prefers-reduced-motion` for native video).
 *
 * Layout: editorial-style — eyebrow, oversized italic display H1, luxury
 * subheading, dual CTAs, then a discreet trust strip pinned to the bottom.
 *
 * Server component — no client interactivity needed here.
 */
export function HeroHome() {
  const posterUrl = mockVilla.heroImage.url ?? ''
  const videoUrl = mockVilla.heroVideoUrl

  return (
    <section
      className="relative isolate flex min-h-[600px] w-full overflow-hidden bg-midnight text-pearl lg:min-h-screen"
      aria-label="Villa Paradise Tahiti hero"
    >
      {/* Background video layer + poster fallback */}
      {videoUrl ? (
        <HeroVideo videoUrl={videoUrl} posterUrl={posterUrl} />
      ) : (
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterUrl}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/40 to-midnight/20"
            aria-hidden="true"
          />
        </div>
      )}

      <Container className="relative z-10 flex flex-1 flex-col justify-end pb-16 pt-32 sm:pb-20 lg:pb-28">
        <div className="max-w-3xl">
          <p className="mb-6 flex items-center gap-3 font-sans text-eyebrow font-medium uppercase tracking-widest2 text-gold">
            <span className="h-px w-10 bg-gold" aria-hidden="true" />
            Tahiti · French Polynesia
          </p>

          <h1 className="font-display text-hero-sm font-light italic leading-[1.02] text-pearl sm:text-hero-md lg:text-hero-lg">
            Your Private Paradise
            <span className="block not-italic font-heading font-normal text-gold">
              in the Heart of French Polynesia
            </span>
          </h1>

          <p className="mt-8 max-w-2xl font-sans text-body-md text-pearl/80 sm:text-body-lg">
            A private beachfront villa where the Pacific unfolds at your doorstep — a heated
            infinity pool, Moorea on the horizon, and a concierge curating every detail of
            your week in paradise.
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button asChild variant="primary" size="lg">
              <Link href={bookingHref}>Check Availability</Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href="/villa">Discover the Villa</Link>
            </Button>
          </div>
        </div>

        {/* Trust strip — discreet social proof, bottom of hero */}
        <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-pearl/20 pt-8 text-pearl/85">
          <div className="flex items-center gap-2">
            <div className="flex" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" />
              ))}
            </div>
            <span className="font-sans text-body-sm font-semibold">4.9</span>
            <span className="font-sans text-body-sm text-pearl/65">on Airbnb</span>
          </div>
          <span className="hidden h-4 w-px bg-pearl/20 sm:block" aria-hidden="true" />
          <span className="font-sans text-body-sm">100+ Verified Reviews</span>
          <span className="hidden h-4 w-px bg-pearl/20 sm:block" aria-hidden="true" />
          <span className="font-sans text-body-sm">Punaauia, Tahiti</span>
        </div>
      </Container>
    </section>
  )
}
