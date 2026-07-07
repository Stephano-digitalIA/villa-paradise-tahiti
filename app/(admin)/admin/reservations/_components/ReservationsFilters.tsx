'use client'

import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import type { PaymentStatus } from '@/lib/supabase/types'

const STATUSES: { value: PaymentStatus | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'deposit_paid', label: 'Acompte payé' },
  { value: 'fully_paid', label: 'Payé intégralement' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'refunded', label: 'Remboursé' },
]

type Props = {
  currentStatus?: string
  currentQ?: string
}

export function ReservationsFilters({ currentStatus, currentQ }: Props) {
  const router = useRouter()
  const qRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLSelectElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    const q = qRef.current?.value.trim()
    const status = statusRef.current?.value
    if (status) params.set('status', status)
    if (q) params.set('q', q)
    params.set('page', '1')
    router.push(`/admin/reservations?${params.toString()}`)
  }

  function handleReset() {
    router.push('/admin/reservations')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-pearl-400 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
    >
      <select
        ref={statusRef}
        defaultValue={currentStatus ?? ''}
        className="rounded-lg border border-pearl-400 bg-pearl px-3 py-2 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <input
        ref={qRef}
        type="text"
        placeholder="Rechercher par référence..."
        defaultValue={currentQ ?? ''}
        className="flex-1 rounded-lg border border-pearl-400 bg-pearl px-3 py-2 font-sans text-sm text-midnight placeholder-midnight-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-xl bg-midnight px-4 py-2 font-sans text-sm font-medium text-pearl transition-colors hover:bg-midnight-700"
        >
          Appliquer
        </button>
        {(currentStatus || currentQ) && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-pearl-400 bg-white px-4 py-2 font-sans text-sm font-medium text-midnight transition-colors hover:border-midnight"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </form>
  )
}
