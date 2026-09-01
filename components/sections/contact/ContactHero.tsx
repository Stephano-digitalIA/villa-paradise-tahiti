import { Container, Section } from '@/components/ui'
import { getSiteContent } from '@/lib/content'

/**
 * ContactHero — compact eyebrow + display title hero for /contact.
 *
 * Server component, no interactivity. Visual cue is consistent with the
 * /villa hero used in Phase B3 (eyebrow with gold rule, display italic).
 *
 * Copy is overridable from /admin/content/contact; the strings below are the
 * published defaults and must mirror `CONTACT_CONTENT_DEFAULTS`.
 */
export async function ContactHero() {
  const t = await getSiteContent()

  return (
    <Section tone="pearl" spacing="compact">
      <Container className="max-w-3xl pt-16 text-center sm:pt-24">
        <p className="eyebrow mb-6 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gold" aria-hidden="true" />
          {t('contact.hero.eyebrow', 'Get in Touch')}
          <span className="h-px w-8 bg-gold" aria-hidden="true" />
        </p>
        <h1 className="font-display text-hero-sm font-light italic leading-[1.05] text-midnight sm:text-hero-md">
          {t('contact.hero.title', "We're Here to Help You Plan")}
        </h1>
        <p className="mx-auto mt-6 max-w-prose font-sans text-body-lg text-midnight-400">
          {t(
            'contact.hero.subtitle',
            'Questions, special requests, or ready to book? Our concierge team is on the islands and replies within four hours.',
          )}
        </p>
      </Container>
    </Section>
  )
}
