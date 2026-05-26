/**
 * POST /api/stripe/webhook — Phase E2.
 *
 * Endpoint Stripe calls on lifecycle events. We process:
 *
 *   - `checkout.session.completed`        → deposit successfully charged.
 *     Triggers guest + owner confirmation emails (Phase E1).
 *   - `checkout.session.async_payment_succeeded`  → same, for async methods.
 *   - `checkout.session.expired`          → log only (TODO: cleanup).
 *   - `payment_intent.payment_failed`     → log only (TODO: alert).
 *
 * Requirements:
 *   - Must run on **Node.js runtime** (Edge can't do the HMAC).
 *   - Reads raw body via `req.text()` BEFORE any JSON parsing — the SDK
 *     verifies the signature against the exact byte stream.
 *   - Idempotency: not implemented in Phase E2 (no persistent store).
 *     Stripe retries 3× on 5xx. A duplicate event today re-sends both
 *     emails. Tracked as TODO in the dispatch comment below.
 *
 * Response contract:
 *   - 200 `{ received: true }` on any verified event (even ones we don't
 *     handle) — Stripe stops retrying.
 *   - 400 on signature verification failure — Stripe will retry.
 *   - 503 if Stripe isn't configured at all — Stripe will retry, but the
 *     site operator should not have wired the webhook URL in the dashboard
 *     before configuring secrets.
 */

import type Stripe from 'stripe'
import { NextResponse } from 'next/server'

import { parseExperiencesMetadata } from '@/lib/booking'
import {
  sendBookingConfirmationGuest,
  sendBookingNotificationOwner,
  type BookingConfirmationData,
} from '@/lib/resend'
import { isStripeConfigured, verifyStripeWebhook } from '@/lib/stripe'
import { adminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
// Disable Next.js' automatic body parsing — we need the raw bytes for HMAC.
export const dynamic = 'force-dynamic'

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

/** Extract a human-readable error string from a failed EmailResult. */
function emailErrorMessage(result: { ok: false; reason: string; message?: string }): string {
  return result.message ?? result.reason
}

/**
 * Safely parse a numeric metadata value, defaulting to 0 on missing /
 * malformed input so the email still renders with explicit zeros rather
 * than `NaN` / `undefined`.
 */
function num(raw: string | undefined): number {
  if (!raw) return 0
  const value = Number(raw)
  return Number.isFinite(value) ? value : 0
}

/**
 * Reconstruct the Phase E1 email payload from the session metadata. The
 * metadata is the source of truth in Phase E2 — until we add a persistent
 * reservation store, this is what makes the round-trip work.
 */
function buildEmailData(session: Stripe.Checkout.Session): BookingConfirmationData {
  const meta = session.metadata ?? {}
  return {
    reservationId: meta.reservationId ?? 'UNKNOWN',
    customer: {
      firstName: meta.firstName ?? 'Guest',
      lastName: meta.lastName ?? '',
      email: session.customer_email ?? meta.email ?? '',
    },
    booking: {
      checkIn: meta.checkIn ?? '',
      checkOut: meta.checkOut ?? '',
      guests: num(meta.guests),
      nights: num(meta.nights),
    },
    breakdown: {
      villaSubtotal: num(meta.villaSubtotal),
      experiencesTotal: num(meta.experiencesTotal),
      cleaningFee: num(meta.cleaningFee),
      total: num(meta.total),
      depositAmount: num(meta.depositAmount),
      balanceAmount: num(meta.balanceAmount),
    },
    selectedExperiences: parseExperiencesMetadata(meta.experiences),
    accessToken: meta.accessToken,
  }
}

/* ---------------------------------------------------------------------------
 * Handler
 * ------------------------------------------------------------------------- */

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    // The webhook should never be hit if the secrets aren't set. Tell
    // Stripe to retry so the operator notices in the dashboard.
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 })
  }

  const event = await verifyStripeWebhook(request)
  if (!event) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  // eslint-disable-next-line no-console
  console.info('[stripe:webhook] received', { id: event.id, type: event.type })

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session

      // Defensive — only act when payment actually went through.
      if (
        session.payment_status !== 'paid' &&
        session.payment_status !== 'no_payment_required'
      ) {
        // eslint-disable-next-line no-console
        console.info('[stripe:webhook] session not paid yet — skipping emails', {
          id: session.id,
          status: session.payment_status,
        })
        break
      }

      // 1. Idempotence check — return early if this event was already processed
      try {
        const { data: existing } = await adminClient
          .from('payment_events')
          .select('id')
          .eq('event_id', event.id)
          .maybeSingle()

        if (existing) {
          // eslint-disable-next-line no-console
          console.info('[stripe:webhook] duplicate event — already processed', { id: event.id })
          return NextResponse.json({ received: true, idempotent: true })
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[stripe:webhook] idempotence check failed:', err)
        // Continue processing — a failed check is not a reason to skip the emails
      }

      // 2. Insert payment event record (before any side-effects)
      try {
        await adminClient.from('payment_events').insert({
          event_id: event.id,
          event_type: event.type,
          reservation_id: null,
          payload: event.data.object as unknown as Record<string, unknown>,
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[stripe:webhook] payment_events insert failed:', err)
      }

      const metadata = session.metadata ?? {}
      const reservationRef = metadata.reservationId

      // 3. Update reservation status + 4. Block dates
      if (reservationRef) {
        try {
          await adminClient
            .from('reservations')
            .update({
              payment_status: 'deposit_paid',
              deposit_paid_at: new Date().toISOString(),
              stripe_session_id: session.id,
            })
            .eq('reservation_ref', reservationRef)
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[stripe:webhook] reservation update failed:', err)
        }

        if (metadata.checkIn && metadata.checkOut) {
          try {
            await adminClient.from('blocked_dates').insert({
              blocked_from: metadata.checkIn,
              blocked_to: metadata.checkOut,
              reason: `Booking ${reservationRef}`,
              source: 'direct_booking',
              source_ref: reservationRef,
              reservation_id: null,
            })
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[stripe:webhook] blocked_dates insert failed:', err)
          }
        }
      }

      const emailData = buildEmailData(session)

      // 5. Send confirmation emails
      const [guestResult, ownerResult] = await Promise.allSettled([
        sendBookingConfirmationGuest(emailData),
        sendBookingNotificationOwner({ ...emailData, paymentMethod: 'stripe' }),
      ])

      // eslint-disable-next-line no-console
      console.info('[stripe:webhook] emails dispatched', {
        reservationId: emailData.reservationId,
        guest: guestResult.status,
        owner: ownerResult.status,
      })

      // 6. Log email outcomes
      if (reservationRef) {
        try {
          const { data: res } = await adminClient
            .from('reservations')
            .select('id')
            .eq('reservation_ref', reservationRef)
            .maybeSingle()

          if (res) {
            const logs: Array<{
              reservation_id: string
              email_type: string
              recipient_email: string
              status: 'sent' | 'failed'
              resend_message_id: string | null
              error_message: string | null
            }> = []

            if (guestResult.status === 'fulfilled') {
              logs.push({
                reservation_id: res.id,
                email_type: 'booking_confirmation_guest',
                recipient_email: emailData.customer.email,
                status: guestResult.value.ok ? 'sent' : 'failed',
                resend_message_id: guestResult.value.ok ? guestResult.value.id : null,
                error_message: !guestResult.value.ok
                  ? emailErrorMessage(guestResult.value)
                  : null,
              })
            }

            if (ownerResult.status === 'fulfilled') {
              logs.push({
                reservation_id: res.id,
                email_type: 'booking_notification_owner',
                recipient_email: process.env.EMAIL_OWNER ?? process.env.RESEND_OWNER_EMAIL ?? '',
                status: ownerResult.value.ok ? 'sent' : 'failed',
                resend_message_id: ownerResult.value.ok ? ownerResult.value.id : null,
                error_message: !ownerResult.value.ok
                  ? emailErrorMessage(ownerResult.value)
                  : null,
              })
            }

            if (logs.length > 0) {
              await adminClient.from('email_logs').insert(logs)
            }
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[stripe:webhook] email_logs insert failed:', err)
        }
      }

      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      // eslint-disable-next-line no-console
      console.info('[stripe:webhook] session expired', { id: session.id })
      // TODO: surface in an "abandoned cart" report or release a pending hold.
      break
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent
      // eslint-disable-next-line no-console
      console.warn('[stripe:webhook] payment intent failed', {
        id: intent.id,
        lastError: intent.last_payment_error?.message,
      })
      break
    }

    default:
      // Quietly acknowledge events we don't yet handle. Stripe stops
      // retrying as long as we return 2xx — no log noise needed.
      break
  }

  return NextResponse.json({ received: true })
}
