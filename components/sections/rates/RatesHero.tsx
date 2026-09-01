import { Container, Section } from '@/components/ui'
import { getSiteContent } from '@/lib/content'

/**
 * RatesHero — landing intro for /rates.
 * Positions us as direct & transparent before we surface the price grid.
 *
 * Copy is overridable from /admin/content/rates; the strings below are the
 * published defaults and must mirror `RATES_CONTENT_DEFAULTS`.
 */
export async function RatesHero() {
  const t = await getSiteContent()

  return (
    <Section tone="pearl" spacing="default">
      <Container className="pt-24">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            {t('rates.hero.eyebrow', 'Rates & Availability')}
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>

          <h1 className="font-display text-hero-sm font-light italic leading-[1.02] text-midnight sm:text-hero-md">
            {t('rates.hero.title1', 'Transparent pricing,')}
            <span className="block not-italic font-heading font-normal text-gold">
              {t('rates.hero.title2', 'year-round magic.')}
            </span>
          </h1>

          <p className="mt-8 max-w-prose font-sans text-body-md text-midnight-400 sm:text-body-lg">
            {t(
              'rates.hero.subtitle',
              'One villa, three seasons, zero surprises. The rates below are our published direct rates: always lower than what you will find on Airbnb, VRBO or any aggregator. No service fees, no commissions stacked on top.',
            )}
          </p>
        </div>
      </Container>
    </Section>
  )
}
