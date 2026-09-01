import { Container, Section } from '@/components/ui'
import { getSiteContent } from '@/lib/content'

/**
 * ContactStats — trust signals below the contact form.
 *
 * Three metric tiles framed in the sand tone for visual contrast with
 * the pearl backdrop of the form. Stats are static and chosen from
 * docs/03-cible-marche-us.md (response time, satisfaction, secure pay).
 *
 * Copy is overridable from /admin/content/contact; the strings below are the
 * published defaults and must mirror `CONTACT_CONTENT_DEFAULTS`. Emptying a
 * tile's label removes it, so the row can drop to two.
 */
export async function ContactStats() {
  const t = await getSiteContent()

  const stats = [
    {
      value: t('contact.stat.s1.value', '4 hours'),
      label: t('contact.stat.s1.label', 'Average reply time'),
      description: t(
        'contact.stat.s1.body',
        'Real humans, real fast. Our concierge replies within four hours during Tahiti daylight.',
      ),
    },
    {
      value: t('contact.stat.s2.value', '98%'),
      label: t('contact.stat.s2.label', 'Guest satisfaction'),
      description: t(
        'contact.stat.s2.body',
        'Based on 47+ verified post-stay reviews across direct, Airbnb, and Vrbo channels.',
      ),
    },
    {
      value: t('contact.stat.s3.value', '100%'),
      label: t('contact.stat.s3.label', 'Secure payments'),
      description: t(
        'contact.stat.s3.body',
        'PayPal protected. We never store your card details on our servers.',
      ),
    },
  ].filter((s) => s.label.trim() !== '')

  return (
    <Section tone="sand" spacing="compact">
      <Container>
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-sand-300 bg-pearl/60 p-6 sm:p-8 text-center"
            >
              <p className="font-display text-h1-luxe font-light italic text-gold">
                {stat.value}
              </p>
              <p className="mt-2 text-eyebrow font-semibold uppercase text-midnight">
                {stat.label}
              </p>
              <p className="mt-3 font-sans text-body-sm text-midnight-400">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
