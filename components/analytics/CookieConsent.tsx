'use client'

/**
 * Cookie consent banner — Phase F2.
 *
 * Lightweight RGPD/CCPA-friendly banner shown on the first visit. The
 * banner is dumb: it only renders UI and calls back `onChoice` with the
 * visitor's decision. Persistence + tracker mounting is owned by
 * `<ConsentGate />`.
 *
 * A11y:
 *   - `role="dialog"` + `aria-labelledby` / `aria-describedby`.
 *   - Both buttons are reachable via Tab; the "Accept All" button receives
 *     focus on mount so keyboard users can confirm with a single Enter.
 *   - No focus trap on purpose: the banner is non-modal — it must not
 *     hijack keyboard interaction with the rest of the page.
 */

import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export type ConsentChoice = 'accepted' | 'declined'

export interface CookieConsentProps {
  onChoice: (choice: ConsentChoice) => void
  className?: string
}

export function CookieConsent({ onChoice, className }: CookieConsentProps) {
  const acceptRef = useRef<HTMLButtonElement>(null)

  // Move focus to the primary action so keyboard users can act immediately,
  // without trapping focus (the rest of the page stays usable).
  useEffect(() => {
    acceptRef.current?.focus()
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className={cn(
        // Pinned bottom, full width on mobile, centered card on desktop.
        'fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-4xl flex-col gap-4 rounded-lg bg-midnight px-5 py-5 text-pearl shadow-card',
          'sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-7 sm:py-6'
        )}
      >
        <div className="flex-1">
          <p
            id="cookie-consent-title"
            className="font-display text-base font-medium text-pearl"
          >
            We value your privacy
          </p>
          <p
            id="cookie-consent-description"
            className="mt-1 text-sm text-pearl/80"
          >
            We use cookies for analytics and to improve your experience on
            Villa Paradise Tahiti. You can accept all cookies or decline
            non-essential ones — your choice is remembered on this device.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => onChoice('declined')}
          >
            Decline
          </Button>
          <Button
            ref={acceptRef}
            variant="primary"
            size="sm"
            onClick={() => onChoice('accepted')}
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  )
}
