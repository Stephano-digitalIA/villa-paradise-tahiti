import { MapPin, Plane, Utensils, Waves } from 'lucide-react'

import { Container, Section } from '@/components/ui'
import type { Villa } from '@/lib/sanity'

interface LocationProps {
  villa: Villa
}

/**
 * Villa location section.
 *
 * Renders a stylized map placeholder (no live Google Maps to keep the
 * homepage lean — Phase D will wire it up) plus the contextual answers
 * every American visitor asks: distance to airport, to Papeete, to the
 * nearest beach.
 */
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
      value: '20 min by car',
    },
    {
      Icon: Waves,
      label: 'Lagoon access',
      value: 'Steps from the villa',
    },
    {
      Icon: Utensils,
      label: 'Restaurants & shops',
      value: '5 min by car',
    },
  ]

  return (
    <Section tone="midnight" spacing="default">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Map placeholder */}
          <div
            className="relative isolate aspect-[4/3] overflow-hidden rounded-2xl border border-pearl/10 bg-midnight-700"
            aria-label="Map placeholder — Punaauia, Tahiti"
          >
            {/* Decorative grid */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(250,250,248,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(250,250,248,0.06) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
              aria-hidden="true"
            />
            {/* Soft glow centered on pin */}
            <div
              className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-pearl">
              <MapPin
                className="mb-4 h-10 w-10 text-gold"
                strokeWidth={1.25}
                aria-hidden="true"
              />
              <p className="font-display text-h3-luxe italic text-pearl">
                {location?.city ?? 'Punaauia, Tahiti'}
              </p>
              <p className="mt-2 font-sans text-body-sm text-pearl/65">
                {location?.country ?? 'French Polynesia'} · 17.64°S · 149.60°W
              </p>
              <p className="mt-6 font-sans text-eyebrow uppercase tracking-widest2 text-gold/80">
                Interactive map coming soon
              </p>
            </div>
          </div>

          {/* Copy + distances */}
          <div>
            <p className="mb-4 flex items-center gap-3 font-sans text-eyebrow font-medium uppercase tracking-widest2 text-gold">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              The Setting
            </p>
            <h2 className="font-heading text-h2-luxe font-medium leading-tight text-pearl">
              On the quiet stretch of coast travelers come for
            </h2>
            <p className="mt-6 max-w-prose font-sans text-body-md text-pearl/80 sm:text-body-lg">
              Punaauia is the west-coast suburb of Papeete where locals build their family
              homes — a postcard shoreline of black-sand beaches and turquoise lagoon,
              twenty-five minutes from the airport and a world away from the busy capital.
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
