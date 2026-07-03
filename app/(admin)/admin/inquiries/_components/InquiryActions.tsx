'use client'

import { useState, useTransition } from 'react'
import { markInquiryReplied } from '@/app/actions/inquiries'

type Props = {
  inquiryId: string
  email: string
  replied: boolean
}

// Prefilled reply subject (French — the admin is French-facing).
const REPLY_SUBJECT = encodeURIComponent(
  'Re : Villa Paradise Tahiti — Votre demande',
)

/**
 * Gmail web compose URL. A plain `mailto:` link only works when the OS has a
 * desktop mail client registered — which the admin (running Gmail in the
 * browser) does not, so `mailto:` silently did nothing. Opening Gmail's compose
 * window in a new tab works with no local mail client.
 */
function composeHref(email: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${REPLY_SUBJECT}`
}

/**
 * Inquiry actions — "Répondre" + "Marquer comme répondu".
 *
 * "Répondre" ONLY opens a prefilled Gmail compose tab; it does NOT change the
 * replied flag. Marking is kept 100% manual through the separate "Marquer comme
 * répondu" button (for replies handled by email, phone, or any other channel).
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

  return (
    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
      <a
        href={composeHref(email)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-xl bg-midnight px-4 py-2 font-sans text-sm font-medium text-pearl transition-opacity hover:opacity-90"
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
      </a>

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
