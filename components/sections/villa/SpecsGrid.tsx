import {
  Bath,
  BedDouble,
  Maximize,
  Snowflake,
  Users,
  Waves,
} from 'lucide-react'

import { Container, Section } from '@/components/ui'
import type { Villa } from '@/lib/sanity'

interface SpecsGridProps {
  villa: Villa
}

/**
 * Villa specs grid — six headline stats in a clean, scannable layout.
 *
 * Designed to be the answer to the questions every shortlist visitor asks
 * in the first 10 seconds: how big, how many, what is included.
 */
export function SpecsGrid({ villa }: SpecsGridProps) {
  const stats: Array<{ Icon: typeof BedDouble; label: string; value: string }> = [
    {
      Icon: BedDouble,
      label: 'Bedrooms',
      value: String(villa.specs.bedrooms),
    },
    {
      Icon: Bath,
      label: 'Bathrooms',
      value: String(villa.specs.bathrooms),
    },
    {
      Icon: Users,
      label: 'Max guests',
      value: String(villa.specs.maxGuests),
    },
    {
      Icon: Maximize,
      label: 'Living area',
      value: villa.specs.sizeSqm
        ? `${villa.specs.sizeSqm} m² · ${villa.specs.sizeSqft ?? Math.round(villa.specs.sizeSqm * 10.76)} sq ft`
        : '—',
    },
    {
      Icon: Waves,
      label: 'Pool',
      value: villa.specs.hasPool ? 'Heated infinity' : '—',
    },
    {
      Icon: Snowflake,
      label: 'Climate',
      value: villa.specs.hasAC ? 'A/C throughout' : 'Cross-breeze only',
    },
  ]

  return (
    <Section tone="sand" spacing="compact">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            At a glance
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h2 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
            The essentials
          </h2>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-8">
          {stats.map(({ Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-start gap-2 border-t border-pearl-500/40 pt-6"
            >
              <Icon
                className="h-6 w-6 text-gold"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <dd className="font-heading text-h3-luxe font-medium leading-tight text-midnight">
                {value}
              </dd>
              <dt className="font-sans text-eyebrow uppercase tracking-widest2 text-midnight-400">
                {label}
              </dt>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  )
}
