'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase/admin'

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

  revalidatePath(`/admin/reservations/${reservationId}`)
  revalidatePath('/admin/reservations')
  revalidatePath('/admin')
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
