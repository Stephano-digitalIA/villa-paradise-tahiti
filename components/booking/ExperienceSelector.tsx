'use client'

/**
 * ExperienceSelector — the curated list of add-ons the user can drop
 * into their stay.
 *
 *  - Reads from the Provider's `experiences` prop (server-fetched upstream).
 *  - Filters out seasonal experiences whose window doesn't overlap the
 *    selected stay (e.g. whale watching only Jul-Oct).
 *  - Per-line UX:
 *      - Checkbox to toggle (or click anywhere on the card).
 *      - When selected: a -/+ stepper for the quantity, except for
 *        `flat`-priced items which are intrinsically singular.
 *      - Live sub-total per line.
 */

import Image from 'next/image'
import { Minus, Plus, Check } from 'lucide-react'

import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import { calculateExperienceLineTotal, formatUSD } from '@/lib/booking'
import type { Experience, PriceUnit } from '@/lib/sanity'

import { useBooking } from './BookingProvider'

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

const CATEGORY_LABELS: Record<Experience['category'], string> = {
  excursion: 'Excursion',
  evening: 'Evening',
  dining: 'Dining',
  wellness: 'Wellness',
  cultural: 'Cultural',
  adventure: 'Adventure',
}

function unitSuffix(unit: PriceUnit): string {
  if (unit === 'per_person') return '/ person'
  if (unit === 'per_group') return '/ group'
  return ''
}

/**
 * Returns true when a seasonal experience is bookable given the chosen
 * check-in date. Non-seasonal experiences always pass.
 *
 * For seasonal items with both bounds set, we accept any check-in
 * within `[seasonStart, seasonEnd]`. When no check-in date is set yet,
 * we keep the item visible — the user can still browse.
 */
function isAvailableForStay(experience: Experience, checkIn: string | null): boolean {
  if (!experience.seasonal) return true
  if (!experience.seasonStart || !experience.seasonEnd) return true
  if (!checkIn) return true
  return checkIn >= experience.seasonStart && checkIn <= experience.seasonEnd
}

/* ---------------------------------------------------------------------------
 * Single line
 * ------------------------------------------------------------------------- */

interface LineProps {
  experience: Experience
}

function ExperienceLine({ experience }: LineProps) {
  const {
    state,
    toggleExperience,
    setExperienceQuantity,
  } = useBooking()

  const slug = experience.slug.current
  const selected = state.selectedExperiences.find((e) => e.slug === slug)
  const isSelected = Boolean(selected)
  const minQty = experience.minGuests ?? 1
  const maxQty = experience.maxGuests ?? 12
  const qty = selected?.quantity ?? state.guests

  const lineTotal = selected ? calculateExperienceLineTotal(selected) : 0
  const cover = (experience.coverImage as { url?: string } | null)?.url ?? ''

  const toggle = () => toggleExperience(experience)

  const decrement = () => {
    if (!selected) return
    setExperienceQuantity(slug, Math.max(minQty, qty - 1))
  }
  const increment = () => {
    if (!selected) return
    setExperienceQuantity(slug, Math.min(maxQty, qty + 1))
  }

  return (
    <li
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-pearl transition-all',
        isSelected
          ? 'border-gold/60 ring-1 ring-gold/30 shadow-card'
          : 'border-pearl-400 hover:border-lagoon/30 hover:shadow-soft',
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Cover — clickable toggle */}
        <button
          type="button"
          onClick={toggle}
          aria-pressed={isSelected}
          aria-label={`${isSelected ? 'Remove' : 'Add'} ${experience.title}`}
          className="relative block aspect-[4/3] w-full overflow-hidden bg-pearl-400 sm:aspect-auto sm:h-auto sm:w-44 sm:flex-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset"
        >
          {cover ? (
            <Image
              src={cover}
              alt={experience.coverImage.alt ?? experience.title}
              fill
              sizes="(max-width: 640px) 100vw, 176px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
          {experience.seasonal ? (
            <span className="absolute bottom-2 left-2 rounded-full bg-midnight/70 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider2 text-pearl backdrop-blur">
              Seasonal
            </span>
          ) : null}
          {isSelected ? (
            <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-midnight shadow-soft">
              <Check className="h-4 w-4" aria-hidden="true" />
            </span>
          ) : null}
        </button>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm">
                  {CATEGORY_LABELS[experience.category]}
                </Badge>
                <span className="font-sans text-xs text-midnight-400">{experience.duration}</span>
              </div>
              <h3 className="mt-2 font-heading text-base font-semibold text-midnight">
                {experience.title}
              </h3>
              <p className="mt-1 font-sans text-body-sm text-midnight-400">
                {experience.shortDescription}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 text-right">
              <p className="font-heading text-base font-semibold text-midnight">
                {formatUSD(experience.priceUSD)}
              </p>
              {unitSuffix(experience.priceUnit) ? (
                <p className="font-sans text-xs text-midnight-400">
                  {unitSuffix(experience.priceUnit)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-pearl-400 pt-3">
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={toggle}
                className="h-4 w-4 cursor-pointer rounded border-lagoon/30 text-gold focus:ring-gold"
                aria-label={`Select ${experience.title}`}
              />
              <span className="font-sans text-body-sm font-semibold text-midnight">
                {isSelected ? 'Added to your stay' : 'Add to stay'}
              </span>
            </label>

            {isSelected && experience.priceUnit !== 'flat' ? (
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-1"
                  role="group"
                  aria-label={`Quantity for ${experience.title}`}
                >
                  <button
                    type="button"
                    onClick={decrement}
                    disabled={qty <= minQty}
                    aria-label="Decrease quantity"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-lagoon/30 text-midnight transition-all hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-lagoon/30 disabled:hover:text-midnight"
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <span
                    className="min-w-[1.75rem] text-center font-heading text-sm font-semibold text-midnight"
                    aria-live="polite"
                  >
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={increment}
                    disabled={qty >= maxQty}
                    aria-label="Increase quantity"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-lagoon/30 text-midnight transition-all hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-lagoon/30 disabled:hover:text-midnight"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
                <span className="font-sans text-body-sm font-semibold text-midnight">
                  {formatUSD(lineTotal)}
                </span>
              </div>
            ) : isSelected ? (
              <span className="font-sans text-body-sm font-semibold text-midnight">
                {formatUSD(lineTotal)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  )
}

/* ---------------------------------------------------------------------------
 * Outer list
 * ------------------------------------------------------------------------- */

export function ExperienceSelector() {
  const { experiences, state } = useBooking()

  const available = experiences
    .filter((e) => e.active !== false)
    .filter((e) => isAvailableForStay(e, state.checkIn))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-h3-luxe font-medium text-midnight">
          Add experiences (optional)
        </h2>
        <p className="font-sans text-body-sm text-midnight-400">
          Curated by our concierge. Quantities default to your guest count — adjust freely.
        </p>
        <p className="font-sans text-xs text-midnight-400/70 italic">
          Subject to availability — confirmation based on availability and weather conditions.
        </p>
      </div>

      {available.length === 0 ? (
        <p className="rounded-xl border border-pearl-400 bg-sand/40 p-6 text-center font-sans text-body-sm text-midnight-400">
          No experiences match your dates yet. Adjust your check-in to see seasonal options.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {available.map((exp) => (
            <ExperienceLine key={exp._id} experience={exp} />
          ))}
        </ul>
      )}
    </div>
  )
}
