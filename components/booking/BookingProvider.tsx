'use client'

/**
 * BookingProvider — React Context owning the live booking state.
 *
 * Architecture:
 *  - The parent **server** page fetches `experiences` + `settings` from
 *    Sanity once and passes them as props.
 *  - This Provider exposes the **client-only** mutable booking state plus
 *    a derived `breakdown` and validation result.
 *  - State changes are mirrored to `localStorage` with a 300ms debounce so
 *    we don't spam the disk on every step click.
 *  - On mount, the Provider rehydrates from localStorage transparently.
 *
 * Consumers should NEVER reach for `useState` themselves — always go
 * through `useBooking()`. This guarantees a single source of truth and
 * a single localStorage sync path.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import type { Experience, Settings } from '@/lib/sanity'
import {
  computeBreakdown,
  loadBookingState,
  saveBookingState,
  toPricingSettings,
  validateBookingState,
  type BookingState,
  type BookingValidation,
  type PriceBreakdown,
  type SelectedExperience,
} from '@/lib/booking'
// Direct import from the client-safe module — going through the barrel
// risks dragging the server-only `adminClient` into the browser bundle.
import {
  rangeOverlapsAny,
  type PublicBlockedRange,
} from '@/lib/booking/availability-client'

/* ---------------------------------------------------------------------------
 * Context shape
 * ------------------------------------------------------------------------- */

export interface AvailabilityConflict {
  start: string
  end: string
  source: string
}

export interface BookingContextValue {
  /** Sanity-provided list of available experiences (filtered upstream). */
  experiences: Experience[]
  /** Sanity settings — pricing knobs, deposit %, etc. */
  settings: Settings | null
  /** Current mutable state — never mutate directly, always use the actions. */
  state: BookingState
  /** Derived price breakdown — recomputed on every state change. */
  breakdown: PriceBreakdown
  /** Validation — whether the state is ready to move to D2's checkout. */
  validation: BookingValidation
  /** True until the localStorage rehydration has run (avoids hydration mismatch). */
  hydrated: boolean

  /* Availability — populated from /api/booking/availability on mount */
  blockedRanges: PublicBlockedRange[]
  /** True while the initial fetch is in flight. */
  availabilityLoading: boolean
  /**
   * Set when the picked date range overlaps a blocked range. Null when
   * the range is free or when either date is missing.
   */
  availabilityConflict: AvailabilityConflict | null

  /* mutators */
  setCheckIn: (date: string | null) => void
  setCheckOut: (date: string | null) => void
  setGuests: (count: number) => void
  setSpecialRequests: (value: string) => void
  addExperience: (experience: Experience, quantity?: number) => void
  removeExperience: (slug: string) => void
  setExperienceQuantity: (slug: string, quantity: number) => void
  toggleExperience: (experience: Experience, defaultQuantity?: number) => void
  clearAll: () => void
}

const DEFAULT_STATE: BookingState = {
  checkIn: null,
  checkOut: null,
  guests: 2,
  selectedExperiences: [],
}

const BookingContext = createContext<BookingContextValue | null>(null)

/* ---------------------------------------------------------------------------
 * Provider
 * ------------------------------------------------------------------------- */

export interface BookingProviderProps {
  experiences: Experience[]
  settings: Settings | null
  children: ReactNode
}

export function BookingProvider({ experiences, settings, children }: BookingProviderProps) {
  const [state, setState] = useState<BookingState>(DEFAULT_STATE)
  const [hydrated, setHydrated] = useState(false)
  const [blockedRanges, setBlockedRanges] = useState<PublicBlockedRange[]>([])
  const [availabilityLoading, setAvailabilityLoading] = useState(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ---- Rehydrate from localStorage on mount (client only) ------------- */
  useEffect(() => {
    const persisted = loadBookingState()
    if (persisted) {
      setState((current) => ({
        ...current,
        ...persisted,
        // Belt-and-braces: persisted guests must respect the villa cap.
        guests: clampGuests(persisted.guests),
      }))
    }
    setHydrated(true)
    // We only want to read storage once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---- Fetch unavailable ranges from the public endpoint ------------- */
  useEffect(() => {
    let cancelled = false

    async function fetchRanges(): Promise<PublicBlockedRange[] | null> {
      const res = await fetch('/api/booking/availability', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as { blockedRanges?: PublicBlockedRange[] }
      return json.blockedRanges ?? []
    }

    // 1. Show whatever is already persisted — instantly, no channel fetch.
    async function loadInitial() {
      try {
        const ranges = await fetchRanges()
        if (!cancelled && ranges) setBlockedRanges(ranges)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[booking] availability fetch failed:', err)
        if (!cancelled) setBlockedRanges([])
      } finally {
        if (!cancelled) setAvailabilityLoading(false)
      }
    }

    // 2. In the background, pull the latest Airbnb/Booking/VRBO bookings, then
    //    silently re-read availability so the picker freshens within seconds.
    //    Best-effort: any failure leaves the already-shown data in place.
    async function refreshFromChannels() {
      try {
        const sync = await fetch('/api/booking/sync', { method: 'POST' })
        if (!sync.ok) return
        const result = (await sync.json()) as { mode?: string }
        // Only re-read when a live sync actually ran (it may have changed the
        // blocked dates); 'skipped'/'mock' don't touch the persisted data.
        if (cancelled || result.mode !== 'live') return
        const ranges = await fetchRanges()
        if (!cancelled && ranges) setBlockedRanges(ranges)
      } catch {
        /* ignore — current availability already displayed */
      }
    }

    loadInitial()
    refreshFromChannels()

    return () => {
      cancelled = true
    }
  }, [])

  /* ---- Debounced save on every change after hydration ----------------- */
  useEffect(() => {
    if (!hydrated) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveBookingState(state)
    }, 300)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [state, hydrated])

  /* ---- Derived values ------------------------------------------------- */
  const breakdown = useMemo(
    () => computeBreakdown(state, toPricingSettings(settings)),
    [state, settings],
  )
  const validation = useMemo(
    () => validateBookingState(state, breakdown),
    [state, breakdown],
  )

  /**
   * Compares the currently picked range against `blockedRanges`. Pure —
   * runs on every state / blockedRanges change without hitting the
   * network. Returns null when either date is missing.
   */
  const availabilityConflict = useMemo<AvailabilityConflict | null>(() => {
    if (!state.checkIn || !state.checkOut) return null
    const result = rangeOverlapsAny(state.checkIn, state.checkOut, blockedRanges)
    if (!result.conflict) return null
    return {
      start: result.conflict.start,
      end: result.conflict.end,
      // `source` exists on PublicBlockedRange but rangeOverlapsAny only
      // returns start/end — re-find the original to surface the label.
      source:
        blockedRanges.find(
          (r) => r.start === result.conflict!.start && r.end === result.conflict!.end,
        )?.source ?? 'unknown',
    }
  }, [state.checkIn, state.checkOut, blockedRanges])

  /* ---- Actions -------------------------------------------------------- */
  const setCheckIn = useCallback((date: string | null) => {
    setState((s) => {
      // If the new check-in is after the current check-out, blank the latter.
      const next: BookingState = { ...s, checkIn: date }
      if (date && s.checkOut && s.checkOut <= date) {
        next.checkOut = null
      }
      return next
    })
  }, [])

  const setCheckOut = useCallback((date: string | null) => {
    setState((s) => ({ ...s, checkOut: date }))
  }, [])

  const setGuests = useCallback((count: number) => {
    setState((s) => ({ ...s, guests: clampGuests(count) }))
  }, [])

  const setSpecialRequests = useCallback((value: string) => {
    setState((s) => ({ ...s, specialRequests: value }))
  }, [])

  const addExperience = useCallback(
    (experience: Experience, quantity?: number) => {
      setState((s) => {
        if (s.selectedExperiences.some((e) => e.slug === experience.slug.current)) {
          return s
        }
        const line: SelectedExperience = {
          slug: experience.slug.current,
          title: experience.title,
          priceUSD: experience.priceUSD,
          priceUnit: experience.priceUnit,
          quantity:
            experience.priceUnit === 'flat'
              ? 1
              : Math.max(experience.minGuests ?? 1, quantity ?? s.guests),
        }
        return { ...s, selectedExperiences: [...s.selectedExperiences, line] }
      })
    },
    [],
  )

  const removeExperience = useCallback((slug: string) => {
    setState((s) => ({
      ...s,
      selectedExperiences: s.selectedExperiences.filter((e) => e.slug !== slug),
    }))
  }, [])

  const setExperienceQuantity = useCallback((slug: string, quantity: number) => {
    setState((s) => ({
      ...s,
      selectedExperiences: s.selectedExperiences.map((e) =>
        e.slug === slug && e.priceUnit !== 'flat'
          ? { ...e, quantity: Math.max(1, Math.floor(quantity)) }
          : e,
      ),
    }))
  }, [])

  const toggleExperience = useCallback(
    (experience: Experience, defaultQuantity?: number) => {
      setState((s) => {
        const exists = s.selectedExperiences.some((e) => e.slug === experience.slug.current)
        if (exists) {
          return {
            ...s,
            selectedExperiences: s.selectedExperiences.filter(
              (e) => e.slug !== experience.slug.current,
            ),
          }
        }
        const line: SelectedExperience = {
          slug: experience.slug.current,
          title: experience.title,
          priceUSD: experience.priceUSD,
          priceUnit: experience.priceUnit,
          quantity:
            experience.priceUnit === 'flat'
              ? 1
              : Math.max(experience.minGuests ?? 1, defaultQuantity ?? s.guests),
        }
        return { ...s, selectedExperiences: [...s.selectedExperiences, line] }
      })
    },
    [],
  )

  const clearAll = useCallback(() => {
    setState(DEFAULT_STATE)
  }, [])

  const value = useMemo<BookingContextValue>(
    () => ({
      experiences,
      settings,
      state,
      breakdown,
      validation,
      hydrated,
      blockedRanges,
      availabilityLoading,
      availabilityConflict,
      setCheckIn,
      setCheckOut,
      setGuests,
      setSpecialRequests,
      addExperience,
      removeExperience,
      setExperienceQuantity,
      toggleExperience,
      clearAll,
    }),
    [
      experiences,
      settings,
      state,
      breakdown,
      validation,
      hydrated,
      blockedRanges,
      availabilityLoading,
      availabilityConflict,
      setCheckIn,
      setCheckOut,
      setGuests,
      setSpecialRequests,
      addExperience,
      removeExperience,
      setExperienceQuantity,
      toggleExperience,
      clearAll,
    ],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

/* ---------------------------------------------------------------------------
 * Hook
 * ------------------------------------------------------------------------- */

/**
 * Read the booking context. Throws when called outside of a
 * `<BookingProvider>` to make integration mistakes loud and early.
 */
export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext)
  if (!ctx) {
    throw new Error('useBooking() must be used inside a <BookingProvider>.')
  }
  return ctx
}

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

/** Villa max occupancy — mirrors `mockVilla.specs.maxGuests`. */
const MAX_GUESTS = 8

function clampGuests(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.min(MAX_GUESTS, Math.max(1, Math.floor(value)))
}
