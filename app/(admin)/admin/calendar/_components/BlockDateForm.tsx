'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'

const SOURCES = [
  { value: 'owner', label: 'Propriétaire' },
  { value: 'maintenance', label: 'Entretien' },
]

export function BlockDateForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fromRef = useRef<HTMLInputElement>(null)
  const toRef = useRef<HTMLInputElement>(null)
  const reasonRef = useRef<HTMLInputElement>(null)
  const sourceRef = useRef<HTMLSelectElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const blockedFrom = fromRef.current?.value
    const blockedTo = toRef.current?.value
    const reason = reasonRef.current?.value?.trim()
    const source = sourceRef.current?.value

    if (!blockedFrom || !blockedTo || !source) {
      setError('Merci de remplir tous les champs obligatoires.')
      return
    }

    if (blockedTo < blockedFrom) {
      setError('La date « Au » doit être identique ou postérieure à la date « Du ».')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/blocked-dates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocked_from: blockedFrom, blocked_to: blockedTo, reason, source }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError((body as { error?: string }).error ?? `Échec de la requête (${res.status})`)
          return
        }

        setSuccess(true)
        if (fromRef.current) fromRef.current.value = ''
        if (toRef.current) toRef.current.value = ''
        if (reasonRef.current) reasonRef.current.value = ''
        router.refresh()
      } catch {
        setError('Erreur réseau. Merci de réessayer.')
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm"
    >
      {error && (
        <div className="mb-4 rounded-lg border border-coral/20 bg-coral/10 px-4 py-3 font-sans text-sm text-coral">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-leaf/20 bg-leaf/10 px-4 py-3 font-sans text-sm text-leaf">
          Dates bloquées avec succès.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
            Du <span className="text-coral">*</span>
          </label>
          <input
            ref={fromRef}
            type="date"
            required
            className="rounded-xl border border-pearl-400 bg-pearl px-3 py-2 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
            Au <span className="text-coral">*</span>
          </label>
          <input
            ref={toRef}
            type="date"
            required
            className="rounded-xl border border-pearl-400 bg-pearl px-3 py-2 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
            Motif
          </label>
          <input
            ref={reasonRef}
            type="text"
            placeholder="ex : Travaux"
            className="rounded-xl border border-pearl-400 bg-pearl px-3 py-2 font-sans text-sm text-midnight placeholder-midnight-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
            Source <span className="text-coral">*</span>
          </label>
          <select
            ref={sourceRef}
            required
            defaultValue="owner"
            className="rounded-xl border border-pearl-400 bg-pearl px-3 py-2 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-midnight px-6 py-2.5 font-sans text-sm font-medium text-pearl transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Blocage en cours…' : 'Bloquer les dates'}
        </button>
      </div>
    </form>
  )
}
