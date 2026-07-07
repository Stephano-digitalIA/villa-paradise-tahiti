'use client'

import { useState, useTransition } from 'react'
import { saveInternalNotes } from '@/app/actions/reservations'

type Props = {
  reservationId: string
  initialNotes: string
}

export function NotesForm({ reservationId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    setSaved(false)
    setError(null)
    startTransition(async () => {
      const result = await saveInternalNotes(reservationId, notes)
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    })
  }

  return (
    <div className="mt-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="Ajouter des notes internes sur cette réservation..."
        className="w-full rounded-xl border border-pearl-400 bg-pearl px-4 py-3 font-sans text-sm text-midnight placeholder-midnight-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-xl bg-midnight px-4 py-2 font-sans text-sm font-medium text-pearl transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Enregistrement...' : 'Enregistrer les notes'}
        </button>
        {saved && (
          <span className="font-sans text-sm text-leaf">Enregistré !</span>
        )}
        {error && (
          <span className="font-sans text-sm text-coral">{error}</span>
        )}
      </div>
    </div>
  )
}
