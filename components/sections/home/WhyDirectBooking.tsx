import { BadgePercent, Heart, Sparkles } from 'lucide-react'

import { Container, Section } from '@/components/ui'

/**
 * Why Direct Booking — Homepage.
 *
 * Persuasion section: three reasons to book directly instead of via Airbnb.
 * Targets the cost-conscious "Luxury Escaper" and "Experience Family"
 * personas (see docs/03-cible-marche-us.md).
 */

interface Reason {
  Icon: typeof BadgePercent
  title: string
  body: string
}

const reasons: Reason[] = [
  {
    Icon: BadgePercent,
    title: 'Better Price, Same Villa',
    body:
      'Pay less by booking directly on our website.',
  },
  {
    Icon: Heart,
    title: 'Talk to the Owner',
    body:
      'No call centres. No anonymous platform messaging. You speak directly with the owner from your first question to the moment you hand back the keys — usually within the hour.',
  },
  {
    Icon: Sparkles,
    title: 'A Stay Tailored to You',
    body:
      'Welcome basket, private chef night, sunrise snorkel, kid-friendly excursions — every detail of your week is shaped around what your group actually wants to do.',
  },
]

export function WhyDirectBooking() {
  return (
    <Section tone="pearl" spacing="default">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Booking Direct
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h2 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
            Why our guests skip the online platforms
          </h2>
          <p className="mt-6 font-sans text-body-md text-midnight-400 sm:text-body-lg">
            The same villa, the same dates, a better experience for less. Here is what
            booking directly looks like for our guests.
          </p>
        </div>

        <ul className="mt-16 grid grid-cols-2 gap-8 lg:gap-10">
          {reasons.map(({ Icon, title, body }) => (
            <li
              key={title}
              className="relative flex flex-col gap-5 rounded-2xl border border-pearl-400 bg-pearl-100 p-8 shadow-soft transition-all duration-400 ease-luxe hover:-translate-y-1 hover:shadow-card sm:p-10"
            >
              <span
                className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold-700"
                aria-hidden="true"
              >
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <h3 className="font-heading text-h3-luxe font-medium text-midnight">
                {title}
              </h3>
              <p className="font-sans text-body-md text-midnight-400">{body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
