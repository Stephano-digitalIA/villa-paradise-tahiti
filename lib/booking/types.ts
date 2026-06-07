/**
 * Booking domain types — Villa Paradise Tahiti.
 *
 * The booking flow is split into two stages:
 *  - D1 (this phase) : date selection + guests + experiences picking, with
 *    a live price breakdown.
 *  - D2 (next phase) : client form (name/email...), checkout submission,
 *    success/cancel pages.
 *
 * `BookingState` is the **single source of truth** for what the user
 * has selected so far. It is the only thing persisted to localStorage,
 * and the only thing the future D2 checkout/payment layer needs to read
 * to settle a purchase.
 *
 * `PriceBreakdown` is the **derived** view, recomputed from
 * `(state, settings, rules)` on every change. It is never persisted —
 * recompute from state to avoid drift between client and server.
 *
 * Monetary values use **integer USD cents** in storage/computation
 * (no `0.1 + 0.2 = 0.30000000000000004` drift), and are formatted on
 * the edge with `formatUSD`.
 */

import type { PriceUnit } from '@/lib/sanity'

/* ---------------------------------------------------------------------------
 * Selected experience line
 * ------------------------------------------------------------------------- */

/**
 * A single experience the user has added to their booking.
 *
 *  - `quantity` is interpreted depending on `priceUnit`:
 *    - `per_person` → number of participants
 *    - `per_group`  → number of groups (rarely > 1, but supported)
 *    - `flat`       → always 1, the UI hides the stepper.
 */
export interface SelectedExperience {
  slug: string
  title: string
  priceUSD: number
  priceUnit: PriceUnit
  quantity: number
}

/* ---------------------------------------------------------------------------
 * Booking state — persisted
 * ------------------------------------------------------------------------- */

export interface BookingState {
  /** ISO date `YYYY-MM-DD`, or null until the user picks one. */
  checkIn: string | null
  /** ISO date `YYYY-MM-DD`, or null until the user picks one. */
  checkOut: string | null
  /** Number of guests, 1..maxGuests. */
  guests: number
  /** Experiences the user has selected, keyed by slug. */
  selectedExperiences: SelectedExperience[]
  /** Optional free-text request — read in D2's checkout form. */
  specialRequests?: string
}

/* ---------------------------------------------------------------------------
 * Pricing — derived
 * ------------------------------------------------------------------------- */

/**
 * Tahitian rate seasons. The classification rule lives in `pricing.ts`.
 *  - `low`  : May-Jun, Oct-Nov.
 *  - `high` : Jul-Sep, mid-Dec, early Jan.
 *  - `peak` : Christmas week, New Year, Easter.
 */
export type Season = 'low' | 'high' | 'peak'

/**
 * Detailed, fully-typed price breakdown. All monetary fields are in
 * **whole USD** for display convenience; internally `pricing.ts` works
 * in cents and rounds only at the breakdown boundary.
 */
export interface PriceBreakdown {
  /** Nights stayed, computed from `(checkOut - checkIn)`. 0 when dates incomplete. */
  nights: number
  /** Per-night villa rate in USD, based on the season of `checkIn`. */
  nightlyRate: number
  /** Detected season, or `null` when no check-in date yet. */
  season: Season | null
  /** Sub-total for the villa portion (`nightlyRate × nights`). */
  villaSubtotal: number
  /** One-off cleaning fee (from settings). */
  cleaningFee: number
  /** Sum of every selected experience line. */
  experiencesTotal: number
  /** villa + cleaning + experiences (before any discount). */
  subtotal: number
  /** Long-stay discount in USD — % off (villa + cleaning) for stays ≥ threshold. 0 otherwise. */
  longStayDiscount: number
  /** True when the long-stay discount was applied. */
  longStayDiscountApplied: boolean
  /** Discount rate used when applied (e.g. 10). */
  longStayDiscountPercent: number
  /** Minimum nights that unlock the long-stay discount. */
  longStayMinNights: number
  /** Taxes line. 0 in French Polynesia (kept for future flexibility). */
  taxes: number
  /** subtotal − longStayDiscount + taxes. */
  total: number
  /** Deposit due at booking (`depositPercent` from settings, default 30%). */
  depositAmount: number
  /** Balance due 30 days before arrival. */
  balanceAmount: number
  /** Stay validity — fail-closed when the user has not selected enough nights. */
  meetsMinNights: boolean
  /** Minimum nights enforced by settings (default 5). */
  minNights: number
  /** Calendar days between today and check-in. Null when no check-in date is set. */
  daysUntilCheckIn: number | null
}

/* ---------------------------------------------------------------------------
 * Persistence envelope (versioned)
 * ------------------------------------------------------------------------- */

/**
 * Versioned wrapper around `BookingState` in localStorage. Bumping `version`
 * on any breaking change to the schema gives `loadBookingState` a clean
 * upgrade path (discard old payloads instead of crashing).
 */
export interface BookingStorageEnvelope {
  version: 1
  /** Unix millis of last write — used to expire stale carts after 7 days. */
  savedAt: number
  state: BookingState
}
