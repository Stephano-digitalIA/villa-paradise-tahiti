'use client'

import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Save, UserPlus, X } from 'lucide-react'

import { createCustomer } from '@/app/actions/clients'

interface NewClientDrawerProps {
  open: boolean
  onClose: () => void
  /** Called on success. If omitted, the drawer redirects to `/admin/clients/{id}`. */
  onCreated?: (customerId: string, isNew: boolean) => void
  /** Pre-set acquisition source (e.g. 'manual', 'airbnb' when used from a reservation). */
  acquisitionSource?:
    | 'direct'
    | 'airbnb'
    | 'booking'
    | 'vrbo'
    | 'referral'
    | 'manual'
    | 'imported'
}

export function NewClientDrawer({
  open,
  onClose,
  onCreated,
  acquisitionSource = 'manual',
}: NewClientDrawerProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [acceptMarketing, setAcceptMarketing] = useState(false)

  // Reset state on open
  useEffect(() => {
    if (open) {
      setEmail('')
      setFirstName('')
      setLastName('')
      setPhone('')
      setCountry('')
      setCity('')
      setAcceptMarketing(false)
      setError(null)
      setNotice(null)
      setTimeout(() => firstFieldRef.current?.focus(), 50)
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
    setNotice(null)
    startTransition(async () => {
      const res = await createCustomer({
        email,
        firstName,
        lastName,
        phone,
        country,
        city,
        acceptMarketing,
        acquisitionSource,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      const { id, isNew } = res.data!
      if (!isNew) {
        setNotice('A client with this email already exists. Opening their profile.')
      }
      if (onCreated) {
        onCreated(id, isNew)
        onClose()
      } else {
        router.push(`/admin/clients/${id}`)
        onClose()
      }
    })
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="New client"
      className="fixed inset-0 z-50 flex"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => !pending && onClose()}
        className="absolute inset-0 bg-midnight/60 backdrop-blur-sm"
      />

      <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-pearl shadow-elevated">
        <header className="flex items-center justify-between border-b border-pearl-400 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15">
              <UserPlus className="h-4 w-4 text-gold" aria-hidden="true" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-midnight">
              New client
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Close drawer"
            className="rounded-full p-2 text-midnight-400 transition-colors hover:bg-pearl-300/60 hover:text-midnight disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-4">
              <Field label="Email" required>
                <input
                  ref={firstFieldRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={pending}
                  required
                  autoComplete="off"
                  placeholder="guest@example.com"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" required>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={pending}
                    required
                    placeholder="Anaïs"
                    className={inputClass}
                  />
                </Field>
                <Field label="Last name" required>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={pending}
                    required
                    placeholder="Roux"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Phone">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={pending}
                  placeholder="+33 6 12 34 56 78"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={pending}
                    placeholder="Paris"
                    className={inputClass}
                  />
                </Field>
                <Field label="Country">
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={pending}
                    placeholder="France"
                    className={inputClass}
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={acceptMarketing}
                  onChange={(e) => setAcceptMarketing(e.target.checked)}
                  disabled={pending}
                  className="h-4 w-4 rounded border-pearl-400 text-gold focus:ring-gold"
                />
                <span className="font-sans text-sm text-midnight">
                  Has consented to marketing emails
                </span>
              </label>

              {acquisitionSource !== 'manual' ? (
                <p className="rounded-lg bg-pearl-300/50 px-3 py-2 font-sans text-xs text-midnight-400">
                  Acquisition source: <strong>{acquisitionSource}</strong>
                </p>
              ) : null}

              {notice ? (
                <p className="rounded-lg border border-lagoon/30 bg-lagoon/10 p-3 font-sans text-sm text-lagoon">
                  {notice}
                </p>
              ) : null}

              {error ? (
                <p
                  role="alert"
                  className="rounded-lg border border-coral/30 bg-coral/10 p-3 font-sans text-sm text-coral"
                >
                  {error}
                </p>
              ) : null}
            </div>
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-pearl-400 bg-white px-6 py-4">
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
              disabled={pending || !email.trim() || !firstName.trim() || !lastName.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2 font-sans text-sm font-semibold text-midnight shadow-sm transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:bg-gold/40"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              {pending ? 'Saving…' : 'Create client'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-pearl-400 bg-white px-3 py-2.5 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
        {label}
        {required ? <span className="ml-1 text-coral">*</span> : null}
      </span>
      {children}
    </label>
  )
}
