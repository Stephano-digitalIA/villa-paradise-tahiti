'use client'

import { useState, useTransition } from 'react'
import type { PaymentStatus } from '@/lib/supabase/types'
import {
  markReservationFullyPaid,
  cancelReservation,
} from '@/app/actions/reservations'

type Props = {
  reservationId: string
  paymentStatus: PaymentStatus
  customerEmail?: string
}

export function ReservationActions({
  reservationId,
  paymentStatus,
  customerEmail,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  function handleMarkPaid() {
    setErrorMsg(null)
    setSuccessMsg(null)
    startTransition(async () => {
      const result = await markReservationFullyPaid(reservationId)
      if (result.error) {
        setErrorMsg(result.error)
      } else {
        setSuccessMsg('Réservation marquée comme payée intégralement.')
      }
    })
  }

  function handleCancel() {
    setErrorMsg(null)
    setSuccessMsg(null)
    startTransition(async () => {
      const result = await cancelReservation(reservationId, cancelReason)
      if (result.error) {
        setErrorMsg(result.error)
      } else {
        setSuccessMsg('La réservation a été annulée.')
        setShowCancelConfirm(false)
      }
    })
  }

  const isCancelled = paymentStatus === 'cancelled'
  const isRefunded = paymentStatus === 'refunded'
  const isFullyPaid = paymentStatus === 'fully_paid'

  return (
    <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-base font-semibold text-midnight">
        Actions admin
      </h2>

      {(errorMsg || successMsg) && (
        <div
          className={`mt-3 rounded-lg px-4 py-3 font-sans text-sm ${
            errorMsg
              ? 'border border-coral/20 bg-coral/10 text-coral'
              : 'border border-leaf/20 bg-leaf/10 text-leaf'
          }`}
        >
          {errorMsg ?? successMsg}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {/* Mark as Fully Paid */}
        {paymentStatus === 'deposit_paid' && (
          <button
            type="button"
            onClick={handleMarkPaid}
            disabled={isPending}
            className="rounded-xl bg-leaf px-5 py-2.5 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Mise à jour...' : 'Marquer comme payé intégralement'}
          </button>
        )}
        {isFullyPaid && (
          <span className="inline-flex items-center rounded-xl border border-leaf/30 bg-leaf/10 px-5 py-2.5 font-sans text-sm font-medium text-leaf">
            Paiement complet
          </span>
        )}

        {/* Cancel reservation */}
        {!isCancelled && !isRefunded && (
          <>
            {!showCancelConfirm ? (
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                disabled={isPending}
                className="rounded-xl border border-coral/30 bg-coral/5 px-5 py-2.5 font-sans text-sm font-medium text-coral transition-colors hover:bg-coral/10 disabled:opacity-50"
              >
                Annuler la réservation
              </button>
            ) : (
              <div className="w-full rounded-xl border border-coral/20 bg-coral/5 p-4">
                <p className="font-sans text-sm font-medium text-coral">
                  Voulez-vous vraiment annuler cette réservation ?
                </p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Motif d'annulation (facultatif)"
                  rows={2}
                  className="mt-3 w-full rounded-lg border border-pearl-400 bg-white px-3 py-2 font-sans text-sm text-midnight placeholder-midnight-300 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isPending}
                    className="rounded-xl bg-coral px-4 py-2 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {isPending ? 'Annulation...' : "Confirmer l'annulation"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={isPending}
                    className="rounded-xl border border-pearl-400 bg-white px-4 py-2 font-sans text-sm font-medium text-midnight transition-colors hover:border-midnight"
                  >
                    Retour
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Send balance reminder (TODO) */}
        {customerEmail && paymentStatus === 'deposit_paid' && (
          <button
            type="button"
            disabled
            title="Bientôt disponible"
            className="cursor-not-allowed rounded-xl border border-pearl-400 bg-pearl px-5 py-2.5 font-sans text-sm font-medium text-midnight-400 opacity-50"
          >
            Envoyer un rappel de solde (TODO)
          </button>
        )}
      </div>
    </div>
  )
}
