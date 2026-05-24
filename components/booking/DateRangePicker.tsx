'use client'

/**
 * DateRangePicker — two HTML5 date inputs for Check-in / Check-out.
 *
 * Decisions for D1:
 *  - Native `<input type="date">` is good enough for v1 (universal a11y,
 *    no extra JS, free mobile UX). A full calendar with availability sync
 *    is on the Phase E roadmap.
 *  - Check-in min = today, check-out min = check-in + 1.
 *  - We rely on the Provider's `setCheckIn` to auto-blank `checkOut`
 *    if it falls before the new check-in (avoids invalid intermediate states).
 */

import { Calendar } from 'lucide-react'

import { Input } from '@/components/ui'
import { todayISO, addDaysISO, calculateNights, getNightlyRate, formatUSD } from '@/lib/booking'

import { useBooking } from './BookingProvider'
import { SeasonBadge } from './SeasonBadge'
import { MinNightsAlert } from './MinNightsAlert'

export function DateRangePicker() {
  const { state, breakdown, setCheckIn, setCheckOut } = useBooking()

  const today = todayISO()
  const checkOutMin = state.checkIn ? addDaysISO(state.checkIn, 1) : addDaysISO(today, 1)
  const nights = calculateNights(state.checkIn, state.checkOut)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-h3-luxe font-medium text-midnight">When are you coming?</h2>
        <p className="font-sans text-body-sm text-midnight-400">
          Pick your check-in and check-out. The villa rents whole-property — minimum stay {breakdown.minNights} nights.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="booking-checkin"
            className="text-eyebrow font-medium uppercase tracking-widest2 text-midnight-400"
          >
            Check-in
          </label>
          <div className="relative">
            <Input
              id="booking-checkin"
              type="date"
              min={today}
              value={state.checkIn ?? ''}
              onChange={(e) => setCheckIn(e.target.value || null)}
              className="pr-10"
              aria-describedby="booking-checkin-hint"
            />
            <Calendar
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-300"
              aria-hidden="true"
            />
          </div>
          <p
            id="booking-checkin-hint"
            className="font-sans text-xs text-midnight-400"
          >
            {state.checkIn ? (
              <>
                Rate: <span className="font-semibold text-midnight">{formatUSD(getNightlyRate(state.checkIn))}</span> / night
              </>
            ) : (
              <>Choose any date from today onwards.</>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="booking-checkout"
            className="text-eyebrow font-medium uppercase tracking-widest2 text-midnight-400"
          >
            Check-out
          </label>
          <div className="relative">
            <Input
              id="booking-checkout"
              type="date"
              min={checkOutMin}
              value={state.checkOut ?? ''}
              onChange={(e) => setCheckOut(e.target.value || null)}
              disabled={!state.checkIn}
              error={state.checkOut !== null && !breakdown.meetsMinNights}
              className="pr-10"
              aria-describedby="booking-checkout-hint"
            />
            <Calendar
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-300"
              aria-hidden="true"
            />
          </div>
          <p
            id="booking-checkout-hint"
            className="font-sans text-xs text-midnight-400"
          >
            {nights > 0 ? (
              <>
                <span className="font-semibold text-midnight">{nights} {nights === 1 ? 'night' : 'nights'}</span> selected.
              </>
            ) : state.checkIn ? (
              <>Pick at least {breakdown.minNights} nights.</>
            ) : (
              <>Pick a check-in date first.</>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SeasonBadge season={breakdown.season} />
        {nights > 0 && breakdown.meetsMinNights ? (
          <span className="font-sans text-xs text-midnight-400">
            Total villa: <span className="font-semibold text-midnight">{formatUSD(breakdown.villaSubtotal)}</span>
          </span>
        ) : null}
      </div>

      <MinNightsAlert minNights={breakdown.minNights} selectedNights={nights} />
    </div>
  )
}
