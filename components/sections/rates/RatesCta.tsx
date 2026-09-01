import Link from 'next/link'
import { ArrowRight, Calculator } from 'lucide-react'

import { Button, Container, Section } from '@/components/ui'
import { bookingHref } from '@/lib/navigation'
import { getSiteContent } from '@/lib/content'

/**
 * RatesCta — closing block on /rates.
 *
 * Hints at the upcoming Phase D calculator with a "Calculate my stay"
 * primary CTA that currently points at the booking route. Once the
 * calculator ships we'll just swap the href.
 *
 * Copy is overridable from /admin/content/rates; the strings below are the
 * published defaults and must mirror `RATES_CONTENT_DEFAULTS`.
 */
export async function RatesCta() {
  const t = await getSiteContent()

  return (
    <Section tone="midnight" spacing="default">
      <Container className="text-center">
        <span className="mx-auto mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold">
          <Calculator className="h-5 w-5" aria-hidden="true" />
        </span>

        <p className="eyebrow mb-4 text-gold">{t('rates.cta.eyebrow', 'Plan your stay')}</p>
        <h2 className="mx-auto max-w-3xl font-display text-hero-sm font-light italic leading-[1.05] text-pearl sm:text-h1-luxe">
          {t('rates.cta.title1', 'See your total')}
          <span className="block not-italic font-heading font-normal text-gold">
            {t('rates.cta.title2', 'for any dates')}
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-prose font-sans text-body-md text-pearl/70">
          {t(
            'rates.cta.subtitle',
            'Pick your check-in, your party size and the experiences you would like. We will show the exact total, in USD, with no hidden fees.',
          )}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild variant="primary" size="lg">
            <Link href={bookingHref}>
              {t('rates.cta.primary', 'Calculate my stay')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline-light" size="lg">
            <Link href="/contact">
              {t('rates.cta.secondary', 'Ask about availability')}
            </Link>
          </Button>
        </div>

        <p className="mt-8 font-sans text-caption text-pearl/60">
          {t(
            'rates.cta.trust',
            'Best-rate guarantee · 100% refund if cancelled more than 60 days ahead · Secure payment via PayPal',
          )}
        </p>
      </Container>
    </Section>
  )
}
