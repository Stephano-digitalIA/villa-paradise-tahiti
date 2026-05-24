'use client'

import { Minus, Plus, Users } from 'lucide-react'

import { useBooking } from './BookingProvider'

const MIN_GUESTS = 1
const MAX_GUESTS = 8

interface GuestSelectorProps {
  className?: string
}

/**
 * GuestSelector — accessible -/+ stepper for the guest count.
 *
 *  - Bounds: 1..8 (mirrors `mockVilla.specs.maxGuests`).
 *  - ARIA: each button reports its disabled state; the live value is
 *    exposed as an `aria-live` region so screen readers announce changes.
 */
export function GuestSelector({ className }: GuestSelectorProps) {
  const { state, setGuests } = useBooking()
  const value = state.guests

  const dec = () => setGuests(Math.max(MIN_GUESTS, value - 1))
  const inc = () => setGuests(Math.min(MAX_GUESTS, value + 1))

  return (
    <div className={className}>
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-h3-luxe font-medium text-midnight">Who's coming?</h2>
        <p className="font-sans text-body-sm text-midnight-400">
          The villa sleeps up to {MAX_GUESTS} guests across 4 bedrooms.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-lagoon/20 bg-pearl px-4 py-3">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-gold" aria-hidden="true" />
          <div>
            <p
              className="font-sans text-body-md font-semibold text-midnight"
              aria-live="polite"
            >
              {value} {value === 1 ? 'guest' : 'guests'}
            </p>
            <p className="font-sans text-xs text-midnight-400">
              Whole-villa rental — no shared spaces.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2" role="group" aria-label="Guest count">
          <button
            type="button"
            onClick={dec}
            disabled={value <= MIN_GUESTS}
            aria-label="Decrease guests"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-lagoon/30 text-midnight transition-all hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pearl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-lagoon/30 disabled:hover:text-midnight"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span
            className="w-6 text-center font-heading text-base font-semibold text-midnight"
            aria-hidden="true"
          >
            {value}
          </span>
          <button
            type="button"
            onClick={inc}
            disabled={value >= MAX_GUESTS}
            aria-label="Increase guests"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-lagoon/30 text-midnight transition-all hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pearl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-lagoon/30 disabled:hover:text-midnight"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
