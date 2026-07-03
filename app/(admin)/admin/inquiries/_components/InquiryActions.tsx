'use client'

import { useState, useTransition } from 'react'
import { markInquiryReplied } from '@/app/actions/inquiries'

type Props = {
  inquiryId: string
  email: string
  replied: boolean
}

// Prefilled reply subject (French — the admin is French-facing).
const MAILTO_SUBJECT = encodeURIComponent(
  'Re : Villa Paradise Tahiti — Votre demande',
)

/**
 * Inquiry actions — "Répondre" + "Marquer comme répondu".
 *
 * "Répondre" opens the guest's email in the admin's mail client (mailto) AND
 * flags the inquiry as replied — activating a reply opens the email. The
 * separate "Marquer comme répondu" only flips the flag (for replies handled by
 * phone or another channel) without opening an email.
 */
export function InquiryActions({ inquiryId, email, replied }: Props) {
  const [isPending, startTransition] = useTransition()
  const [isReplied, setIsReplied] = useState(replied)
  const [error, setError] = useState<string | null>(null)

  function flagReplied() {
    if (isReplied) return
    setError(null)
    startTransition(async () => {
      const result = await markInquiryReplied(inquiryId)
      if (result.error) setError(result.error)
      else setIsReplied(true)
    })
  }

  function handleReply() {
    // Open the email compose window, then mark the inquiry as replied.
    window.location.href = `mailto:${email}?subject=${MAILTO_SUBJECT}`
    flagReplied()
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleReply}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-xl bg-midnight px-4 py-2 font-sans text-sm font-medium text-pearl transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        Répondre
      </button>

      {isReplied ? (
        <span className="font-sans text-xs text-leaf">Marqué comme répondu</span>
      ) : (
        <button
          type="button"
          onClick={flagReplied}
          disabled={isPending}
          className="rounded-xl border border-pearl-400 bg-white px-4 py-2 font-sans text-sm font-medium text-midnight transition-colors hover:border-midnight disabled:opacity-50"
        >
          {isPending ? 'Mise à jour…' : 'Marquer comme répondu'}
        </button>
      )}

      {error && <p className="mt-1 font-sans text-xs text-coral">{error}</p>}
    </div>
  )
}
