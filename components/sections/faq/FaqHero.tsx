import { Container, Section } from '@/components/ui'

/**
 * FaqHero — page intro.
 *
 * The search field used to sit here as a non-functional placeholder. It now
 * lives in `FaqSearchableGroups`, directly above the list it filters, since
 * the two need to share state. This component stays a server component.
 */
export function FaqHero() {
  return (
    <Section tone="pearl" spacing="default">
      <Container className="pt-24">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            FAQ
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>

          <h1 className="font-display text-hero-sm font-light italic leading-[1.02] text-midnight sm:text-hero-md">
            Frequently asked
            <span className="block not-italic font-heading font-normal text-gold">
              questions
            </span>
          </h1>

          <p className="mt-8 max-w-prose font-sans text-body-md text-midnight-400 sm:text-body-lg">
            Everything we&apos;ve been asked in the past three years, sorted
            by topic. If your question isn&apos;t here, send us a note —
            we reply within the hour during Tahiti daylight.
          </p>

        </div>
      </Container>
    </Section>
  )
}
