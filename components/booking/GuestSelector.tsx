'use client'

import { Users } from 'lucide-react'

import { useBooking } from './BookingProvider'
import { Stepper } from './Stepper'

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

  return (
    <div className={className}>
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-h3-luxe font-medium text-midnight">Who's coming?</h2>
        <p className="font-sans text-body-sm text-midnight-400">
          The villa sleeps up to {MAX_GUESTS} guests across 4 bedrooms.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border-2 border-midnight/25 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-gold" aria-hidden="true" />
          <div>
            <p
              className="font-sans text-body-md font-semibold text-midnight"
              aria-live="polite"
            >
              {`${value} ${value === 1 ? 'guest' : 'guests'}`}
            </p>
            <p className="font-sans text-xs text-midnight-400">
              Whole-villa rental — no shared spaces.
            </p>
          </div>
        </div>

        <Stepper
          value={value}
          min={MIN_GUESTS}
          max={MAX_GUESTS}
          onChange={setGuests}
          label="Guest count"
          decreaseLabel="Decrease guests"
          increaseLabel="Increase guests"
        />
      </div>
    </div>
  )
}
