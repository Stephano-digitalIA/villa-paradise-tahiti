import { Home, Waves, Mountain, Car } from 'lucide-react'

import { Container, Section } from '@/components/ui'

interface Feature {
  Icon: typeof Home
  title: string
  body: string
}

const features: Feature[] = [
  {
    Icon: Home,
    title: 'Private Villa',
    body:
      'The entire 4-bedroom estate is yours — no shared spaces, no front desk, no resort crowds.',
  },
  {
    Icon: Waves,
    title: 'Heated Infinity Pool',
    body:
      'A 12-meter pool flush with the lagoon, heated year-round and lit at night for evening swims.',
  },
  {
    Icon: Mountain,
    title: 'Moorea on the Horizon',
    body:
      'Direct lagoon frontage with uninterrupted views of Moorea — the most photographed sunset in Polynesia.',
  },
  {
    Icon: Car,
    title: 'Car Included',
    body:
      'A private vehicle is included throughout your stay so you can explore Tahiti at your own pace.',
  },
]

interface KeyFeaturesProps {
  /** Render with transparent background and light colours for use over the hero video */
  onVideo?: boolean
}

export function KeyFeatures({ onVideo = false }: KeyFeaturesProps) {
  if (onVideo) {
    return (
      <div className="w-full py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 flex items-center justify-center gap-3 font-sans text-eyebrow font-medium uppercase tracking-widest2 text-gold">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              Why Villa Paradise
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
            </p>
            <h2 className="font-heading text-h2-luxe font-medium leading-tight text-pearl">
              Four reasons travelers choose us over the resort
            </h2>
          </div>

          <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {features.map(({ Icon, title, body }) => (
              <li
                key={title}
                className="group flex flex-col items-start gap-4 border-t border-pearl/25 pt-8 transition-colors duration-300 hover:border-gold"
              >
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-midnight/50 text-gold backdrop-blur-sm"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <h3 className="font-heading text-h3-luxe font-medium text-pearl">
                  {title}
                </h3>
                <p className="font-sans text-body-md text-pearl/75">{body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    )
  }

  return (
    <Section tone="pearl" spacing="default">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Why Villa Paradise
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h2 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
            Four reasons travelers choose us over the resort
          </h2>
        </div>

        <ul className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {features.map(({ Icon, title, body }) => (
            <li
              key={title}
              className="group flex flex-col items-center gap-4 border-t border-pearl-400 pt-8 text-center transition-colors duration-300 hover:border-gold"
            >
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sand text-gold-700"
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
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
