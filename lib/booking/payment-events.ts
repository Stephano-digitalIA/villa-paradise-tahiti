/**
 * Payment event linking — Villa Paradise Tahiti.
 *
 * Both webhooks record every processed event in `payment_events` before
 * doing anything else, so a crash mid-handler still leaves a trace. At
 * that point the reservation's UUID isn't known: the processors only
 * carry the human-readable `reservation_ref` (PayPal in its `custom_id`,
 * PayPal in `custom_id`), and `payment_events.reservation_id` is a
 * foreign key to `reservations.id`.
 *
 * Both handlers used to insert `reservation_id: null` and leave it that
 * way, which meant the admin reservation detail page — it filters on
 * `reservation_id` — always rendered "no payment events recorded", for
 * This resolves the ref once the reservation is
 * known and backfills the row.
 */

import { adminClient } from '@/lib/supabase/admin'

/**
 * Attach an already-recorded payment event to its reservation.
 *
 * Best-effort and never throws: this is book-keeping for the back-office,
 * and a payment must never be considered failed because a join column
 * couldn't be filled in.
 */
export async function linkPaymentEventToReservation(
  eventId: string | undefined,
  reservationRef: string | null,
): Promise<void> {
  if (!eventId || !reservationRef) return

  try {
    const { data } = await adminClient
      .from('reservations')
      .select('id')
      .eq('reservation_ref', reservationRef)
      .maybeSingle()

    if (!data?.id) return

    await adminClient
      .from('payment_events')
      .update({ reservation_id: data.id })
      .eq('event_id', eventId)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[payment-events] failed to link event to reservation:', err)
  }
}
