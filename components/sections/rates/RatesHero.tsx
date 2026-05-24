import { Container, Section } from '@/components/ui'

/**
 * RatesHero — landing intro for /rates.
 * Positions us as direct & transparent before we surface the price grid.
 */
export function RatesHero() {
  return (
    <Section tone="pearl" spacing="default">
      <Container className="pt-24">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Rates &amp; Availability
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>

          <h1 className="font-display text-hero-sm font-light italic leading-[1.02] text-midnight sm:text-hero-md">
            Transparent pricing,
            <span className="block not-italic font-heading font-normal text-gold">
              year-round magic.
            </span>
          </h1>

          <p className="mt-8 max-w-prose font-sans text-body-md text-midnight-400 sm:text-body-lg">
            One villa, three seasons, zero surprises. The rates below are
            our published direct rates — always lower than what you&apos;ll
            find on Airbnb, VRBO or any aggregator. No service fees, no
            commissions stacked on top.
          </p>
        </div>
      </Container>
    </Section>
  )
}
