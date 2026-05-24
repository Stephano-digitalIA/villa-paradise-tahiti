import { Container, Section } from '@/components/ui'

/**
 * ContactStats — trust signals below the contact form.
 *
 * Three metric tiles framed in the sand tone for visual contrast with
 * the pearl backdrop of the form. Stats are static and chosen from
 * docs/03-cible-marche-us.md (response time, satisfaction, secure pay).
 */

interface Stat {
  value: string
  label: string
  description: string
}

const STATS: readonly Stat[] = [
  {
    value: '4 hours',
    label: 'Average reply time',
    description:
      'Real humans, real fast. Our concierge replies within four hours during Tahiti daylight.',
  },
  {
    value: '98%',
    label: 'Guest satisfaction',
    description:
      'Based on 47+ verified post-stay reviews across direct, Airbnb, and Vrbo channels.',
  },
  {
    value: '100%',
    label: 'Secure payments',
    description:
      'Stripe and PayPal protected. We never store your card details on our servers.',
  },
] as const

export function ContactStats() {
  return (
    <Section tone="sand" spacing="compact">
      <Container>
        <div className="grid gap-6 md:grid-cols-3">
          {STATS.map((stat) => (
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
