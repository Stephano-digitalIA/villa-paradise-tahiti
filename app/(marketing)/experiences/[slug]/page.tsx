import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Check, Clock, MapPin, Users } from 'lucide-react'

import { Badge, Button, Card, Container, Section } from '@/components/ui'
import { ExperienceCard } from '@/components/sections/experiences/ExperienceCard'
import { PortableTextRenderer } from '@/components/sections/_shared/PortableTextRenderer'
import {
  JsonLd,
  breadcrumbSchema,
  productSchema,
} from '@/components/seo'
import { bookingHref } from '@/lib/navigation'
import { SITE_URL, absoluteUrl, buildMetadata } from '@/lib/seo'
import { sanityFetch } from '@/lib/sanity/fetcher'
import {
  experienceBySlugQuery,
  experiencesQuery,
  urlForImage,
  type Experience,
} from '@/lib/sanity'

/**
 * /experiences/[slug] — Detail page for a single curated experience.
 *
 *  - Statically generated for every active experience via
 *    `generateStaticParams` so prod pages serve from the edge.
 *  - SEO metadata pulls from Sanity `seo.metaTitle/metaDescription`
 *    if defined, otherwise falls back to the experience title/short
 *    description.
 *  - Renders the long-form description via `PortableTextRenderer` (ReactMarkdown).
 *  - Includes a hand-rolled "What's included" list — falls back to
 *    `highlights[]` when present, otherwise a sensible luxe default.
 *  - "Related experiences" pulls up to 3 active experiences in the
 *    same category, excluding the current one.
 *  - CTA points to `/booking?experience=[slug]` so the future booking
 *    page can pre-fill the selection.
 */

interface RouteParams {
  params: { slug: string }
}

/* ─── Static generation ──────────────────────────────────────────────── */

export async function generateStaticParams() {
  const experiences = await sanityFetch<Experience[]>(experiencesQuery)
  return (experiences ?? []).map((e) => ({ slug: e.slug.current }))
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const experience = await sanityFetch<Experience | null>(experienceBySlugQuery, {
    slug: params.slug,
  })

  if (!experience) {
    return buildMetadata({
      title: 'Experience not found — Villa Paradise Tahiti',
      description:
        'The experience you are looking for is not available. Browse our other curated Tahiti experiences.',
      path: `/experiences/${params.slug}`,
      noIndex: true,
    })
  }

  const fallbackTitle = `${experience.title} — Villa Paradise Tahiti`
  const ogImage = experience.seo?.ogImage
    ? urlForImage(experience.seo.ogImage).width(1200).height(630).fit('crop').url()
    : urlForImage(experience.coverImage).width(1200).height(630).fit('crop').url()

  return buildMetadata({
    title: experience.seo?.metaTitle ?? fallbackTitle,
    description: experience.seo?.metaDescription ?? experience.shortDescription,
    path: `/experiences/${experience.slug.current}`,
    image: ogImage,
    imageAlt: experience.coverImage.alt ?? experience.title,
  })
}

/* ─── Category labels ────────────────────────────────────────────────── */

const categoryLabels: Record<Experience['category'], string> = {
  excursion: 'Excursion',
  evening: 'Evening',
  dining: 'Dining',
  wellness: 'Wellness',
  cultural: 'Cultural',
  adventure: 'Adventure',
}

/* ─── Default "what's included" copy ─────────────────────────────────── */

const DEFAULT_INCLUSIONS = [
  'Hand-picked, vetted local operator',
  'English-speaking guide',
  'All taxes and gratuities',
  'Flexible cancellation up to 48 h',
]

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatPrice(experience: Experience): string {
  const usd = experience.priceUSD
  switch (experience.priceUnit) {
    case 'flat':
      return `$${usd}`
    case 'per_group':
      return `$${usd} / group`
    case 'per_person':
    default:
      return `$${usd} / person`
  }
}

function formatSeason(experience: Experience): string | null {
  if (!experience.seasonal) return null
  if (experience.seasonStart && experience.seasonEnd) {
    const start = new Date(experience.seasonStart)
    const end = new Date(experience.seasonEnd)
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' })
    return `${fmt(start)} – ${fmt(end)}`
  }
  return 'Seasonal'
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default async function ExperienceDetailPage({ params }: RouteParams) {
  const experience = await sanityFetch<Experience | null>(experienceBySlugQuery, {
    slug: params.slug,
  })

  if (!experience) {
    notFound()
  }

  const coverUrl = urlForImage(experience.coverImage).url()
  const season = formatSeason(experience)

  // Fetch related experiences (same category, exclude current, limit 3).
  const allExperiences = await sanityFetch<Experience[]>(experiencesQuery)
  const relatedExperiences = (allExperiences ?? [])
    .filter((e) => e.category === experience.category && e._id !== experience._id)
    .slice(0, 3)

  const inclusions = experience.highlights?.length
    ? experience.highlights
    : DEFAULT_INCLUSIONS

  return (
    <>
      <JsonLd data={productSchema(experience)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Experiences', url: absoluteUrl('/experiences') },
          {
            name: experience.title,
            url: absoluteUrl(`/experiences/${experience.slug.current}`),
          },
        ])}
      />
      {/* ─── Hero — fullwidth cover image ────────────────────────────── */}
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-midnight">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={experience.coverImage.alt ?? experience.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/55 via-transparent to-transparent" aria-hidden="true" />
        <Container className="relative z-10 flex h-full flex-col justify-end pb-12 sm:pb-16">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge variant="luxe" size="md">
                {categoryLabels[experience.category]}
              </Badge>
              {experience.featured ? (
                <Badge variant="gold" size="md">
                  Featured
                </Badge>
              ) : null}
              {season ? (
                <span className="rounded-full bg-pearl/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider2 text-pearl backdrop-blur">
                  {season}
                </span>
              ) : null}
            </div>
            <h1 className="font-display text-hero-sm font-light italic leading-tight text-pearl sm:text-hero-md">
              {experience.title}
            </h1>
            <p className="mt-4 max-w-2xl font-sans text-body-md text-pearl/80 sm:text-body-lg">
              {experience.shortDescription}
            </p>
          </div>
        </Container>
      </section>

      {/* ─── Body — description + side specs ─────────────────────────── */}
      <Section tone="pearl" spacing="default">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
            {/* Description */}
            <div className="lg:col-span-2">
              <p className="eyebrow mb-4">About this experience</p>
              <PortableTextRenderer value={experience.description} prose={true} />

              {/* What's included */}
              <div className="mt-12 rounded-2xl border border-pearl-400 bg-sand-50 p-6 sm:p-8">
                <p className="eyebrow mb-5">What's Included</p>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {inclusions.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 font-sans text-body-sm text-midnight"
                    >
                      <Check
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Side specs card */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Card tone="pearl" elevation="card" className="overflow-hidden">
                <div className="border-b border-pearl-400 bg-midnight px-6 py-5 text-center">
                  <p className="text-eyebrow tracking-wider2 text-pearl/60">From</p>
                  <p className="mt-1 font-heading text-h2-luxe font-medium text-gold">
                    {formatPrice(experience)}
                  </p>
                </div>
                <dl className="divide-y divide-pearl-400 px-6 py-2">
                  <SpecRow icon={<Clock className="h-4 w-4" aria-hidden="true" />} label="Duration">
                    {experience.duration}
                  </SpecRow>
                  {experience.minGuests || experience.maxGuests ? (
                    <SpecRow icon={<Users className="h-4 w-4" aria-hidden="true" />} label="Guests">
                      {experience.minGuests && experience.maxGuests
                        ? `${experience.minGuests}–${experience.maxGuests} guests`
                        : experience.maxGuests
                          ? `Up to ${experience.maxGuests}`
                          : `From ${experience.minGuests}`}
                    </SpecRow>
                  ) : null}
                  {experience.meetingPoint ? (
                    <SpecRow icon={<MapPin className="h-4 w-4" aria-hidden="true" />} label="Meeting point">
                      {experience.meetingPoint}
                    </SpecRow>
                  ) : null}
                  {season ? (
                    <SpecRow icon={<Calendar className="h-4 w-4" aria-hidden="true" />} label="Season">
                      {season}
                    </SpecRow>
                  ) : null}
                </dl>
                <div className="px-6 pb-6 pt-4">
                  <Button variant="primary" size="lg" className="w-full" asChild>
                    <Link href={`${bookingHref}?experience=${experience.slug.current}`}>
                      Add to your stay
                    </Link>
                  </Button>
                  <p className="mt-3 text-center font-sans text-xs text-midnight-400">
                    Pay 30% deposit · We confirm within 1 h
                  </p>
                </div>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>

      {/* ─── Related experiences ────────────────────────────────────── */}
      {relatedExperiences.length > 0 ? (
        <Section tone="sand" spacing="default">
          <Container>
            <div className="mb-10 text-center">
              <p className="eyebrow mb-4 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-gold" aria-hidden="true" />
                More like this
                <span className="h-px w-8 bg-gold" aria-hidden="true" />
              </p>
              <h2 className="font-display text-h2-luxe font-light italic text-midnight">
                Other {categoryLabels[experience.category].toLowerCase()} experiences
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {relatedExperiences.map((related) => (
                <ExperienceCard key={related._id} experience={related} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* ─── Closing CTA ────────────────────────────────────────────── */}
      <Section tone="midnight" spacing="compact">
        <Container className="text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3 text-gold">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Ready when you are
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h2 className="font-display text-h2-luxe font-light italic text-pearl">
            Pair {experience.title} with your villa stay.
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="primary" size="lg" asChild>
              <Link href={`${bookingHref}?experience=${experience.slug.current}`}>
                Add to your stay
              </Link>
            </Button>
            <Button variant="outline-light" size="lg" asChild>
              <Link href="/experiences">Browse all experiences</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}

/* ─── Small subcomponent ─────────────────────────────────────────────── */

function SpecRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <dt className="flex items-center gap-2 font-sans text-body-sm text-midnight-400">
        <span className="text-gold">{icon}</span>
        {label}
      </dt>
      <dd className="text-right font-sans text-body-sm font-medium text-midnight">
        {children}
      </dd>
    </div>
  )
}
