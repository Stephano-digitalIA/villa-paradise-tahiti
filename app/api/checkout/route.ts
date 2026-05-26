/**
 * POST /api/checkout — Phase E2.
 *
 * Replaces the Phase D2 stub with a real Stripe / PayPal orchestration.
 * Pipeline:
 *
 *   1. Parse + Zod-validate the payload (booking + customer).
 *   2. Recompute the price breakdown server-side using the live Sanity
 *      settings — **never trust client-supplied amounts**.
 *   3. Generate a reservation reference.
 *   4. Branch by `customer.paymentMethod`:
 *      - `stripe` → create a hosted Checkout Session, return its URL.
 *      - `paypal` → create an Orders v2 record, return the approve link.
 *   5. If the respective gateway isn't configured, fall back to the Phase
 *      D2 stub behaviour: pretend the booking succeeded and redirect the
 *      client straight to `/booking/success`. This keeps local dev /
 *      preview environments fully exercisable without real secrets.
 *
 * Response shapes (all 200 unless noted):
 *   - Real Stripe:   `{ url, sessionId, reservationId, paymentMethod: 'stripe' }`
 *   - Real PayPal:   `{ url: approveUrl, orderId, reservationId, paymentMethod: 'paypal' }`
 *   - Mock fallback: `{ redirectUrl, reservationId, paymentMethod, mock: true }`
 *   - 400 / 422 / 500 on failure.
 *
 * Side effects to add later:
 *   - Persisting the reservation to a real store (Sanity, Airtable, DB)
 *     before redirecting. Today the metadata is the source of truth and
 *     the webhook rebuilds the email payload from it.
 */

import crypto from 'crypto'

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
import { createStripeCheckoutSession, isStripeConfigured } from '@/lib/stripe'
import { createPayPalOrder, isPayPalConfigured } from '@/lib/paypal'
import { sanityFetch } from '@/lib/sanity/fetcher'
import {
  experiencesQuery,
  settingsQuery,
  type Experience,
  type Settings,
} from '@/lib/sanity'
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
})

/* ---------------------------------------------------------------------------
 * Handler
 * ------------------------------------------------------------------------- */

export const runtime = 'nodejs'

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

  const { booking, customer } = parsed.data

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
    settings = await sanityFetch<Settings | null>(settingsQuery, {}, { revalidate: 60 })
    experienceCatalog = (await sanityFetch<Experience[] | null>(
      experiencesQuery,
      {},
      { revalidate: 60 },
    )) ?? []
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/checkout] sanity fetch failed', err)
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

  if (breakdown.depositAmount <= 0) {
    return NextResponse.json(
      { error: 'Computed deposit amount is zero — booking refused.' },
      { status: 422 },
    )
  }

  const reservationId = generateReservationId()
  const accessToken = crypto.randomBytes(32).toString('hex')
  const lineItems = buildLineItems(state, breakdown, experienceCatalog)
  const metadata = {
    ...buildBookingMetadata(state, customer, breakdown),
    reservationId,
    accessToken,
  }

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
      taxes: breakdown.taxes,
      total: breakdown.total,
      deposit_amount: breakdown.depositAmount,
      balance_amount: breakdown.balanceAmount,
      selected_experiences: booking.selectedExperiences as unknown as import('@/lib/supabase/types').SelectedExperienceSnapshot[],
      payment_method: customer.paymentMethod,
      payment_status: 'pending',
      access_token: accessToken,
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

  /* ----- Stripe branch -------------------------------------------------- */
  if (customer.paymentMethod === 'stripe') {
    if (!isStripeConfigured()) {
      // Mock fallback — preserves the Phase D2 behaviour for dev/preview.
      return NextResponse.json({
        reservationId,
        redirectUrl: `/booking/success?ref=${encodeURIComponent(reservationId)}`,
        paymentMethod: 'stripe' as const,
        mock: true,
      })
    }

    const result = await createStripeCheckoutSession({
      reservationId,
      customer,
      booking: state,
      breakdown,
      lineItems,
      metadata,
    })
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({
      url: result.url,
      sessionId: result.sessionId,
      reservationId,
      paymentMethod: 'stripe' as const,
    })
  }

  /* ----- PayPal branch -------------------------------------------------- */
  if (customer.paymentMethod === 'paypal') {
    if (!isPayPalConfigured()) {
      return NextResponse.json({
        reservationId,
        redirectUrl: `/booking/success?ref=${encodeURIComponent(reservationId)}`,
        paymentMethod: 'paypal' as const,
        mock: true,
      })
    }

    const result = await createPayPalOrder({
      reservationId,
      depositAmountUSD: breakdown.depositAmount,
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
