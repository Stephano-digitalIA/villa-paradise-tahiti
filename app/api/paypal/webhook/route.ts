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
 * Note on emailData reconstruction: we cannot stash arbitrary
 * metadata on a PayPal order — only `custom_id`, `reference_id`,
 * `invoice_id`, and `description`, all of which carry just the reservation
 * ref. The capture event therefore knows the amount and nothing else: no
 * dates, guest count, breakdown or customer name.
 *
 * We recover the rest from the `reservations` row the checkout route wrote
 * before redirecting to PayPal — one read (step 4) that also feeds the
 * date-blocking guard. When that row is missing we fall back to the bare
 * capture payload, which still names the reservation, the amount and the
 * payer email, so the owner is notified either way.
 */

import { NextResponse } from 'next/server'

import {
  sendBookingConfirmationGuest,
  sendBookingNotificationOwner,
  type BookingConfirmationData,
} from '@/lib/resend'
import { getPayPalOrder, verifyPayPalWebhook } from '@/lib/paypal'
import { checkAvailability } from '@/lib/booking/availability'
import { previousIsoDay } from '@/lib/booking/availability-client'
import { linkPaymentEventToReservation } from '@/lib/booking/payment-events'
import { adminClient } from '@/lib/supabase/admin'
import { SITE_URL } from '@/lib/seo'

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
    // The capture amount is already in the charged currency, so display it
    // as-is (exchangeRate 1 = no further conversion).
    currency: capture.amount?.currency_code === 'EUR' ? 'EUR' : 'USD',
    exchangeRate: 1,
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

/**
 * Columns needed to rebuild a full confirmation email from the persisted
 * reservation. Kept as a const so the `select()` string and the row type
 * below can't drift apart.
 */
const RESERVATION_EMAIL_COLUMNS =
  'check_in, check_out, num_guests, villa_subtotal, cleaning_fee, experiences_total, ' +
  'total, deposit_amount, balance_amount, display_currency, exchange_rate, ' +
  'selected_experiences, customers(first_name, last_name, email)'

interface ReservationEmailRow {
  check_in: string | null
  check_out: string | null
  num_guests: number | null
  villa_subtotal: number | null
  cleaning_fee: number | null
  experiences_total: number | null
  total: number | null
  deposit_amount: number | null
  balance_amount: number | null
  display_currency: string | null
  exchange_rate: number | null
  selected_experiences: Array<{ title?: string; quantity?: number }> | null
  customers: {
    first_name: string | null
    last_name: string | null
    email: string | null
  } | null
}

/** Whole nights between two ISO `YYYY-MM-DD` dates. 0 when either is absent. */
function nightsBetween(checkIn: string | null, checkOut: string | null): number {
  if (!checkIn || !checkOut) return 0
  const from = Date.parse(`${checkIn}T00:00:00Z`)
  const to = Date.parse(`${checkOut}T00:00:00Z`)
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return 0
  return Math.round((to - from) / 86_400_000)
}

/**
 * Build the confirmation email from the persisted reservation.
 *
 * PayPal cannot round-trip arbitrary metadata: the
 * only field that survives the redirect is `custom_id` (the reservation
 * ref). So rather than reading metadata back off the event, this one
 * reads the row the checkout route already wrote. Without it the guest
 * receives an email with blank dates and zeroed amounts.
 *
 * Money follows one contract: the breakdown stays
 * in canonical USD and `exchangeRate` carries the rate frozen at order
 * time, so `formatMoney` renders the guest's currency consistently with
 * what the checkout page showed.
 */
function buildEmailDataFromReservation(
  row: ReservationEmailRow,
  fallback: BookingConfirmationData,
): BookingConfirmationData {
  const customer = row.customers
  const currency = row.display_currency === 'EUR' ? 'EUR' : 'USD'

  return {
    reservationId: fallback.reservationId,
    currency,
    // The breakdown is canonical USD, so a rate only applies when the guest
    // is billed in EUR. Guarding here keeps a stray `exchange_rate` on a
    // USD reservation from inflating every amount in the email.
    exchangeRate: currency === 'EUR' ? (row.exchange_rate ?? 1) : 1,
    customer: {
      // The guest-checkout card flow gives PayPal no payer name, so the
      // checkout form is the better source — fall back to the capture.
      firstName: customer?.first_name || fallback.customer.firstName,
      lastName: customer?.last_name || fallback.customer.lastName,
      email: customer?.email || fallback.customer.email,
    },
    booking: {
      checkIn: row.check_in ?? '',
      checkOut: row.check_out ?? '',
      guests: row.num_guests ?? 0,
      nights: nightsBetween(row.check_in, row.check_out),
    },
    breakdown: {
      villaSubtotal: row.villa_subtotal ?? 0,
      experiencesTotal: row.experiences_total ?? 0,
      cleaningFee: row.cleaning_fee ?? 0,
      total: row.total ?? 0,
      depositAmount: row.deposit_amount ?? fallback.breakdown.depositAmount,
      balanceAmount: row.balance_amount ?? 0,
    },
    selectedExperiences: (row.selected_experiences ?? []).map((item) => ({
      title: item.title ?? '',
      quantity: item.quantity ?? 1,
    })),
  }
}

/* ---------------------------------------------------------------------------
 * Handler
 * ------------------------------------------------------------------------- */

/**
 * Settle a payment-plan instalment.
 *
 * Instalments 2 and 3 are paid from an emailed link, and their order carries
 * `REF#2` or `REF#3` as the reference. Instalment 1 rides the ordinary
 * checkout, so its reference is the plain booking ref and it is recognised by
 * sequence instead.
 *
 * Marking the row here rather than when the link is opened is deliberate: an
 * approval URL is not a payment, and a guest who abandons on PayPal must still
 * owe the money.
 *
 * Returns true when the whole plan is settled, so the caller can promote the
 * reservation to fully paid.
 */
async function settleInstalment(
  reservationRef: string,
  sequence: 1 | 2 | 3,
): Promise<boolean> {
  const { data: reservation } = await adminClient
    .from('reservations')
    .select('id')
    .eq('reservation_ref', reservationRef)
    .maybeSingle()
  if (!reservation?.id) return false

  await adminClient
    .from('payment_schedule')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('reservation_id', reservation.id)
    .eq('sequence', sequence)
    // Never re-settle a row: a webhook can be delivered more than once, and
    // the second delivery must not rewrite the date money actually arrived.
    .eq('status', 'pending')

  const { data: rows } = await adminClient
    .from('payment_schedule')
    .select('status')
    .eq('reservation_id', reservation.id)

  const all = (rows ?? []) as Array<{ status: string }>
  return all.length > 0 && all.every((r) => r.status === 'paid')
}

/**
 * The payment plan for the confirmation email, or undefined when the booking
 * was not paid in instalments. Each row carries its own payment link, so the
 * guest can pay ahead of the reminder if they wish.
 */
async function loadScheduleForEmail(
  reservationRef: string,
): Promise<BookingConfirmationData['schedule']> {
  const { data: reservation } = await adminClient
    .from('reservations')
    .select('id')
    .eq('reservation_ref', reservationRef)
    .maybeSingle()
  if (!reservation?.id) return undefined

  const { data: rows } = await adminClient
    .from('payment_schedule')
    .select('sequence, amount, due_date, status, pay_token')
    .eq('reservation_id', reservation.id)
    .order('sequence', { ascending: true })

  const plan = (rows ?? []) as Array<{
    sequence: number
    amount: number
    due_date: string
    status: 'pending' | 'paid' | 'cancelled'
    pay_token: string
  }>
  if (plan.length < 2) return undefined

  return plan.map((row) => ({
    sequence: row.sequence,
    amount: row.amount,
    dueDate: row.due_date,
    status: row.status,
    payUrl: `${SITE_URL}/booking/pay/${encodeURIComponent(row.pay_token)}`,
  }))
}

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
      const rawRef =
        enriched?.reservationId ?? capture.custom_id ?? capture.invoice_id ?? null

      // An instalment order carries `REF#2`. Split it back apart: the ref is
      // what every table keys on, the suffix says which instalment paid.
      const hashAt = rawRef?.indexOf('#') ?? -1
      const reservationRef =
        rawRef && hashAt > 0 ? rawRef.slice(0, hashAt) : rawRef
      // Only 1, 2 or 3 are real. Anything else in the suffix is a forged or
      // mangled reference and must not reach a query.
      const parsedSequence =
        rawRef && hashAt > 0 ? Number(rawRef.slice(hashAt + 1)) : null
      const instalmentSequence: 1 | 2 | 3 | null =
        parsedSequence === 1 || parsedSequence === 2 || parsedSequence === 3
          ? parsedSequence
          : null

      // Instalment 2 or 3: settle that row, and stop. The reservation was
      // already marked paid by instalment 1, and overwriting deposit_paid_at
      // with today's date would lose when the booking was actually secured.
      if (reservationRef && instalmentSequence) {
        try {
          const complete = await settleInstalment(reservationRef, instalmentSequence)
          if (complete) {
            await adminClient
              .from('reservations')
              .update({ payment_status: 'fully_paid' })
              .eq('reservation_ref', reservationRef)
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[paypal:webhook] instalment settle failed:', err)
        }
        return NextResponse.json({ received: true, instalment: instalmentSequence })
      }

      let emailData = buildEmailDataFromCapture(capture, enriched)

      // 3. Update reservation status
      if (reservationRef) {
        try {
          await adminClient
            .from('reservations')
            .update({
              payment_status: 'deposit_paid',
              deposit_paid_at: new Date().toISOString(),
              paypal_order_id: orderId ?? null,
              // Record what PayPal actually captured (currency + amount).
              display_currency: capture.amount?.currency_code ?? null,
              amount_charged_currency: capture.amount?.value
                ? Number(capture.amount.value)
                : null,
            })
            .eq('reservation_ref', reservationRef)

          // A plan's first instalment is paid through the ordinary checkout,
          // so this is where it gets settled. No-op when there is no plan.
          await settleInstalment(reservationRef, 1)
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[paypal:webhook] reservation update failed:', err)
        }

        // Backfill the event recorded in step 2, which ran before the
        // reservation was known. Without it the admin detail page shows
        // no payment events at all.
        await linkPaymentEventToReservation(event.id, reservationRef)
      }

      // 4. Recover the full booking from the reservation row, then block the
      //    dates. One read serves both: the capture event alone carries no
      //    dates, guest count or breakdown, so without this the guest gets a
      //    confirmation with blank dates and zeroed amounts.
      if (reservationRef) {
        try {
          const { data: res } = await adminClient
            .from('reservations')
            .select(RESERVATION_EMAIL_COLUMNS)
            .eq('reservation_ref', reservationRef)
            .maybeSingle<ReservationEmailRow>()

          if (res) {
            emailData = buildEmailDataFromReservation(res, emailData)
            emailData.schedule = await loadScheduleForEmail(reservationRef)
          } else {
            // eslint-disable-next-line no-console
            console.warn(
              '[paypal:webhook] reservation row not found — sending minimal email',
              { reservationRef },
            )
          }

          if (res?.check_in && res?.check_out) {
            // Final race guard.
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
                // `check_out` is exclusive (the guest leaves that morning)
                // while `blocked_to` is inclusive — store the last night
                // actually slept. The turnover days are added at read time.
                blocked_to: previousIsoDay(res.check_out),
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
