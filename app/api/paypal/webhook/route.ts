/**
 * POST /api/paypal/webhook — Phase E2.
 *
 * Endpoint PayPal calls on order lifecycle events. We process:
 *
 *   - `PAYMENT.CAPTURE.COMPLETED`  → deposit captured. Triggers guest +
 *     owner confirmation emails (Phase E1).
 *   - `CHECKOUT.ORDER.APPROVED`    → user approved but funds not yet
 *     captured. Log only — the `/api/paypal/capture` route handles the
 *     funds movement.
 *   - `PAYMENT.CAPTURE.DENIED`     → log only (TODO: alert).
 *
 * Note on emailData reconstruction: unlike Stripe we cannot stash arbitrary
 * metadata on a PayPal order — only `custom_id`, `reference_id`,
 * `invoice_id`, and `description`. All three carry the reservation id, but
 * we don't have the customer name, breakdown, etc. server-side without a
 * persistent store.
 *
 * Phase E2 mitigation: we send a **degraded** owner notification (still
 * mentions the reservation id + amount + payer email) and SKIP the guest
 * confirmation when we don't have the full data. The webhook event from
 * PayPal **does** include the payer's email, so the owner notification can
 * be sent reliably. Phase F will persist the booking up-front so the
 * webhook can recover the full payload.
 */

import { NextResponse } from 'next/server'

import {
  sendBookingConfirmationGuest,
  sendBookingNotificationOwner,
  type BookingConfirmationData,
} from '@/lib/resend'
import { getPayPalOrder, verifyPayPalWebhook } from '@/lib/paypal'
import { checkAvailability } from '@/lib/booking/availability'
import { adminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

/** Extract a human-readable error string from a failed EmailResult. */
function emailErrorMessage(result: { ok: false; reason: string; message?: string }): string {
  return result.message ?? result.reason
}

interface CaptureResource {
  id?: string
  status?: string
  amount?: {
    currency_code?: string
    value?: string
  }
  custom_id?: string
  invoice_id?: string
  supplementary_data?: {
    related_ids?: {
      order_id?: string
    }
  }
  payer?: {
    email_address?: string
    name?: {
      given_name?: string
      surname?: string
    }
  }
  payee?: { email_address?: string }
}

/**
 * Best-effort: build the email payload from the webhook resource + an
 * optional order lookup. Many fields fall back to safe defaults — the
 * email templates already handle empty strings gracefully.
 */
function buildEmailDataFromCapture(
  capture: CaptureResource,
  enriched?: {
    customerEmail?: string
    depositAmountUSD?: number
    reservationId?: string
  },
): BookingConfirmationData {
  const reservationId =
    enriched?.reservationId ?? capture.custom_id ?? capture.invoice_id ?? 'UNKNOWN'

  const depositAmount =
    enriched?.depositAmountUSD ??
    (capture.amount?.value ? Number(capture.amount.value) : 0)

  return {
    reservationId,
    customer: {
      firstName: capture.payer?.name?.given_name ?? 'Guest',
      lastName: capture.payer?.name?.surname ?? '',
      email: capture.payer?.email_address ?? enriched?.customerEmail ?? '',
    },
    booking: {
      // Unknown from a bare capture event — Phase F will recover from a
      // persistent store. The email template hides empty rows gracefully.
      checkIn: '',
      checkOut: '',
      guests: 0,
      nights: 0,
    },
    breakdown: {
      villaSubtotal: 0,
      experiencesTotal: 0,
      cleaningFee: 0,
      total: 0,
      depositAmount,
      balanceAmount: 0,
    },
    selectedExperiences: [],
  }
}

/* ---------------------------------------------------------------------------
 * Handler
 * ------------------------------------------------------------------------- */

export async function POST(request: Request) {
  const { event, verified } = await verifyPayPalWebhook(request)

  if (!event) {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 })
  }

  // In production we MUST refuse unverified events. In dev / preview the
  // operator may not have set `PAYPAL_WEBHOOK_ID` yet — we still log and
  // return 200 so PayPal's "test event" feature doesn't spam.
  if (!verified) {
    // eslint-disable-next-line no-console
    console.warn('[paypal:webhook] event NOT verified — refusing to act', {
      id: event.id,
      type: event.event_type,
    })
    return NextResponse.json({ received: true, verified: false })
  }

  // eslint-disable-next-line no-console
  console.info('[paypal:webhook] received', {
    id: event.id,
    type: event.event_type,
  })

  switch (event.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED': {
      const capture = (event.resource ?? {}) as CaptureResource
      const orderId = capture.supplementary_data?.related_ids?.order_id

      // 1. Idempotence check — return early if this event was already processed
      if (event.id) {
        try {
          const { data: existing } = await adminClient
            .from('payment_events')
            .select('id')
            .eq('event_id', event.id)
            .maybeSingle()

          if (existing) {
            // eslint-disable-next-line no-console
            console.info('[paypal:webhook] duplicate event — already processed', { id: event.id })
            return NextResponse.json({ received: true, verified: true, idempotent: true })
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[paypal:webhook] idempotence check failed:', err)
        }
      }

      // 2. Insert payment event record (before any side-effects)
      try {
        await adminClient.from('payment_events').insert({
          event_id: event.id ?? `paypal-${Date.now()}`,
          event_type: event.event_type ?? event.event_type ?? 'PAYMENT.CAPTURE.COMPLETED',
          reservation_id: null,
          payload: (event.resource ?? null) as Record<string, unknown> | null,
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[paypal:webhook] payment_events insert failed:', err)
      }

      let enriched:
        | { customerEmail?: string; depositAmountUSD?: number; reservationId?: string }
        | undefined

      if (orderId) {
        const order = await getPayPalOrder(orderId)
        if (!('error' in order)) {
          enriched = {
            customerEmail: order.customerEmail,
            depositAmountUSD: order.depositAmountUSD,
            reservationId: order.reservationId,
          }
        }
      }

      // Resolve the reservationRef from enriched lookup or capture fields
      // PayPal carries it in purchase_units[0].custom_id (mapped to capture.custom_id)
      const reservationRef =
        enriched?.reservationId ?? capture.custom_id ?? capture.invoice_id ?? null

      const emailData = buildEmailDataFromCapture(capture, enriched)

      // 3. Update reservation status
      if (reservationRef) {
        try {
          await adminClient
            .from('reservations')
            .update({
              payment_status: 'deposit_paid',
              deposit_paid_at: new Date().toISOString(),
              paypal_order_id: orderId ?? null,
            })
            .eq('reservation_ref', reservationRef)
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[paypal:webhook] reservation update failed:', err)
        }
      }

      // 4. Block dates — requires check_in / check_out from the reservation row
      if (reservationRef) {
        try {
          const { data: res } = await adminClient
            .from('reservations')
            .select('check_in, check_out')
            .eq('reservation_ref', reservationRef)
            .maybeSingle()

          if (res?.check_in && res?.check_out) {
            // Final race guard — same logic as the Stripe webhook.
            const availability = await checkAvailability(res.check_in, res.check_out, {
              excludeReservationRef: reservationRef,
            })

            if (!availability.ok) {
              // eslint-disable-next-line no-console
              console.error(
                '[paypal:webhook] CRITICAL: race-condition double-booking detected — payment captured but dates conflict',
                {
                  reservationRef,
                  conflicts: availability.conflicts,
                },
              )
              await adminClient
                .from('reservations')
                .update({
                  internal_notes:
                    `[CONFLICT-REVIEW] Race-condition double booking. ` +
                    `Conflicts: ${availability.conflicts.map((c) => `${c.label} (${c.from} → ${c.to})`).join('; ')}`,
                })
                .eq('reservation_ref', reservationRef)
            } else {
              await adminClient.from('blocked_dates').insert({
                blocked_from: res.check_in,
                blocked_to: res.check_out,
                reason: `Booking ${reservationRef}`,
                source: 'direct_booking',
                source_ref: reservationRef,
                reservation_id: null,
              })
            }
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[paypal:webhook] blocked_dates insert failed:', err)
        }
      }

      // 5. Send confirmation emails — guest only when we have an address
      const ownerPromise = sendBookingNotificationOwner({ ...emailData, paymentMethod: 'paypal' })
      const guestPromise = emailData.customer.email
        ? sendBookingConfirmationGuest(emailData)
        : Promise.resolve({ ok: false as const, reason: 'no_email' })

      const [ownerResult, guestResult] = await Promise.allSettled([ownerPromise, guestPromise])

      // eslint-disable-next-line no-console
      console.info('[paypal:webhook] emails dispatched', {
        reservationId: emailData.reservationId,
        owner: ownerResult.status,
        guest: guestResult.status,
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

            if (guestResult.status === 'fulfilled' && emailData.customer.email) {
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

            if (logs.length > 0) {
              await adminClient.from('email_logs').insert(logs)
            }
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[paypal:webhook] email_logs insert failed:', err)
        }
      }

      break
    }

    case 'CHECKOUT.ORDER.APPROVED': {
      // eslint-disable-next-line no-console
      console.info('[paypal:webhook] order approved (capture pending)', {
        id: event.id,
      })
      break
    }

    case 'PAYMENT.CAPTURE.DENIED':
    case 'PAYMENT.CAPTURE.DECLINED': {
      // eslint-disable-next-line no-console
      console.warn('[paypal:webhook] capture denied/declined', { id: event.id })
      // TODO: alert owner / surface in admin dashboard.
      break
    }

    default:
      // Acknowledge unknown event types to stop PayPal's retry loop.
      break
  }

  return NextResponse.json({ received: true, verified: true })
}
