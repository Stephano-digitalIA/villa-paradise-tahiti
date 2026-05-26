import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { Button, Container, Section } from '@/components/ui'
import { sanityFetch } from '@/lib/sanity/fetcher'
import {
  featuredExperiencesQuery,
  type Experience,
} from '@/lib/sanity'

/**
 * Experiences teaser section — Homepage.
 *
 * Renders the top featured experiences from Sanity as a 3-up card grid.
 * Server component — fetches at render time, no hydration cost.
 */
export async function ExperiencesTeaser() {
  const experiences = await sanityFetch<Experience[]>(featuredExperiencesQuery)
  if (!experiences || experiences.length === 0) return null

  const featured = experiences.slice(0, 4)

  const priceLabel = (exp: Experience) => {
    const unit =
      exp.priceUnit === 'per_person'
        ? '/ person'
        : exp.priceUnit === 'per_group'
        ? '/ group'
        : ''
    return `From $${exp.priceUSD.toLocaleString('en-US')} ${unit}`.trim()
  }

  return (
    <Section tone="pearl" spacing="default">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Curated Experiences
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h2 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
            The moments your guests will still talk about a year from now
          </h2>
          <Link
            href="/experiences"
            className="group mt-4 inline-flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-luxe text-midnight transition-colors hover:text-gold"
          >
            Explore all
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-6 lg:gap-8">
          {featured.map((exp) => {
            const imageUrl = exp.coverImage.url ?? ''
            return (
              <li key={exp._id}>
                <Link
                  href={`/experiences/${exp.slug.current}`}
                  className="group block overflow-hidden rounded-2xl border border-pearl-400 bg-pearl shadow-soft transition-all duration-400 ease-luxe hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={exp.coverImage.alt ?? exp.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-midnight/40 via-transparent to-transparent"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex flex-col gap-3 p-6 sm:p-7">
                    <p className="text-eyebrow font-medium uppercase tracking-widest2 text-gold">
                      {exp.category}
                    </p>
                    <h3 className="font-heading text-h3-luxe font-medium text-midnight">
                      {exp.title}
                    </h3>
                    <p className="font-sans text-body-sm text-midnight-400">
                      {exp.shortDescription}
                    </p>
                    <p className="mt-2 font-sans text-body-sm font-semibold text-midnight">
                      {priceLabel(exp)}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-12 flex justify-start">
          <Button asChild variant="outline" size="lg">
            <Link href="/experiences">Browse All Experiences</Link>
          </Button>
        </div>
      </Container>
    </Section>
  )
}
