'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Experience, ExperienceCategory } from '@/lib/sanity'
import { ExperienceCard } from './ExperienceCard'

/**
 * ExperienceList — client-side category filter + responsive grid.
 *
 * Filter chips drive local state (no URL sync — chosen for simplicity and
 * because the filter is purely cosmetic; the canonical detail page lives
 * at `/experiences/[slug]` and is not affected by the chip selection).
 *
 * If product later wants shareable filtered links we can promote the
 * `activeCategory` state to `?category=` via `useSearchParams` —
 * components stay the same.
 */

type Filter = 'all' | ExperienceCategory

interface ExperienceFilterChip {
  value: Filter
  label: string
}

const FILTERS: ExperienceFilterChip[] = [
  { value: 'all', label: 'All' },
  { value: 'excursion', label: 'Excursions' },
  { value: 'dining', label: 'Dining' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'evening', label: 'Evening' },
]

interface ExperienceListProps {
  experiences: Experience[]
}

export function ExperienceList({ experiences }: ExperienceListProps) {
  const [activeCategory, setActiveCategory] = useState<Filter>('all')

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return experiences
    return experiences.filter((e) => e.category === activeCategory)
  }, [experiences, activeCategory])

  return (
    <>
      {/* ─── Filter chips ────────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Filter experiences by category"
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      >
        {FILTERS.map((filter) => {
          const isActive = filter.value === activeCategory
          return (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategory(filter.value)}
              className={cn(
                'rounded-full border px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wider2 transition-all duration-200 ease-luxe',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pearl',
                isActive
                  ? 'border-midnight bg-midnight text-gold shadow-soft'
                  : 'border-pearl-400 bg-pearl text-midnight-400 hover:border-midnight hover:text-midnight',
              )}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {/* ─── Grid of experience cards ────────────────────────────────── */}
      {filtered.length === 0 ? (
        <p className="mt-16 text-center font-sans text-body-md text-midnight-400">
          No experiences in this category yet.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {filtered.map((experience) => (
            <ExperienceCard key={experience._id} experience={experience} />
          ))}
        </div>
      )}
    </>
  )
}
