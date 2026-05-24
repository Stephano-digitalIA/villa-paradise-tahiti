'use client'

/**
 * ExperiencePrefill — invisible side-effect component.
 *
 * Reads `?experience=<slug>` from the URL once on mount and, if it
 * matches an experience the Provider knows about, auto-selects it.
 *
 * Lives as its own component (rather than as an effect inside the page)
 * so the page itself stays declarative and so `useSearchParams()` is
 * naturally wrapped in the parent's `<Suspense>` boundary.
 */

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

import { useBooking } from './BookingProvider'

export function ExperiencePrefill() {
  const params = useSearchParams()
  const { experiences, addExperience, state, hydrated } = useBooking()
  const appliedRef = useRef(false)

  useEffect(() => {
    if (appliedRef.current) return
    if (!hydrated) return
    const slug = params?.get('experience')
    if (!slug) {
      appliedRef.current = true
      return
    }
    const match = experiences.find((e) => e.slug.current === slug)
    if (!match) {
      appliedRef.current = true
      return
    }
    const alreadySelected = state.selectedExperiences.some((e) => e.slug === slug)
    if (!alreadySelected) {
      addExperience(match)
    }
    appliedRef.current = true
  }, [params, experiences, addExperience, state.selectedExperiences, hydrated])

  return null
}
