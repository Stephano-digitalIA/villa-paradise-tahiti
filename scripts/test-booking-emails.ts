/**
 * Test d'envoi des emails de confirmation de réservation (invité + admin).
 *
 * Rejoue exactement ce que le webhook PayPal (`app/api/paypal/webhook`)
 * fait après un PAYMENT.CAPTURE.COMPLETED, mais à la demande : utile en
 * local où les webhooks PayPal ne peuvent pas atteindre localhost.
 *
 * Usage :
 *   npx tsx --env-file=.env.local scripts/test-booking-emails.ts <reservation_ref>
 *
 * Les destinataires viennent de l'environnement :
 *   - admin  : EMAIL_OWNER (surchargeable en variable de session)
 *   - invité : l'email du client lié à la réservation
 */

import { createClient } from '@supabase/supabase-js'

import {
  sendBookingConfirmationGuest,
  sendBookingNotificationOwner,
  type BookingConfirmationData,
} from '../lib/resend'

const ref = process.argv[2]
if (!ref) {
  console.error('Usage: npx tsx --env-file=.env.local scripts/test-booking-emails.ts <reservation_ref>')
  process.exit(1)
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: res, error } = await supabase
    .from('reservations')
    .select(
      'reservation_ref, check_in, check_out, num_guests, villa_subtotal, experiences_total, cleaning_fee, total, deposit_amount, balance_amount, selected_experiences, payment_status, customers ( first_name, last_name, email )',
    )
    .eq('reservation_ref', ref)
    .maybeSingle()

  if (error || !res) {
    console.error('Réservation introuvable:', error?.message ?? ref)
    process.exit(1)
  }

  const customer = res.customers as unknown as {
    first_name: string
    last_name: string
    email: string
  } | null

  const experiences = Array.isArray(res.selected_experiences)
    ? (res.selected_experiences as Array<{ title?: string; quantity?: number }>).map((e) => ({
        title: e.title ?? '',
        quantity: e.quantity ?? 1,
      }))
    : []

  const data: BookingConfirmationData = {
    reservationId: res.reservation_ref,
    customer: {
      firstName: customer?.first_name ?? 'Guest',
      lastName: customer?.last_name ?? '',
      email: customer?.email ?? '',
    },
    booking: {
      checkIn: res.check_in,
      checkOut: res.check_out,
      guests: res.num_guests,
      nights: nightsBetween(res.check_in, res.check_out),
    },
    breakdown: {
      villaSubtotal: Number(res.villa_subtotal ?? 0),
      experiencesTotal: Number(res.experiences_total ?? 0),
      cleaningFee: Number(res.cleaning_fee ?? 0),
      total: Number(res.total ?? 0),
      depositAmount: Number(res.deposit_amount ?? 0),
      balanceAmount: Number(res.balance_amount ?? 0),
    },
    selectedExperiences: experiences,
  }

  console.log('Réservation:', data.reservationId, `(payment_status=${res.payment_status})`)
  console.log('Admin (EMAIL_OWNER):', process.env.EMAIL_OWNER ?? '(fallback)')
  console.log('Invité:', data.customer.email)

  const ownerResult = await sendBookingNotificationOwner({ ...data, paymentMethod: 'paypal' })
  console.log('Email admin :', JSON.stringify(ownerResult))

  const guestResult = data.customer.email
    ? await sendBookingConfirmationGuest(data)
    : { ok: false as const, reason: 'no_email' }
  console.log('Email invité:', JSON.stringify(guestResult))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
