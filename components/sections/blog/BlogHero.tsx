import { Container, Section } from '@/components/ui'

/**
 * BlogHero — editorial intro to /blog.
 * Quiet, centered, sets the "journal" tone before the post grid.
 */
export function BlogHero() {
  return (
    <Section tone="pearl" spacing="default">
      <Container className="pt-24">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Journal
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>

          <h1 className="font-display text-hero-sm font-light italic leading-[1.02] text-midnight sm:text-hero-md">
            Tahiti
            <span className="block not-italic font-heading font-normal text-gold">
              Inspirations
            </span>
          </h1>

          <p className="mt-8 max-w-prose font-sans text-body-md text-midnight-400 sm:text-body-lg">
            Field notes from our island — practical guides, local
            recommendations and the kind of insider tips you won&apos;t find
            on a hotel brochure. Written by people who actually live here.
          </p>
        </div>
      </Container>
    </Section>
  )
}
