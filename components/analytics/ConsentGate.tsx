'use client'

/**
 * Consent gate — Phase F2.
 *
 * Single mount point in `app/layout.tsx` that:
 *   1. Reads the visitor's prior decision from localStorage on first
 *      paint (`'vpt:cookie-consent'` → `'accepted' | 'declined'`).
 *   2. Shows `<CookieConsent />` if no decision has been made yet.
 *   3. Mounts `<GoogleAnalytics />` + `<Hotjar />` ONLY when the visitor
 *      has accepted cookies.
 *
 * Why a single gate component?
 *   - Keeps `app/layout.tsx` clean — one import, one element.
 *   - Centralises persistence so we don't have to repeat the
 *     `localStorage` key in multiple places.
 *
 * SSR safety:
 *   The gate renders `null` on the server (and during the very first
 *   client render before `mounted` flips to `true`) so the markup is
 *   identical between server and client — no hydration mismatch on the
 *   banner or the script tags.
 */

import { useEffect, useState } from 'react'

import { CookieConsent, type ConsentChoice } from './CookieConsent'
import { GoogleAnalytics } from './GoogleAnalytics'
import { Hotjar } from './Hotjar'

const CONSENT_STORAGE_KEY = 'vpt:cookie-consent'

function readConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (stored === 'accepted' || stored === 'declined') return stored
    return null
  } catch {
    // localStorage may throw in private mode / iframes — treat as no decision.
    return null
  }
}

function writeConsent(choice: ConsentChoice) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice)
  } catch {
    // Best-effort; ignore quota / private-mode errors.
  }
}

export function ConsentGate() {
  const [consent, setConsent] = useState<ConsentChoice | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setConsent(readConsent())
  }, [])

  // Avoid hydration mismatch — render nothing on SSR / first paint.
  if (!mounted) return null

  const handleChoice = (choice: ConsentChoice) => {
    writeConsent(choice)
    setConsent(choice)
  }

  return (
    <>
      {consent === 'accepted' && <GoogleAnalytics />}
      {consent === 'accepted' && <Hotjar />}
      {consent === null && <CookieConsent onChoice={handleChoice} />}
    </>
  )
}
