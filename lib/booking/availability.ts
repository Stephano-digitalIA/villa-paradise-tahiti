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
 * we also consult the `reservations` table for rows still in `pending`.
 *
 * Range semantics: `checkIn` inclusive, `checkOut` exclusive (the guest
 * leaves the morning of `checkOut`). A blocked row from `[a, b]` is
 * inclusive on both ends — so two ranges conflict when:
 *   blocked_from < checkOut  AND  blocked_to >= checkIn
 *
 * Client-safe helpers (pure overlap check, public range type) live in
 * `./availability-client` so that importing them from `BookingProvider`
 * doesn't drag the Supabase admin client into the browser bundle.
 */

import { adminClient } from '@/lib/supabase/admin'
import type { BlockedDateSource } from '@/lib/supabase/types'

import {
  GUEST_STAY_SOURCES,
  TURNOVER_SOURCE,
  applyTurnoverDays,
  nextIsoDay,
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
  source: BlockedDateSource | 'pending_reservation' | 'turnover'
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
  // Expand the range by 1 day backwards so we also pick up blocks that
  // END the day before check-in — those generate a turnover day that
  // overlaps `checkIn`.
  const blockedQuery = adminClient
    .from('blocked_dates')
    .select('id, blocked_from, blocked_to, source, source_ref, reason')
    .lt('blocked_from', checkOut)
    .gte('blocked_to', previousIsoDay(checkIn))

  // Exclude this reservation's own block (idempotency replay safety).
  const blockedPromise = excludeReservationRef
    ? blockedQuery.or(
        `source_ref.is.null,source_ref.neq.${excludeReservationRef}`,
      )
    : blockedQuery

  // ─── 2. pending reservations (not yet in blocked_dates) ──────────────
  let pendingQuery = adminClient
    .from('reservations')
    .select('reservation_ref, check_in, check_out, payment_status')
    .eq('payment_status', 'pending')
    .lt('check_in', checkOut)
    .gt('check_out', checkIn)

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
    if (row.blocked_to >= checkIn) {
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
      // Block ends the day before check-in → turnover-day conflict.
      // (Owner / maintenance blocks don't generate a turnover day.)
      const turnoverDay = nextIsoDay(row.blocked_to)
      if (turnoverDay >= checkIn && turnoverDay < checkOut) {
        const sourceLabel = SOURCE_LABELS[row.source as BlockedDateSource] || row.source
        conflicts.push({
          origin: 'turnover',
          from: turnoverDay,
          to: turnoverDay,
          label: `Cleaning day after ${sourceLabel} stay`,
          source: TURNOVER_SOURCE,
          ref: `turnover-${row.id}`,
        })
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
    adminClient
      .from('blocked_dates')
      .select('blocked_from, blocked_to, source')
      .gte('blocked_to', today)
      .lte('blocked_from', horizonIso)
      .order('blocked_from', { ascending: true }),
    adminClient
      .from('reservations')
      .select('check_in, check_out')
      .eq('payment_status', 'pending')
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

function previousIsoDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y || 1970, (m || 1) - 1, d || 1))
  date.setUTCDate(date.getUTCDate() - 1)
  const yy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}
