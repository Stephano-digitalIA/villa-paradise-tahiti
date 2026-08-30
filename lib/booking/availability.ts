/**
 * Booking availability — SERVER-ONLY check used by 3 guards:
 *
 *   1. GET /api/booking/availability   (public, surfaces blocked ranges
 *                                       to the date picker)
 *   2. POST /api/checkout              (refuses 409 if dates already taken,
 *                                       BEFORE creating a Stripe/PayPal
 *                                       session and a pending reservation)
 *   3. Stripe / PayPal webhooks        (last-line race guard before
 *                                       inserting the direct_booking row
 *                                       in blocked_dates)
 *
 * Source of truth is the Supabase `blocked_dates` table — populated by
 * the hourly iCal sync (`/api/ical/sync`), the admin manual block form
 * (owner / maintenance), and the payment webhooks (direct_booking). For
 * the in-flight gap between checkout creation and webhook completion,
 * we also consult the `reservations` table for rows still in `pending`
 * — but only those inside the `PENDING_HOLD_MINUTES` window, so an
 * abandoned checkout releases its dates instead of holding them forever.
 *
 * Range semantics: `checkIn` inclusive, `checkOut` exclusive (the guest
 * leaves the morning of `checkOut`). A blocked row from `[a, b]` is
 * inclusive on both ends — so two ranges conflict when:
 *   blocked_from < checkOut  AND  blocked_to >= checkIn
 *
 * Client-safe helpers (pure overlap check, public range type) live in
 * `./availability-client` so that importing them from `BookingProvider`
 * doesn't drag the Supabase admin client into the browser bundle.
 *
 * Every read here goes through `liveAdminClient`, never the cached
 * `adminClient`: these queries decide whether a stay can be sold, and a
 * cached answer means the picker offers dates that checkout then refuses.
 */

import { liveAdminClient } from '@/lib/supabase/admin'
import type { BlockedDateSource } from '@/lib/supabase/types'

import {
  GAP_SOURCE,
  GUEST_STAY_SOURCES,
  TURNOVER_DAYS,
  TURNOVER_SOURCE,
  applyTurnoverDays,
  previousIsoDay,
  shiftIsoDay,
  type PublicBlockedRange,
} from './availability-client'

// Re-export so existing server callers can keep importing the type from
// the same module they import `checkAvailability` from.
export type { PublicBlockedRange }

export interface AvailabilityConflict {
  origin: 'blocked_dates' | 'reservation' | 'turnover'
  from: string
  to: string
  /** Source label suitable for showing in the UI / logs. */
  label: string
  /** Underlying source code (so callers can filter or branch). */
  source: BlockedDateSource | 'pending_reservation' | 'turnover' | 'gap'
  /** Optional reservation_ref or block id for traceability. */
  ref?: string | null
}

export interface AvailabilityResult {
  ok: boolean
  conflicts: AvailabilityConflict[]
}

export interface CheckAvailabilityOptions {
  /**
   * When checking before INSERTing a webhook's blocked_dates row, the
   * reservation itself may already have a `blocked_dates` entry from a
   * previous webhook attempt (idempotency replay). Pass its
   * `reservation_ref` so it's excluded from the conflict set.
   */
  excludeReservationRef?: string
}

/**
 * How long an unpaid reservation holds its dates.
 *
 * `/api/checkout` writes the reservation as `pending` before redirecting
 * to Stripe or PayPal, so the dates are held during the payment. Nothing
 * ever settles that row when the guest walks away, and an abandoned cart
 * used to hold its week off the market forever — one visitor clicking
 * "continue to payment" and closing the tab was enough.
 *
 * An hour is comfortably longer than any real checkout, including a slow
 * 3-D Secure round trip. Should a payment somehow land after the hold
 * lapses, the webhook re-checks availability before writing to
 * `blocked_dates` and flags a conflict for the operator rather than
 * silently double-booking.
 */
export const PENDING_HOLD_MINUTES = 60

/** ISO timestamp before which a `pending` reservation no longer holds. */
function pendingHoldCutoff(): string {
  return new Date(Date.now() - PENDING_HOLD_MINUTES * 60_000).toISOString()
}

const SOURCE_LABELS: Record<BlockedDateSource, string> = {
  airbnb: 'Airbnb',
  booking: 'Booking.com',
  vrbo: 'VRBO',
  direct_booking: 'Direct booking',
  owner: 'Owner block',
  maintenance: 'Maintenance',
}

/**
 * Returns `{ ok: true }` when the requested `[checkIn, checkOut)` range
 * is free across every source. Returns `{ ok: false, conflicts: [...] }`
 * otherwise, with a human-readable label per conflict.
 *
 * Pure read — never mutates the DB.
 */
export async function checkAvailability(
  checkIn: string,
  checkOut: string,
  options: CheckAvailabilityOptions = {},
): Promise<AvailabilityResult> {
  if (!checkIn || !checkOut || checkIn >= checkOut) {
    return {
      ok: false,
      conflicts: [
        {
          origin: 'blocked_dates',
          from: checkIn || '',
          to: checkOut || '',
          label: 'Invalid date range',
          source: 'maintenance',
        },
      ],
    }
  }

  const { excludeReservationRef } = options

  // ─── 1. blocked_dates (all sources) ───────────────────────────────────
  // Widen the window by the turnover gap on BOTH sides: a block ending
  // shortly before check-in needs cleaning days that eat into this stay,
  // and a block starting shortly after check-out leaves no time to clean
  // up after it. Without the second half a guest could book right up to
  // the eve of an existing stay.
  const blockedQuery = liveAdminClient
    .from('blocked_dates')
    .select('id, blocked_from, blocked_to, source, source_ref, reason')
    .lt('blocked_from', shiftIsoDay(checkOut, TURNOVER_DAYS))
    .gte('blocked_to', shiftIsoDay(checkIn, -TURNOVER_DAYS))

  // Exclude this reservation's own block (idempotency replay safety).
  const blockedPromise = excludeReservationRef
    ? blockedQuery.or(
        `source_ref.is.null,source_ref.neq.${excludeReservationRef}`,
      )
    : blockedQuery

  // ─── 2. pending reservations (not yet in blocked_dates) ──────────────
  let pendingQuery = liveAdminClient
    .from('reservations')
    .select('reservation_ref, check_in, check_out, payment_status')
    .eq('payment_status', 'pending')
    .gte('created_at', pendingHoldCutoff())
    // Same turnover gap as `blocked_dates`: a held stay starting just after
    // this one ends leaves no room to clean between the two guests.
    .lt('check_in', shiftIsoDay(checkOut, TURNOVER_DAYS))
    .gt('check_out', shiftIsoDay(checkIn, -TURNOVER_DAYS))

  if (excludeReservationRef) {
    pendingQuery = pendingQuery.neq('reservation_ref', excludeReservationRef)
  }

  const [blockedRes, pendingRes] = await Promise.all([blockedPromise, pendingQuery])

  if (blockedRes.error) {
    // Fail closed — if we can't check, deny the booking. Money / villa
    // integrity matters more than convenience here.
    // eslint-disable-next-line no-console
    console.error('[availability] blocked_dates query failed:', blockedRes.error)
    throw new Error('Availability check failed (blocked_dates)')
  }
  if (pendingRes.error) {
    // eslint-disable-next-line no-console
    console.error('[availability] pending reservations query failed:', pendingRes.error)
    throw new Error('Availability check failed (reservations)')
  }

  const conflicts: AvailabilityConflict[] = []

  for (const row of blockedRes.data ?? []) {
    if (row.blocked_to >= checkIn && row.blocked_from < checkOut) {
      // Direct overlap with the picked range.
      conflicts.push({
        origin: 'blocked_dates',
        from: row.blocked_from,
        to: row.blocked_to,
        label: row.reason || SOURCE_LABELS[row.source as BlockedDateSource] || row.source,
        source: row.source as BlockedDateSource,
        ref: row.source_ref ?? row.id,
      })
    } else if (GUEST_STAY_SOURCES.has(row.source)) {
      // No direct overlap, but the cleaning gap either side of the block
      // may still eat into the picked range. Owner and maintenance blocks
      // don't generate one.
      const sourceLabel = SOURCE_LABELS[row.source as BlockedDateSource] || row.source

      for (let offset = 1; offset <= TURNOVER_DAYS; offset += 1) {
        // After the block: the villa is being cleaned once that stay leaves.
        // Before it: this stay would have to be cleaned up before that one
        // arrives, so its own departure must clear the gap too.
        // Two different reasons, and the guest deserves the right one:
        // after the block the villa is being cleaned, before it there is
        // simply not enough room left to clean up afterwards.
        const days: Array<[string, string, AvailabilityConflict['source']]> = [
          [
            shiftIsoDay(row.blocked_to, offset),
            `Cleaning day after ${sourceLabel} stay`,
            TURNOVER_SOURCE,
          ],
          [
            shiftIsoDay(row.blocked_from, -offset),
            `Too close to the ${sourceLabel} stay to allow for housekeeping`,
            GAP_SOURCE,
          ],
        ]

        for (const [day, label, daySource] of days) {
          if (day >= checkIn && day < checkOut) {
            conflicts.push({
              origin: 'turnover',
              from: day,
              to: day,
              label,
              source: daySource,
              ref: `turnover-${row.id}`,
            })
          }
        }
      }
    }
  }

  for (const row of pendingRes.data ?? []) {
    conflicts.push({
      origin: 'reservation',
      from: row.check_in,
      to: row.check_out,
      label: `Pending booking ${row.reservation_ref}`,
      source: 'pending_reservation',
      ref: row.reservation_ref,
    })
  }

  return { ok: conflicts.length === 0, conflicts }
}

/**
 * Lightweight public version used by `/api/booking/availability` to feed
 * the date picker. Returns blocked ranges as a flat list (no pending
 * reservations leaked — guests don't need to see those, and exposing
 * `reservation_ref` would be a small privacy issue).
 *
 * Pending reservations are still merged in as anonymous `direct_booking`
 * ranges so the picker grays them out without revealing reservation refs.
 */
export async function getPublicBlockedRanges(
  horizonDays = 365,
): Promise<PublicBlockedRange[]> {
  const today = new Date().toISOString().slice(0, 10)
  const horizonIso = new Date(Date.now() + horizonDays * 86400 * 1000)
    .toISOString()
    .slice(0, 10)

  const [blockedRes, pendingRes] = await Promise.all([
    liveAdminClient
      .from('blocked_dates')
      .select('blocked_from, blocked_to, source')
      .gte('blocked_to', today)
      .lte('blocked_from', horizonIso)
      .order('blocked_from', { ascending: true }),
    liveAdminClient
      .from('reservations')
      .select('check_in, check_out')
      .eq('payment_status', 'pending')
      .gte('created_at', pendingHoldCutoff())
      .gte('check_out', today)
      .lte('check_in', horizonIso)
      .order('check_in', { ascending: true }),
  ])

  const ranges: PublicBlockedRange[] = []

  for (const row of blockedRes.data ?? []) {
    ranges.push({
      start: row.blocked_from,
      end: row.blocked_to,
      source: row.source,
    })
  }
  for (const row of pendingRes.data ?? []) {
    ranges.push({
      start: row.check_in,
      // Pending reservations carry `check_out` (exclusive); convert to
      // an inclusive `end` matching blocked_dates semantics.
      end: previousIsoDay(row.check_out),
      source: 'direct_booking',
    })
  }

  // Inject a 1-day turnover after each guest-stay block so the picker
  // can render the cleaning day in red and reject any booking starting
  // on it. Back-to-back stays are detected and skipped automatically.
  return applyTurnoverDays(ranges)
}
