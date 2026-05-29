/**
 * Stripe Checkout Session builder — Villa Paradise Tahiti (Phase E2).
 *
 * Single entry point used by `/api/checkout` to create a hosted Checkout
 * Session. Returns either a `{ url, sessionId }` envelope for the client
 * to redirect into, or an `{ error }` envelope for the route to forward
 * as a 5xx response — we never throw across the boundary.
 *
 * Important business choice — **single deposit line item**:
 *  - We charge 30% of the total at booking, balance due 30 days before
 *    arrival (cf. `docs/04-fonctionnalites.md §Paiement`).
 *  - Stripe Checkout's UI shows the line item list directly to the
 *    customer. If we listed every nightly fee × experience and then
 *    discounted to 30% via Stripe Coupons, the receipt would be confusing.
 *  - Cleaner UX: a single line called
 *    "Villa Paradise Tahiti — Booking Deposit (30%)" with `unit_amount`
 *    equal to the deposit. The full breakdown is still emailed by Phase E1
 *    (the deposit/balance split is rendered explicitly there).
 *
 * Metadata: we forward the entire booking metadata so the webhook can
 * reconstruct the email payload without a database round-trip.
 */

import type Stripe from 'stripe'

import type { BookingState, PriceBreakdown } from '@/lib/booking'

import { stripe } from './client'
import type { ReservationLineItem } from '@/lib/booking'

/**
 * Read the public site URL with a hard-coded production fallback so the
 * Stripe redirect targets stay valid even when the dev forgot to set it.
 */
function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (raw && raw.length > 0) return raw.replace(/\/$/, '')
  return 'https://villaparadisetahiti.com'
}

export interface CreateStripeSessionParams {
  reservationId: string
  customer: {
    email: string
    firstName: string
    lastName: string
  }
  booking: BookingState
  breakdown: PriceBreakdown
  /** Full line items — kept on the params for forward-compat / tests, but
   *  only used to derive a single deposit line in the actual session today. */
  lineItems: ReservationLineItem[]
  metadata: Record<string, string>
  /** Actual amount charged today (may differ from breakdown.depositAmount). */
  chargeAmountUSD: number
  /** Human-readable label shown in the Stripe Checkout line item name. */
  paymentLabel: string
}

export type CreateStripeSessionResult =
  | { url: string; sessionId: string }
  | { error: string }

/**
 * Create a Stripe Checkout Session for the deposit and return the URL the
 * client should be redirected to.
 */
export async function createStripeCheckoutSession(
  params: CreateStripeSessionParams,
): Promise<CreateStripeSessionResult> {
  if (!stripe) {
    return { error: 'Stripe is not configured on the server.' }
  }

  const { reservationId, customer, breakdown, metadata, chargeAmountUSD, paymentLabel } = params

  if (!chargeAmountUSD || chargeAmountUSD <= 0) {
    return { error: 'Charge amount is zero — refusing to create session.' }
  }

  const siteUrl = getSiteUrl()

  // Stripe wants integer minor units (cents for USD).
  const chargeCents = Math.round(chargeAmountUSD * 100)
  const totalCents = Math.round(breakdown.total * 100)
  const balanceDue = Math.max(0, breakdown.total - chargeAmountUSD)

  const stayLabel =
    breakdown.nights > 0
      ? `${breakdown.nights} night${breakdown.nights > 1 ? 's' : ''} • ${customer.firstName} ${customer.lastName}`
      : `${customer.firstName} ${customer.lastName}`

  const balanceNote =
    balanceDue > 0
      ? `Balance $${balanceDue.toFixed(2)} due 30 days before arrival`
      : 'No balance remaining'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customer.email,
      // Single charge line item — full breakdown is in the confirmation email.
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: chargeCents,
            product_data: {
              name: `Villa Paradise Tahiti — ${paymentLabel}`,
              description: `Reservation ${reservationId} • ${stayLabel} • Stay total $${breakdown.total.toFixed(2)} • ${balanceNote}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&ref=${encodeURIComponent(reservationId)}`,
      cancel_url: `${siteUrl}/booking/cancel?session_id={CHECKOUT_SESSION_ID}&ref=${encodeURIComponent(reservationId)}`,
      metadata: {
        ...metadata,
        reservationId,
        chargeAmount: String(chargeAmountUSD),
        totalDue: String(breakdown.total),
        balanceDue: String(balanceDue),
        totalCents: String(totalCents),
      },
      // The deposit description is a "what they pay now" reminder, but we
      // also surface the booking ref to the customer's bank statement.
      payment_intent_data: {
        description: `Villa Paradise Tahiti — Reservation ${reservationId}`,
        metadata: {
          reservationId,
        },
      },
      // Stripe's hosted "Submit feedback" widget is overkill for us;
      // keep the page minimal.
      billing_address_collection: 'auto',
      locale: 'en',
    } satisfies Stripe.Checkout.SessionCreateParams)

    if (!session.url) {
      return { error: 'Stripe returned a session without a checkout URL.' }
    }

    return { url: session.url, sessionId: session.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // eslint-disable-next-line no-console
    console.error('[stripe:create-session]', message)
    return { error: `Stripe session creation failed: ${message}` }
  }
}
