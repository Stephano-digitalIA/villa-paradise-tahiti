/**
 * Resend domain types — Villa Paradise Tahiti (Phase E1).
 *
 * Surface that Phase E2 (Stripe / PayPal webhook → confirmation emails)
 * will consume. Keep these types framework-agnostic — they must be
 * importable from API routes, background workers, and tests alike.
 */

/* ---------------------------------------------------------------------------
 * Result envelope
 * ------------------------------------------------------------------------- */

/**
 * Outcome of a single send attempt. The discriminator is `ok`.
 *
 *  - `{ ok: true, id }`        : Resend accepted the message; `id` is the
 *                                Resend message id (use it for tracing).
 *  - `{ ok: false, reason }`   : Send did not happen. `reason` is one of:
 *      - `'not_configured'`   — no `RESEND_API_KEY` in env (mock mode).
 *      - `'send_failed'`      — SDK returned an error.
 *      - `'render_failed'`    — React Email rendering threw.
 *      - any other future short string.
 */
export type EmailResult =
  | { ok: true; id: string }
  | { ok: false; reason: string; message?: string }

/* ---------------------------------------------------------------------------
 * Booking confirmation payload
 * ------------------------------------------------------------------------- */

/**
 * Data needed to render the post-payment confirmation email (guest + owner).
 *
 * Phase E2 will build this from:
 *   - The Stripe / PayPal webhook payload (reservation id, payment status).
 *   - The persisted booking state (dates, guests, experiences).
 *   - The Sanity-driven price breakdown.
 *
 * Monetary fields are **whole USD numbers** to match
 * `lib/booking/types.ts → PriceBreakdown`. Do not pass cents here.
 */
export interface BookingConfirmationData {
  /** Human-readable booking reference shown in subject + body. */
  reservationId: string
  /**
   * Currency the amounts should be DISPLAYED in. Combined with `exchangeRate`:
   *  - Stripe path: breakdown numbers are USD, `exchangeRate` is the real rate.
   *  - PayPal path: numbers already in the charged currency, `exchangeRate` = 1.
   * Both format correctly via `formatMoney(value, currency, exchangeRate)`.
   * Defaults to USD when absent.
   */
  currency?: 'USD' | 'EUR'
  /** USD → target-currency rate used to display amounts. Defaults to 1. */
  exchangeRate?: number
  customer: {
    firstName: string
    lastName: string
    email: string
  }
  booking: {
    /** ISO `YYYY-MM-DD`. */
    checkIn: string
    /** ISO `YYYY-MM-DD`. */
    checkOut: string
    guests: number
    nights: number
  }
  breakdown: {
    villaSubtotal: number
    experiencesTotal: number
    cleaningFee: number
    total: number
    depositAmount: number
    balanceAmount: number
  }
  selectedExperiences: Array<{
    title: string
    quantity: number
  }>
}

/* ---------------------------------------------------------------------------
 * Reservation cancellation payload
 * ------------------------------------------------------------------------- */

/**
 * Data needed to render the guest-facing cancellation notice, dispatched when
 * an admin cancels a reservation from the back-office.
 */
export interface ReservationCancelledData {
  /** Human-readable booking reference. */
  reservationId: string
  customer: {
    firstName: string
    email: string
  }
  booking: {
    /** ISO `YYYY-MM-DD`. */
    checkIn: string
    /** ISO `YYYY-MM-DD`. */
    checkOut: string
  }
  /** Optional admin-provided reason, shown to the guest when present. */
  reason?: string | null
}

/* ---------------------------------------------------------------------------
 * Contact inquiry payload
 * ------------------------------------------------------------------------- */

/**
 * Validated payload that the `/api/contact` route receives from the
 * marketing contact form (Phase C4).
 *
 * Note on naming: the public form uses `fullName` rather than first/last,
 * to reduce friction. The `lib/contact` schema normalises it for us; this
 * type is the shape Resend templates consume.
 */
export interface ContactInquiryData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  travelDateFrom?: string
  travelDateTo?: string
  guests?: number
  message: string
}
