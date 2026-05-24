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
