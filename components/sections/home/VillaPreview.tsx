import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BedDouble, Bath, Users, Maximize } from 'lucide-react'

import { Container, Section } from '@/components/ui'
import { sanityFetch } from '@/lib/sanity/fetcher'
import { villaQuery, type Villa } from '@/lib/sanity'
import { getSiteContent } from '@/lib/content'

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

  const t = await getSiteContent()

  const heroUrl =
    villa.gallery?.find((g) => g.category === 'pool')?.url ??
    villa.heroImage.url ??
    ''

  const stats: Array<{
    id: string
    Icon: typeof BedDouble
    label: string
    value: string
    noTranslate?: boolean
  }> = [
    {
      id: 'bedrooms',
      Icon: BedDouble,
      label: t('home.villa.stat_bedrooms', 'Bedrooms'),
      value: String(villa.specs.bedrooms),
    },
    {
      id: 'bathrooms',
      Icon: Bath,
      label: t('home.villa.stat_bathrooms', 'Bathrooms'),
      value: String(villa.specs.bathrooms),
    },
    {
      id: 'guests',
      Icon: Users,
      label: t('home.villa.stat_guests', 'Guests'),
      value: `Up to ${villa.specs.maxGuests}`,
    },
    {
      id: 'size',
      Icon: Maximize,
      label: t('home.villa.stat_size', 'Size'),
      noTranslate: true,
      value:
        villa.specs.sizeSqm && villa.specs.sizeSqft
          ? `${villa.specs.sizeSqm} m² · ${villa.specs.sizeSqft} sq ft`
          : villa.specs.sizeSqm
            ? `${villa.specs.sizeSqm} m²`
            : villa.specs.sizeSqft
              ? `${villa.specs.sizeSqft} sq ft`
              : '—',
    },
  ]

  return (
    <Section tone="sand" spacing="default" className="mx-4 !w-auto rounded-3xl lg:mx-8">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          {/* Text */}
          <div>
            <p className="eyebrow mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              {t('home.villa.eyebrow', 'The Villa')}
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
            </p>
            <h2 className="font-display text-hero-sm font-light italic leading-tight text-midnight sm:text-hero-md">
              {t('home.villa.title1', 'A sanctuary of calm')}
              <span className="block font-heading not-italic">
                {t('home.villa.title2', 'and quiet luxury.')}
              </span>
            </h2>

            <p className="mt-6 font-sans text-body-lg text-midnight-400">
              {villa.tagline}
            </p>
            <p className="mt-4 font-sans text-body-md text-midnight-400">
              {t(
                'home.villa.description',
                'Villa Paradise opens onto a private terrace and a heated infinity pool with a jacuzzi, overlooking a turquoise lagoon. Inside, four air-conditioned sun-drenched bedrooms are arranged around a vast open living space, dressed in fine exotic light wood.',
              )}
            </p>

            {/* Stats grid */}
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {stats.map(({ id, Icon, label, value, noTranslate }) => (
                <div key={id} className="flex flex-col items-center gap-1">
                  <Icon
                    className="h-5 w-5 text-gold"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <dd
                    className={`font-heading text-h3-luxe font-medium text-midnight${
                      noTranslate ? ' notranslate' : ''
                    }`}
                    translate={noTranslate ? 'no' : undefined}
                  >
                    {value}
                  </dd>
                  <dt className="font-sans text-eyebrow text-midnight-400">{label}</dt>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex justify-center">
              <Link
                href="/villa"
                className="group inline-flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-luxe text-midnight transition-colors hover:text-gold"
              >
                {t('home.villa.cta', 'Discover the Villa')}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          {/* Image — centered below text */}
          <div className="relative mt-12 aspect-[4/3] overflow-hidden rounded-2xl shadow-card">
            <Image
              src={heroUrl}
              alt={`${villa.name} — infinity pool overlooking the lagoon`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority={false}
            />
          </div>
        </div>
      </Container>
    </Section>
  )
}
