import { Check } from 'lucide-react'

import { Container, Section } from '@/components/ui'
import type { Villa } from '@/lib/sanity'

interface AmenitiesProps {
  villa: Villa
}

/**
 * Amenities section — full list grouped into Indoor / Outdoor / Services.
 *
 * The Sanity schema currently stores amenities as a flat string array. We
 * derive the group of each entry from a curated keyword map; unmatched
 * entries fall into "Services" so nothing is lost when the list grows.
 */

type Group = 'indoor' | 'outdoor' | 'services'

const groupRules: Array<{ group: Group; keywords: string[] }> = [
  {
    group: 'outdoor',
    keywords: [
      'pool',
      'garden',
      'terrace',
      'beach',
      'lagoon',
      'kayak',
      'snorkel',
      'parking',
      'outdoor',
      'fare',
      'bbq',
    ],
  },
  {
    group: 'indoor',
    keywords: [
      'wi-fi',
      'wifi',
      'air conditioning',
      'ac',
      'kitchen',
      'tv',
      'streaming',
      'bedroom',
      'bathroom',
      'linen',
      'living',
      'sound',
      'coffee',
      'speaker',
    ],
  },
]

function classify(amenity: string): Group {
  const lower = amenity.toLowerCase()
  for (const rule of groupRules) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.group
  }
  return 'services'
}

const groupLabels: Record<Group, { title: string; eyebrow: string }> = {
  indoor: { title: 'Inside the Villa', eyebrow: 'Indoor' },
  outdoor: { title: 'Outdoor & Lagoon', eyebrow: 'Outdoor' },
  services: { title: 'Services & Extras', eyebrow: 'Concierge' },
}

export function Amenities({ villa }: AmenitiesProps) {
  if (!villa.amenities || villa.amenities.length === 0) return null

  const groups: Record<Group, string[]> = { indoor: [], outdoor: [], services: [] }
  for (const amenity of villa.amenities) {
    groups[classify(amenity)].push(amenity)
  }

  return (
    <Section tone="pearl" spacing="default">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Amenities
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h2 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
            Everything has been thought out in every detail to make your stay as enjoyable as possible
          </h2>
          <p className="mt-6 font-sans text-body-md text-midnight-400 sm:text-body-lg">
            From the welcome basket to the high-speed Wi-Fi, here is what is included with your stay at this villa.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-10">
          {(Object.keys(groups) as Group[]).map((group) => {
            const items = groups[group]
            if (items.length === 0) return null
            return (
              <div key={group}>
                <p className="text-eyebrow font-medium uppercase tracking-widest2 text-gold">
                  {groupLabels[group].eyebrow}
                </p>
                <h3 className="mt-2 font-heading text-h3-luxe font-medium text-midnight">
                  {groupLabels[group].title}
                </h3>
                <ul className="mt-6 flex flex-col gap-3">
                  {items.map((amenity) => (
                    <li
                      key={amenity}
                      className="flex items-start gap-3 font-sans text-body-md text-midnight-400"
                    >
                      <Check
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
