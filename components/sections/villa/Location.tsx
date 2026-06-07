import { MapPin, Plane, Utensils, Waves } from 'lucide-react'

import { Container, Section } from '@/components/ui'
import type { Villa } from '@/lib/sanity'

interface LocationProps {
  villa: Villa
}

/**
 * Villa location section.
 *
 * Renders an interactive Google Maps satellite embed with a "View on Google
 * Maps" deep-link, plus the contextual answers every visitor asks: distance
 * to airport, to Papeete, to the nearest beach.
 */

// Google Maps satellite view link for the villa area.
const MAPS_PLACE_URL =
  'https://www.google.com/maps/@-17.6484313,-149.5851282,2465m/data=!3m1!1e3?entry=ttu&g_ep=EgoyMDI2MDYwMS4wIKXMDSoASAFQAw%3D%3D'
// Keyless interactive satellite embed (t=k) centered on the same coordinates.
const MAPS_EMBED_SRC =
  'https://maps.google.com/maps?q=-17.6484313,-149.5851282&t=k&z=16&hl=en&output=embed'

export function Location({ villa }: LocationProps) {
  const location = villa.location

  // Key distances — hand-curated for the Punaauia coast.
  const distances: Array<{ Icon: typeof Plane; label: string; value: string }> = [
    {
      Icon: Plane,
      label: 'Faaa International Airport (PPT)',
      value: '25 min by car',
    },
    {
      Icon: MapPin,
      label: 'Papeete city center',
      value: '30 min by car',
    },
    {
      Icon: Waves,
      label: 'Lagoon access',
      value: 'Steps from the villa',
    },
    {
      Icon: Utensils,
      label: 'Restaurants, shops & shopping centre',
      value: '5 min by car',
    },
  ]

  return (
    <Section tone="midnight" spacing="default">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Interactive map */}
          <div className="relative isolate aspect-[4/3] overflow-hidden rounded-2xl border border-pearl/10 bg-midnight-700">
            <iframe
              title={`Map — ${location?.city ?? 'Punaauia, Tahiti'}`}
              src={MAPS_EMBED_SRC}
              className="absolute inset-0 h-full w-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a
              href={MAPS_PLACE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-full bg-midnight/85 px-4 py-2 font-sans text-eyebrow uppercase tracking-widest2 text-pearl shadow-card backdrop-blur transition-colors hover:text-gold"
            >
              <MapPin className="h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
              View on Google Maps
            </a>
          </div>

          {/* Copy + distances */}
          <div>
            <p className="mb-4 flex items-center gap-3 font-sans text-eyebrow font-medium uppercase tracking-widest2 text-gold">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              The Setting
            </p>
            <h2 className="font-heading text-h2-luxe font-medium leading-tight text-pearl">
              On this quiet stretch of coastline, travelers come for...
            </h2>
            <p className="mt-6 max-w-prose font-sans text-body-md text-pearl/80 sm:text-body-lg">
              Punaauia, Tahiti's most prestigious neighbourhood — a postcard shoreline with white sandy beaches and a turquoise lagoon, twenty-five minutes from the airport and a world away from the hustle of the capital.
            </p>

            <ul className="mt-10 flex flex-col gap-5">
              {distances.map(({ Icon, label, value }) => (
                <li key={label} className="flex items-start gap-4">
                  <span
                    className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pearl/10 text-gold"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="font-heading text-body-lg text-pearl">{value}</p>
                    <p className="font-sans text-body-sm text-pearl/65">{label}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  )
}
