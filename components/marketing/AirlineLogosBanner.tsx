import Image from 'next/image'

import { Container, Section } from '@/components/ui'

interface Airline {
  /** Official carrier name shown as alt text and visible tooltip. */
  name: string
  /** File at /public/logos/airlines/{slug}.svg (or .png). */
  slug: string
  /** Intrinsic logo dimensions — used by next/image for layout shift. */
  width: number
  height: number
  /**
   * Optional Tailwind classes to override the default size for logos with
   * unusual aspect ratios. Air Tahiti Nui's mark is near-square, so a
   * uniform max-height makes it look tiny next to horizontal wordmarks.
   */
  sizeClass?: string
}

/**
 * Carriers operating or codesharing LAX/SFO/SEA/CDG/AKL/HND → PPT as of
 * 2026. Air France no longer flies CDG–PPT direct but still sells the
 * route under codeshare with Air Tahiti Nui — relevant for our French
 * audience.
 *
 * Drop the official SVG (preferred) or transparent-bg PNG into
 * /public/logos/airlines/{slug}.{svg,png}. Filenames must match the
 * `slug` values exactly.
 */
const DEFAULT_SIZE = 'max-h-10 sm:max-h-12'

const AIRLINES: ReadonlyArray<Airline> = [
  {
    name: 'Air Tahiti Nui',
    slug: 'air-tahiti-nui',
    width: 200,
    height: 130,
    // Square-ish logo — let it grow taller so it visually matches the
    // wordmark airlines next to it.
    sizeClass: 'max-h-16 sm:max-h-20',
  },
  { name: 'French Bee', slug: 'french-bee', width: 200, height: 60 },
  { name: 'Air France', slug: 'air-france', width: 200, height: 60 },
  { name: 'United Airlines', slug: 'united-airlines', width: 200, height: 60 },
  { name: 'Delta Air Lines', slug: 'delta', width: 200, height: 60 },
] as const

/**
 * AirlineLogosBanner — discreet trust strip showing the carriers that
 * fly to Tahiti, displayed under the hero on /getting-here.
 *
 * Visual treatment: monochrome midnight tone with light-up on hover, so
 * the four logos read as a unified band rather than a colorful collage
 * that would clash with the luxe palette.
 */
export function AirlineLogosBanner() {
  return (
    <Section tone="pearl" spacing="tight">
      <Container>
        <p className="text-center font-sans text-xs font-semibold uppercase tracking-widest text-midnight-400">
          Carriers serving Tahiti (PPT)
        </p>

        <div className="mt-6 grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {AIRLINES.map((airline) => (
            <div
              key={airline.slug}
              className="flex h-20 items-center justify-center sm:h-24"
              title={airline.name}
            >
              <Image
                src={`/logos/airlines/${airline.slug}.svg`}
                alt={airline.name}
                width={airline.width}
                height={airline.height}
                className={`${airline.sizeClass ?? DEFAULT_SIZE} w-auto object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0`}
                sizes="(min-width: 640px) 200px, 50vw"
              />
            </div>
          ))}
        </div>

        <p className="mt-6 text-center font-sans text-xs italic text-midnight-300">
          Schedules vary by season — live availability appears in the
          flight search below.
        </p>
      </Container>
    </Section>
  )
}
