'use client'

/**
 * DateRangePicker — two `<DateField />` controls for Check-in / Check-out.
 *
 * Replaces the previous native `<input type="date">` so the calendar
 * widget always renders in English (mm/dd/yyyy, week starts Sunday) even
 * on a French OS — Chrome ignores `lang="en-US"` for the native control.
 *
 *  - Check-in min = today
 *  - Check-out min = check-in + 1
 *  - Provider's `setCheckIn` auto-blanks `checkOut` if the new check-in
 *    is on/after the current check-out, avoiding invalid intermediate
 *    states.
 *  - Dates that overlap a blocked range (Airbnb, owner, etc.) are passed
 *    to the picker via `disabledRanges` so they're greyed out and
 *    unselectable — UX matches the inline error bandeau below.
 */

import { AlertCircle } from 'lucide-react'

import { DateField } from '@/components/ui'
import { todayISO, addDaysISO, calculateNights, getNightlyRate } from '@/lib/booking'
import { useCurrency } from '@/components/currency'

import { useBooking } from './BookingProvider'
import { SeasonBadge } from './SeasonBadge'
import { MinNightsAlert } from './MinNightsAlert'

const SOURCE_LABEL: Record<string, string> = {
  airbnb: 'Airbnb',
  booking: 'Booking.com',
  vrbo: 'VRBO',
  direct_booking: 'another guest',
  owner: 'the owner',
  maintenance: 'maintenance',
}

/** Format an ISO date as US `mm/dd/yyyy` regardless of browser locale. */
function formatHumanDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${m}/${d}/${y}`
}

export function DateRangePicker() {
  const {
    state,
    breakdown,
    setCheckIn,
    setCheckOut,
    availabilityConflict,
    blockedRanges,
  } = useBooking()
  const { format } = useCurrency()

  const today = todayISO()
  const checkOutMin = state.checkIn ? addDaysISO(state.checkIn, 1) : addDaysISO(today, 1)
  const nights = calculateNights(state.checkIn, state.checkOut)
  const conflictLabel = availabilityConflict
    ? SOURCE_LABEL[availabilityConflict.source] ?? availabilityConflict.source
    : null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-h3-luxe font-medium text-midnight">When are you coming?</h2>
        <p className="font-sans text-body-sm text-midnight-400">
          Pick your check-in and check-out. The villa rents whole-property — minimum stay {breakdown.minNights} nights.
        </p>
        <div className="mt-2 flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-coral/30 bg-coral/5 px-3 py-1.5">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full border border-coral/40 bg-coral/20"
              aria-hidden="true"
            />
            <p className="font-sans text-xs text-midnight-400">
              <span className="font-semibold text-midnight">Coral</span> dates
              are already booked (Airbnb, owner block, or another direct
              guest) and can&apos;t be selected.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-800/40 bg-emerald-800/5 px-3 py-1.5">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full border border-emerald-800/50 bg-emerald-800/30"
              aria-hidden="true"
            />
            <p className="font-sans text-xs text-midnight-400">
              <span className="font-semibold text-midnight">Dark green</span>{' '}
              dates are mandatory cleaning &amp; turnover days (the day after
              every guest stay) and are reserved for housekeeping.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="booking-checkin"
            className="text-eyebrow font-medium uppercase tracking-widest2 text-midnight-400"
          >
            Check-in
          </label>
          <DateField
            id="booking-checkin"
            value={state.checkIn ?? ''}
            onChange={(v) => setCheckIn(v || null)}
            min={today}
            disabledRanges={blockedRanges}
            aria-describedby="booking-checkin-hint"
            aria-label="Choose a check-in date"
          />
          <p
            id="booking-checkin-hint"
            className="font-sans text-xs text-midnight-400"
          >
            {state.checkIn ? (
              <>
                Rate:{' '}
                <span className="font-semibold text-midnight">
                  {format(getNightlyRate(state.checkIn))}
                </span>{' '}
                / night
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
          <DateField
            id="booking-checkout"
            value={state.checkOut ?? ''}
            onChange={(v) => setCheckOut(v || null)}
            min={checkOutMin}
            disabled={!state.checkIn}
            disabledRanges={blockedRanges}
            error={state.checkOut !== null && !breakdown.meetsMinNights}
            aria-describedby="booking-checkout-hint"
            aria-label="Choose a check-out date"
          />
          <p
            id="booking-checkout-hint"
            className="font-sans text-xs text-midnight-400"
          >
            {nights > 0 ? (
              <>
                <span className="font-semibold text-midnight">
                  {nights} {nights === 1 ? 'night' : 'nights'}
                </span>{' '}
                selected.
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
            Total villa: <span className="font-semibold text-midnight">{format(breakdown.villaSubtotal)}</span>
          </span>
        ) : null}
      </div>

      <MinNightsAlert minNights={breakdown.minNights} selectedNights={nights} />

      {availabilityConflict ? (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-xl border border-coral/40 bg-coral/5 px-4 py-3"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-coral" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="font-sans text-sm font-semibold text-midnight">
              These dates aren&apos;t available.
            </p>
            <p className="font-sans text-xs text-midnight-400">
              The villa is already booked by {conflictLabel} from{' '}
              <span className="font-medium text-midnight">{formatHumanDate(availabilityConflict.start)}</span>{' '}
              to{' '}
              <span className="font-medium text-midnight">{formatHumanDate(availabilityConflict.end)}</span>
              . Try a different window or contact us for alternatives.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
