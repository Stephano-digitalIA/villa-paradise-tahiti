'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase/admin'
import { sendReservationCancelledGuest } from '@/lib/resend'

export async function markReservationFullyPaid(reservationId: string): Promise<{ error?: string }> {
  const { error } = await adminClient
    .from('reservations')
    .update({
      payment_status: 'fully_paid',
      balance_paid_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .eq('payment_status', 'deposit_paid') // safety: only update if currently deposit_paid

  if (error) return { error: error.message }

  revalidatePath(`/admin/reservations/${reservationId}`)
  revalidatePath('/admin/reservations')
  revalidatePath('/admin')
  return {}
}

export async function cancelReservation(
  reservationId: string,
  reason?: string,
): Promise<{ error?: string }> {
  const { error } = await adminClient
    .from('reservations')
    .update({
      payment_status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason ?? null,
    })
    .eq('id', reservationId)

  if (error) return { error: error.message }

  // Free the dates. The payment webhooks write a `direct_booking` row into
  // `blocked_dates` keyed on the reservation ref, and nothing else ever
  // removes it — cancelling used to leave the week closed to new bookings,
  // silently, with no trace in the admin beyond the calendar itself.
  //
  // Scoped to `direct_booking` so an owner or maintenance block covering the
  // same dates, or an iCal row from a platform, is never touched.
  try {
    const { data: ref } = await adminClient
      .from('reservations')
      .select('reservation_ref')
      .eq('id', reservationId)
      .maybeSingle()

    if (ref?.reservation_ref) {
      const { error: unblockError } = await adminClient
        .from('blocked_dates')
        .delete()
        .eq('source', 'direct_booking')
        .eq('source_ref', ref.reservation_ref)

      if (unblockError) {
        // eslint-disable-next-line no-console
        console.error('[cancelReservation] failed to free the dates:', unblockError)
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[cancelReservation] failed to free the dates:', err)
  }

  // Notify the guest by email. Best-effort: a mail failure must not block the
  // cancellation (the DB update already succeeded). Degrades to a no-op in mock
  // mode (no RESEND_API_KEY).
  try {
    const { data: r } = await adminClient
      .from('reservations')
      .select('reservation_ref, check_in, check_out, customer_id')
      .eq('id', reservationId)
      .maybeSingle()

    const { data: customer } = r?.customer_id
      ? await adminClient
          .from('customers')
          .select('first_name, email')
          .eq('id', r.customer_id)
          .maybeSingle()
      : { data: null }

    if (customer?.email) {
      await sendReservationCancelledGuest({
        reservationId: r?.reservation_ref ?? reservationId,
        customer: { firstName: customer.first_name ?? '', email: customer.email },
        booking: { checkIn: r?.check_in ?? '', checkOut: r?.check_out ?? '' },
        reason: reason ?? null,
      })
    } else {
      // eslint-disable-next-line no-console
      console.warn('[cancelReservation] no customer email — cancellation email skipped', {
        reservationId,
      })
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[cancelReservation] cancellation email failed:', err)
  }

  revalidatePath(`/admin/reservations/${reservationId}`)
  revalidatePath('/admin/reservations')
  revalidatePath('/admin')
  // The dates just went back on sale — the calendar must not keep showing
  // them as booked.
  revalidatePath('/admin/calendar')
  return {}
}

export async function saveInternalNotes(
  reservationId: string,
  notes: string,
): Promise<{ error?: string }> {
  const { error } = await adminClient
    .from('reservations')
    .update({ internal_notes: notes })
    .eq('id', reservationId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/reservations/${reservationId}`)
  return {}
}
