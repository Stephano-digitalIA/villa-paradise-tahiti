'use client'

import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Send, X } from 'lucide-react'

import { sendCustomerEmail } from '@/app/actions/clients'

interface EmailTemplate {
  key: string
  label: string
  subject: (firstName: string) => string
  body: (firstName: string) => string
}

const TEMPLATES: EmailTemplate[] = [
  {
    key: 'welcome',
    label: 'Welcome',
    subject: (n) => `Welcome to Villa Paradise Tahiti, ${n}`,
    body: (n) =>
      `Dear ${n},\n\nThank you for choosing Villa Paradise Tahiti. We are looking forward to welcoming you.\n\nIf you have any questions before your arrival — flight transfers, dietary preferences, special requests — simply reply to this email and I will get back to you within a few hours.\n\nWarmly,\nThierry`,
  },
  {
    key: 'pre_arrival',
    label: '7 days before arrival',
    subject: () => 'Your arrival at Villa Paradise Tahiti — last details',
    body: (n) =>
      `Dear ${n},\n\nYour stay begins in one week. To make sure everything is perfect, could you confirm:\n\n• Your arrival flight number and landing time\n• Any dietary preferences or allergies for our chef\n• Whether you would like us to organize any of our signature experiences\n\nWe look forward to welcoming you to paradise.\n\nWarmly,\nThierry`,
  },
  {
    key: 'review_request',
    label: 'Review request (post-stay)',
    subject: () => 'Thank you for staying with us',
    body: (n) =>
      `Dear ${n},\n\nIt was a pleasure hosting you at Villa Paradise Tahiti. We hope your stay matched everything you imagined.\n\nIf you have a moment, we would be honoured to read your impressions — your feedback helps us welcome future guests with even more care.\n\nWith gratitude,\nThierry`,
  },
]

interface EmailComposerDrawerProps {
  customerId: string
  customerEmail: string
  customerFirstName: string
  open: boolean
  onClose: () => void
}

export function EmailComposerDrawer({
  customerId,
  customerEmail,
  customerFirstName,
  open,
  onClose,
}: EmailComposerDrawerProps) {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const firstFieldRef = useRef<HTMLInputElement>(null)

  // Reset state when drawer opens
  useEffect(() => {
    if (open) {
      setSubject('')
      setBody('')
      setError(null)
      setTimeout(() => firstFieldRef.current?.focus(), 50)
    }
  }, [open])

  // Escape to close
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !pending) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, pending, onClose])

  function applyTemplate(t: EmailTemplate) {
    setSubject(t.subject(customerFirstName))
    setBody(t.body(customerFirstName))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending) return
    setError(null)
    startTransition(async () => {
      const res = await sendCustomerEmail(customerId, subject, body)
      if (!res.ok) {
        setError(res.error)
        return
      }
      router.refresh()
      onClose()
    })
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compose email"
      className="fixed inset-0 z-50 flex"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={() => !pending && onClose()}
        className="absolute inset-0 bg-midnight/60 backdrop-blur-sm"
      />

      {/* Drawer panel — slides from right */}
      <div className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-pearl shadow-elevated">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-pearl-400 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15">
              <Mail className="h-4 w-4 text-gold" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-semibold text-midnight">
                Send email
              </h2>
              <p className="font-sans text-xs text-midnight-400 truncate">
                to {customerEmail}
              </p>
            </div>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4">
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                Quick templates
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    disabled={pending}
                    className="inline-flex items-center rounded-full border border-pearl-400 bg-white px-3 py-1 font-sans text-xs font-medium text-midnight-400 transition-colors hover:border-midnight hover:text-midnight disabled:opacity-50"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="email-subject"
                className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400"
              >
                Subject
              </label>
              <input
                ref={firstFieldRef}
                id="email-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={pending}
                maxLength={200}
                placeholder="Subject line"
                className="w-full rounded-xl border border-pearl-400 bg-white px-3 py-2.5 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="email-body"
                className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400"
              >
                Message
              </label>
              <textarea
                id="email-body"
                rows={14}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={pending}
                maxLength={10000}
                placeholder={`Dear ${customerFirstName},\n\n…`}
                className="w-full resize-y rounded-xl border border-pearl-400 bg-white px-3 py-2.5 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
              />
              <p className="mt-1.5 font-sans text-xs text-midnight-400">
                {body.length}/10 000 — line breaks preserved. Sender appears as Villa
                Paradise Tahiti, reply-to is the owner inbox.
              </p>
            </div>

            {error ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-coral/30 bg-coral/10 p-3 font-sans text-sm text-coral"
              >
                {error}
              </div>
            ) : null}
          </div>

          {/* Footer */}
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
              disabled={pending || !subject.trim() || !body.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2 font-sans text-sm font-semibold text-midnight shadow-sm transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:bg-gold/40"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              {pending ? 'Sending…' : 'Send email'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
