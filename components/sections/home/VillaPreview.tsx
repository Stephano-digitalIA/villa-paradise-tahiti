import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BedDouble, Bath, Users, Maximize } from 'lucide-react'

import { Container, Section } from '@/components/ui'
import { sanityFetch } from '@/lib/sanity/fetcher'
import { villaQuery, type Villa } from '@/lib/sanity'

/**
 * Villa preview section — Homepage.
 *
 * Editorial 2-column block (image + text on desktop, stacked on mobile).
 * Pulls the villa name, tagline and headline stats from Sanity, then
 * sends the visitor to `/villa` for the full deep-dive.
 *
 * Server component — `await sanityFetch` resolves at render time.
 */
export async function VillaPreview() {
  const villa = await sanityFetch<Villa | null>(villaQuery)
  if (!villa) return null

  const heroUrl =
    villa.gallery?.find((g) => g.category === 'pool')?.url ??
    villa.heroImage.url ??
    ''

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
      label: 'Sleeps',
      value: `Up to ${villa.specs.maxGuests}`,
    },
    {
      Icon: Maximize,
      label: 'Size',
      value: villa.specs.sizeSqm ? `${villa.specs.sizeSqm} m²` : '—',
    },
  ]

  return (
    <Section tone="sand" spacing="default">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-card sm:aspect-[3/4] lg:order-2 lg:aspect-[4/5]">
            <Image
              src={heroUrl}
              alt={`${villa.name} — infinity pool overlooking the lagoon`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority={false}
            />
          </div>

          {/* Text */}
          <div className="lg:order-1">
            <p className="eyebrow mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              The Villa
            </p>
            <h2 className="font-display text-hero-sm font-light italic leading-tight text-midnight sm:text-hero-md">
              A sanctuary of calm
              <span className="block font-heading not-italic">and quiet luxury.</span>
            </h2>

            <p className="mt-6 max-w-prose font-sans text-body-lg text-midnight-400">
              {villa.tagline}
            </p>
            <p className="mt-4 max-w-prose font-sans text-body-md text-midnight-400">
              Set behind a discreet garden wall on the Punaauia coast, Villa Paradise opens
              onto a private terrace, a heated infinity pool and direct access to the
              turquoise lagoon. Inside, four light-filled bedrooms wrap around an open-plan
              living space dressed in pale wood, woven rattan and natural linen.
            </p>

            {/* Stats grid */}
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {stats.map(({ Icon, label, value }) => (
                <div key={label} className="flex flex-col gap-1">
                  <Icon
                    className="h-5 w-5 text-gold"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <dd className="font-heading text-h3-luxe font-medium text-midnight">
                    {value}
                  </dd>
                  <dt className="font-sans text-eyebrow text-midnight-400">{label}</dt>
                </div>
              ))}
            </dl>

            <div className="mt-10">
              <Link
                href="/villa"
                className="group inline-flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-luxe text-midnight transition-colors hover:text-gold"
              >
                Discover the Villa
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
