'use client'

import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Trash2, X } from 'lucide-react'

import { anonymizeCustomer } from '@/app/actions/clients'

interface AnonymizeConfirmModalProps {
  customerId: string
  customerName: string
  open: boolean
  onClose: () => void
}

const TOKEN = 'ANONYMIZE'

export function AnonymizeConfirmModal({
  customerId,
  customerName,
  open,
  onClose,
}: AnonymizeConfirmModalProps) {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setConfirmation('')
      setError(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !pending) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, pending, onClose])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending) return
    setError(null)
    startTransition(async () => {
      const res = await anonymizeCustomer(customerId, confirmation)
      if (!res.ok) {
        setError(res.error)
        return
      }
      router.refresh()
      onClose()
    })
  }

  if (!open) return null

  const canSubmit = confirmation === TOKEN && !pending

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Anonymize customer"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => !pending && onClose()}
        className="absolute inset-0 bg-midnight/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-coral/30 bg-white p-6 shadow-elevated">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-midnight-400 transition-colors hover:bg-pearl-300/60 hover:text-midnight disabled:opacity-50"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-coral/15">
            <AlertTriangle className="h-5 w-5 text-coral" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold text-midnight">
              Anonymize {customerName}?
            </h2>
            <p className="mt-1 font-sans text-sm text-midnight-400">
              GDPR right-to-be-forgotten. This action is{' '}
              <strong className="text-midnight">irreversible</strong>.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-coral/20 bg-coral/5 p-4">
          <p className="font-sans text-sm font-semibold text-midnight">
            What will happen:
          </p>
          <ul className="mt-2 space-y-1 font-sans text-sm text-midnight-400">
            <li>· Name, email, phone, address replaced by «&nbsp;[Anonymized]&nbsp;»</li>
            <li>· Private notes are permanently deleted</li>
            <li>· Tags are unassigned</li>
            <li>· Marketing consent is revoked</li>
            <li>
              · <strong className="text-midnight">Reservations are kept</strong> (10-year
              accounting obligation), but no longer linked to identifiable information.
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="anonymize-confirm"
            className="block font-sans text-sm font-medium text-midnight"
          >
            Type{' '}
            <code className="rounded bg-pearl-300 px-1.5 py-0.5 font-mono text-xs font-bold text-coral">
              {TOKEN}
            </code>{' '}
            below to confirm:
          </label>
          <input
            ref={inputRef}
            id="anonymize-confirm"
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            disabled={pending}
            autoComplete="off"
            spellCheck={false}
            className="mt-2 w-full rounded-xl border border-pearl-400 bg-white px-3 py-2.5 font-mono text-sm uppercase text-midnight focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30 disabled:opacity-60"
          />

          {error ? (
            <p
              role="alert"
              className="mt-2 font-sans text-sm text-coral"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-pearl-400 bg-white px-4 py-2 font-sans text-sm font-medium text-midnight hover:border-midnight"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-coral px-4 py-2 font-sans text-sm font-semibold text-white hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              {pending ? 'Anonymizing…' : 'Anonymize permanently'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
