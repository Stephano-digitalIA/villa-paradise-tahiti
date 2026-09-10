'use client'

import { useEffect, useRef } from 'react'

/**
 * Cloudflare Turnstile widget.
 *
 * Why this exists: the magic-link form called Supabase directly, and any
 * address typed into it created an account and sent an email. A bot found it
 * and used the site as a free relay, 70 unsolicited emails a day to strangers,
 * which burnt the Resend quota and put the domain's reputation at risk.
 *
 * Turnstile is the protection Supabase supports natively: the widget hands
 * back a token, Supabase verifies it before doing anything. For nearly every
 * human it is invisible; a bot gets no token and Supabase refuses.
 *
 * Degrades to nothing when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset, so a
 * local dev environment keeps working. Supabase then must NOT have the
 * CAPTCHA switched on, or every login fails: enable the two together.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact' | 'flexible'
        },
      ) => string
      reset: (id: string) => void
      remove: (id: string) => void
    }
  }
}

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? ''

/** True when the site is configured to challenge. Used to gate the form. */
export const turnstileEnabled = TURNSTILE_SITE_KEY.length > 0

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let scriptPromise: Promise<void> | null = null

/** Load the Turnstile script once, however many widgets the page mounts. */
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Turnstile failed to load'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

export function Turnstile({
  onToken,
  onExpire,
}: {
  onToken: (token: string) => void
  /** Tokens live about five minutes; the form clears its copy on expiry. */
  onExpire?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)

  useEffect(() => {
    if (!turnstileEnabled || !ref.current) return
    let cancelled = false
    const el = ref.current

    loadScript()
      .then(() => {
        if (cancelled || !window.turnstile) return
        widgetId.current = window.turnstile.render(el, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: onToken,
          'expired-callback': onExpire,
          'error-callback': onExpire,
          theme: 'light',
          size: 'flexible',
        })
      })
      .catch(() => {
        /* The form stays usable; Supabase will refuse without a token and
           the guest sees that message rather than a blank widget. */
      })

    return () => {
      cancelled = true
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current)
        widgetId.current = null
      }
    }
    // onToken/onExpire are stable callbacks from the parent's useCallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!turnstileEnabled) return null
  return <div ref={ref} className="min-h-[65px]" />
}
