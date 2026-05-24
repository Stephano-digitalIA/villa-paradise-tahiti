import Image from 'next/image'
import Link from 'next/link'
import { Clock, Users } from 'lucide-react'

import { Badge, Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import { urlForImage, type Experience } from '@/lib/sanity'

/**
 * ExperienceCard — visual card for the experiences listing.
 *
 *  - Cover image with subtle hover zoom.
 *  - Category badge top-left, featured badge top-right (if applicable).
 *  - Title, short description, duration/price/guests row.
 *  - The whole card is wrapped in a Next.js Link pointing to the
 *    detail page `/experiences/[slug]`.
 *
 * Designed as a pure server component — no client state, no event
 * handlers. Just composition of `Card`, `Badge`, `next/image` + `Link`.
 */

const categoryLabels: Record<Experience['category'], string> = {
  excursion: 'Excursion',
  evening: 'Evening',
  dining: 'Dining',
  wellness: 'Wellness',
  cultural: 'Cultural',
  adventure: 'Adventure',
}

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

export interface ExperienceCardProps {
  experience: Experience
  className?: string
}

export function ExperienceCard({ experience, className }: ExperienceCardProps) {
  const coverUrl = urlForImage(experience.coverImage).url()
  const detailHref = `/experiences/${experience.slug.current}`

  return (
    <Card
      tone="pearl"
      elevation="card"
      className={cn(
        'group flex flex-col overflow-hidden border-pearl-400 transition-all duration-300 ease-luxe hover:-translate-y-1 hover:shadow-card-hover',
        className,
      )}
    >
      {/* ─── Cover image ─────────────────────────────────────────────── */}
      <Link
        href={detailHref}
        className="relative block aspect-[4/3] overflow-hidden bg-pearl-400"
        aria-label={`View ${experience.title}`}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={experience.coverImage.alt ?? experience.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.05]"
          />
        ) : null}
        {/* Top-left category badge */}
        <Badge variant="luxe" size="sm" className="absolute left-4 top-4">
          {categoryLabels[experience.category]}
        </Badge>
        {/* Top-right featured badge */}
        {experience.featured ? (
          <Badge variant="gold" size="sm" className="absolute right-4 top-4">
            Featured
          </Badge>
        ) : null}
        {/* Seasonal note overlay */}
        {experience.seasonal ? (
          <span className="absolute bottom-4 left-4 rounded-full bg-midnight/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider2 text-pearl backdrop-blur">
            Seasonal · Jul–Oct
          </span>
        ) : null}
      </Link>

      {/* ─── Body ────────────────────────────────────────────────────── */}
      <CardContent className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-6 sm:px-7 sm:pb-7">
        <div>
          <Link href={detailHref} className="hover:text-gold">
            <h3 className="font-heading text-h3-luxe font-medium leading-tight text-midnight transition-colors">
              {experience.title}
            </h3>
          </Link>
          <p className="mt-2 font-sans text-body-sm text-midnight-400">
            {experience.shortDescription}
          </p>
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-pearl-400 pt-4 text-xs">
          <div className="flex items-center gap-2 text-midnight-400">
            <Clock className="h-4 w-4 text-gold" aria-hidden="true" />
            <span className="font-sans">{experience.duration}</span>
          </div>
          <div className="flex items-center justify-end gap-2 text-midnight">
            <span className="font-heading text-base font-semibold text-midnight">
              {formatPrice(experience)}
            </span>
          </div>
          {experience.maxGuests ? (
            <div className="flex items-center gap-2 text-midnight-400">
              <Users className="h-4 w-4 text-gold" aria-hidden="true" />
              <span className="font-sans">Up to {experience.maxGuests} guests</span>
            </div>
          ) : (
            <span aria-hidden="true" />
          )}
          <div className="flex items-center justify-end">
            <Link
              href={detailHref}
              className="font-sans text-xs font-semibold uppercase tracking-wider2 text-lagoon hover:text-gold"
            >
              Learn more →
            </Link>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

export { categoryLabels }
