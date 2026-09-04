/**
 * POST /api/checkout — Phase E2.
 *
 * Creates the reservation, then hands the charge to PayPal.
 * Pipeline:
 *
 *   1. Parse + Zod-validate the payload (booking + customer).
 *   2. Recompute the price breakdown server-side using the live
 *      settings — **never trust client-supplied amounts**.
 *   3. Generate a reservation reference.
 *   4. Branch by `customer.paymentMethod`:
 *      - `paypal` → create an Orders v2 record, return the approve link.
 *   5. If the respective gateway isn't configured, fall back to the Phase
 *      D2 stub behaviour: pretend the booking succeeded and redirect the
 *      client straight to `/booking/success`. This keeps local dev /
 *      preview environments fully exercisable without real secrets.
 *
 * Response shapes (all 200 unless noted):
 *   - Real PayPal:   `{ url: approveUrl, orderId, reservationId, paymentMethod: 'paypal' }`
 *   - Mock fallback: `{ redirectUrl, reservationId, paymentMethod, mock: true }`
 *   - 400 / 422 / 500 on failure.
 *
 * Side effects to add later:
 *   - Persisting the reservation to Supabase
 *     before redirecting. Today the metadata is the source of truth and
 *     the webhook rebuilds the email payload from it.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { checkoutSchema } from '@/lib/booking/checkout-schema'
import {
  buildBookingMetadata,
  buildLineItems,
  computeBreakdown,
  generateReservationId,
  toPricingSettings,
  type BookingState,
} from '@/lib/booking'
import { checkAvailability } from '@/lib/booking/availability'
import { convertUsdToEur } from '@/lib/currency'
import { createPayPalOrder, isPayPalConfigured } from '@/lib/paypal'
import { cmsFetch } from '@/lib/cms/fetcher'
import {
  experiencesQuery,
  settingsQuery,
  type Experience,
  type Settings,
} from '@/lib/cms'
import { adminClient } from '@/lib/supabase/admin'

/* ---------------------------------------------------------------------------
 * Request schema
 * ------------------------------------------------------------------------- */

const bookingPayloadSchema = z.object({
  checkIn: z.string().nullable(),
  checkOut: z.string().nullable(),
  guests: z.number().int().min(1).max(20),
  selectedExperiences: z
    .array(
      z.object({
        slug: z.string(),
        title: z.string(),
        priceUSD: z.number().nonnegative(),
        priceUnit: z.enum(['per_person', 'per_group', 'flat']),
        quantity: z.number().int().min(1),
      }),
    )
    .default([]),
  specialRequests: z.string().optional(),
})

const requestSchema = z.object({
  booking: bookingPayloadSchema,
  customer: checkoutSchema,
  // The visitor's chosen display currency becomes the charge currency. The
  // exchange rate is NEVER accepted from the client — it is read server-side
  // from settings. Defaults to USD for older clients that don't send it.
  currency: z.enum(['USD', 'EUR']).default('USD'),
})

/* ---------------------------------------------------------------------------
 * Handler
 * ------------------------------------------------------------------------- */

export const runtime = 'nodejs'

/**
 * Mock checkout — faking a paid reservation and jumping straight to
 * /booking/success — is ONLY acceptable off the live site (local `npm run
 * dev`). On any production build an unconfigured gateway must surface an error
 * instead, so a visitor can never "confirm" a booking that was never paid for.
 */
function mockCheckoutAllowed(): boolean {
  return process.env.NODE_ENV !== 'production'
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid checkout payload.', issues: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const { booking, customer, currency } = parsed.data

  // Build the canonical BookingState the pricing engine consumes.
  const state: BookingState = {
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    selectedExperiences: booking.selectedExperiences,
    specialRequests: booking.specialRequests ?? customer.specialRequests ?? undefined,
  }

  // Re-compute breakdown SERVER-SIDE — never trust client amounts.
  let settings: Settings | null = null
  let experienceCatalog: Experience[] = []
  try {
    settings = await cmsFetch<Settings | null>(settingsQuery, {}, { revalidate: 60 })
    experienceCatalog = (await cmsFetch<Experience[] | null>(
      experiencesQuery,
      {},
      { revalidate: 60 },
    )) ?? []
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/checkout] settings fetch failed', err)
    // Continue — `toPricingSettings` handles a null settings gracefully
    // and the catalog is only used for enrichment of line items.
  }

  const breakdown = computeBreakdown(state, toPricingSettings(settings))

  if (!breakdown.meetsMinNights || breakdown.nights <= 0) {
    return NextResponse.json(
      {
        error: `Invalid stay length — minimum ${breakdown.minNights} nights required.`,
      },
      { status: 422 },
    )
  }

  // Block last-minute reservations — must book at least 5 days before check-in.
  if (breakdown.daysUntilCheckIn !== null && breakdown.daysUntilCheckIn < 2) {
    return NextResponse.json(
      { error: 'Reservations must be made at least 2 days before check-in.' },
      { status: 422 },
    )
  }

  /* ----- Availability guard (race-condition safe) ------------------- */
  // Refuse the booking if the [checkIn, checkOut) range overlaps anything
  // already in blocked_dates (Airbnb, owner, maintenance, prior direct
  // bookings) OR a pending reservation. Runs BEFORE we insert a pending
  // row of our own, so two simultaneous checkouts can't both succeed.
  if (booking.checkIn && booking.checkOut) {
    try {
      const availability = await checkAvailability(booking.checkIn, booking.checkOut)
      if (!availability.ok) {
        return NextResponse.json(
          {
            error: 'These dates are no longer available.',
            conflicts: availability.conflicts.map((c) => ({
              from: c.from,
              to: c.to,
              source: c.source,
            })),
          },
          { status: 409 },
        )
      }
    } catch (err) {
      // Fail closed — if we can't verify, deny rather than risk a double-booking.
      // eslint-disable-next-line no-console
      console.error('[api/checkout] availability check failed', err)
      return NextResponse.json(
        { error: 'Could not verify availability — please try again.' },
        { status: 503 },
      )
    }
  }

  // Determine the actual amount to charge today based on paymentOption.
  const { paymentOption, customAmountUSD } = customer
  let chargeAmount: number
  let paymentLabel: string

  if (paymentOption === 'full') {
    chargeAmount = breakdown.total
    paymentLabel = 'Full Payment'
  } else if (paymentOption === 'custom') {
    if (
      !customAmountUSD ||
      customAmountUSD < breakdown.depositAmount ||
      customAmountUSD > breakdown.total
    ) {
      return NextResponse.json(
        {
          error: `Custom amount must be between ${breakdown.depositAmount.toFixed(2)} and ${breakdown.total.toFixed(2)}.`,
        },
        { status: 422 },
      )
    }
    chargeAmount = customAmountUSD
    paymentLabel = 'Custom Payment'
  } else {
    chargeAmount = breakdown.depositAmount
    paymentLabel = 'Booking Deposit (30%)'
  }

  if (chargeAmount <= 0) {
    return NextResponse.json(
      { error: 'Charge amount is zero — booking refused.' },
      { status: 422 },
    )
  }

  // Currency conversion — server-authoritative. The pricing engine and the
  // stored ledger stay in USD; when the guest picked EUR we convert the amount
  // to actually charge at the admin-managed rate (read from settings, never
  // from the client). This is the ONLY place the charge currency is derived.
  const exchangeRate = settings?.usdToEurRate ?? 0.88
  const chargeAmountCurrency =
    currency === 'EUR' ? convertUsdToEur(chargeAmount, exchangeRate) : chargeAmount

  const reservationId = generateReservationId()
  const lineItems = buildLineItems(state, breakdown, experienceCatalog)
  const metadata = {
    ...buildBookingMetadata(state, customer, breakdown),
    reservationId,
  }

  // Both visible options are settled by PayPal. "Credit / debit card" exists
  // as its own choice because PayPal's guest checkout takes a card without an
  // account, and a guest who has no PayPal account needs to see that before
  // committing. The distinction is presentational; the processor is one.

  /* ----- Persist to DB (best-effort — never blocks checkout) ------------ */
  try {
    // UPSERT customer — email is the unique identifier
    const { data: customerRow } = await adminClient
      .from('customers')
      .upsert(
        {
          email: customer.email,
          first_name: customer.firstName,
          last_name: customer.lastName,
          phone: customer.phone ?? null,
          country: customer.country ?? null,
          city: customer.city ?? null,
          zip_code: customer.zipCode ?? null,
          accept_marketing: customer.acceptMarketing ?? false,
        },
        { onConflict: 'email' },
      )
      .select('id')
      .single()

    // INSERT reservation with status "pending"
    const { error: insertErr } = await adminClient.from('reservations').insert({
      reservation_ref: reservationId,
      customer_id: customerRow?.id ?? null,
      check_in: booking.checkIn!,
      check_out: booking.checkOut!,
      num_guests: booking.guests,
      special_requests: state.specialRequests ?? null,
      arrival_flight: customer.arrivalFlight ?? null,
      departure_flight: customer.departureFlight ?? null,
      nightly_rate_usd: breakdown.nightlyRate,
      season: breakdown.season,
      villa_subtotal: breakdown.villaSubtotal,
      cleaning_fee: breakdown.cleaningFee,
      experiences_total: breakdown.experiencesTotal,
      subtotal: breakdown.subtotal,
      long_stay_discount: breakdown.longStayDiscount,
      taxes: breakdown.taxes,
      total: breakdown.total,
      deposit_amount: chargeAmount,
      balance_amount: breakdown.total - chargeAmount,
      selected_experiences: booking.selectedExperiences as unknown as import('@/lib/supabase/types').SelectedExperienceSnapshot[],
      // The option the guest picked. The processor is always PayPal now, and
      // the currency columns below already record the charge side.
      payment_method: customer.paymentMethod,
      payment_status: 'pending',
      // Currency ledger: USD columns above stay canonical; these record what
      // the guest is actually charged and at which frozen rate.
      display_currency: currency,
      exchange_rate: currency === 'EUR' ? exchangeRate : null,
      amount_charged_currency: chargeAmountCurrency,
    })

    if (insertErr) {
      // eslint-disable-next-line no-console
      console.error('[api/checkout] reservation insert failed', { reservationId, error: insertErr })
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/checkout] supabase persist failed:', err)
    // Continue — DB failure must not block checkout
  }

  /* ----- PayPal branch (settles both visible options) ------------------- */
  {
    if (!isPayPalConfigured()) {
      if (mockCheckoutAllowed()) {
        return NextResponse.json({
          reservationId,
          redirectUrl: `/booking/success?ref=${encodeURIComponent(reservationId)}`,
          paymentMethod: 'paypal' as const,
          mock: true,
        })
      }
      return NextResponse.json(
        {
          error:
            'Online payment is temporarily unavailable. Please try again shortly or contact us to complete your booking.',
        },
        { status: 503 },
      )
    }

    const result = await createPayPalOrder({
      reservationId,
      chargeAmount: chargeAmountCurrency,
      currency,
      paymentLabel,
      customer: { email: customer.email },
      metadata,
    })
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({
      url: result.approveUrl,
      orderId: result.orderId,
      reservationId,
      paymentMethod: 'paypal' as const,
    })
  }

  // Defensive — the Zod enum should have caught this.
  return NextResponse.json({ error: 'Unknown payment method.' }, { status: 400 })
}
