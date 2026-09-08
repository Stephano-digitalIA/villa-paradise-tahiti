'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * The audience beacon.
 *
 * Fires once per page the visitor actually sees, including on client-side
 * navigation, which a server-side counter cannot see at all: the marketing
 * pages are statically served and a cached response never reaches our code.
 *
 * `sendBeacon` when the browser has it. It hands the request to the browser
 * to deliver on its own schedule, so it survives the visitor leaving the page
 * immediately, and it never blocks rendering. `fetch` with `keepalive` is the
 * fallback with the same property.
 *
 * `document.referrer` has to travel in the body: the beacon's own `referer`
 * header is the page it fires from, which would make every visit look direct.
 * Only the referrer's host is kept server-side.
 *
 * A failure is swallowed. Losing a count is never worth an error in front of
 * a visitor.
 */
export function Pulse() {
  const pathname = usePathname()
  // React runs effects twice in development. Without this the first page of
  // every dev session would count double.
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return
    lastSent.current = pathname
    sendPulse({ path: pathname, ref: document.referrer })
  }, [pathname])

  return null
}

/**
 * Record a named event, e.g. a photo opened in the lightbox.
 * Exported so any client component can call it without importing the beacon.
 */
export function sendPulse(payload: {
  path: string
  kind?: string
  label?: string
  ref?: string
}): void {
  try {
    const body = JSON.stringify({ ref: '', ...payload })
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/pulse', new Blob([body], { type: 'application/json' }))
      return
    }
    void fetch('/api/pulse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* measurement must never break a page */
  }
}
