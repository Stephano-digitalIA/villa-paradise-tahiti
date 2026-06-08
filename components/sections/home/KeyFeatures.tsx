import { Home, Waves, Mountain, Car } from 'lucide-react'

import { Container, Section } from '@/components/ui'
import { getSiteContent } from '@/lib/content'

interface Feature {
  Icon: typeof Home
  title: string
  body: string
}

interface KeyFeaturesProps {
  /** Render with transparent background and light colours for use over the hero video */
  onVideo?: boolean
}

export async function KeyFeatures({ onVideo = false }: KeyFeaturesProps) {
  const t = await getSiteContent()
  const eyebrow = t('home.features.eyebrow', 'Why Villa Paradise')
  const title = t('home.features.title', 'Four reasons travelers choose us over the resort')
  const features: Feature[] = [
    {
      Icon: Home,
      title: t('home.features.f1.title', 'Private Villa'),
      body: t(
        'home.features.f1.body',
        'The entire 4-bedroom,air conditioned property is at your disposal — a completely private retreat, with no overlooking neighbors...',
      ),
    },
    {
      Icon: Waves,
      title: t('home.features.f2.title', 'Heated Infinity Pool'),
      body: t(
        'home.features.f2.body',
        'A infinity pool that blends harmoniously into the lagoon, heated year-round and illuminated at night for evening swims.',
      ),
    },
    {
      Icon: Mountain,
      title: t('home.features.f3.title', 'Moorea on the Horizon'),
      body: t(
        'home.features.f3.body',
        'Panoramic views and an unobstructed view of Moorea — the most photographed sunset in Polynesia.',
      ),
    },
    {
      Icon: Car,
      title: t('home.features.f4.title', 'Car Included'),
      body: t(
        'home.features.f4.body',
        'A private vehicle is made available to you free of charge for the entire duration of your stay so you can explore Tahiti at your own pace.',
      ),
    },
  ]

  if (onVideo) {
    return (
      <div className="w-full py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 flex items-center justify-center gap-3 font-sans text-eyebrow font-medium uppercase tracking-widest2 text-gold">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              {eyebrow}
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
            </p>
            <h2 className="font-heading text-h2-luxe font-medium leading-tight text-pearl">
              {title}
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
            {title}
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
