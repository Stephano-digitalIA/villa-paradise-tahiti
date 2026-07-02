'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { createImplicitClient } from '@/lib/supabase/client'

/**
 * /auth/complete — finish the CUSTOMER Google OAuth flow in the browser.
 *
 * Mirrors /admin/auth/complete but WITHOUT any admin_users check: every
 * authenticated Google user is a valid guest. The implicit flow returns the
 * tokens in the URL fragment (#access_token=…), which the client consumes on
 * init — no PKCE code verifier (that kept failing in production) and no ?code
 * bouncing off the home page into the admin catcher.
 *
 * After the session is established we HARD-navigate to `next` so the server
 * components (e.g. /account, /booking/checkout) re-read the freshly written
 * session cookies instead of a stale client-router cache.
 */
function CompleteInner() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Finalizing sign-in…')
  const ran = useRef(false)

  useEffect(() => {
    // OAuth tokens are single-use — guard against React strict-mode double run.
    if (ran.current) return
    ran.current = true

    const supabase = createImplicitClient()

    // Only allow internal paths — never an absolute/protocol-relative URL.
    const rawNext = searchParams.get('next') || '/account'
    const next =
      rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/account'

    async function run() {
      try {
        // getSession awaits init, which consumes the implicit-flow fragment.
        const { data: pre } = await supabase.auth.getSession()

        if (!pre.session) {
          // Fallback: a ?code (old PKCE links) — exchange it client-side.
          const code = searchParams.get('code')
          if (code) {
            await supabase.auth.exchangeCodeForSession(code)
          }
        }

        setMessage('Signed in, redirecting…')
        window.location.replace(next)
      } catch {
        window.location.replace('/booking/checkout?auth_error=1')
      }
    }

    run()
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-midnight px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-pearl p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
        <p
          className="font-display text-[24px] italic leading-tight text-gold"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          Villa Paradise Tahiti
        </p>
        <Loader2 className="h-6 w-6 animate-spin text-gold" aria-hidden="true" />
        <p role="status" className="font-sans text-sm text-midnight-400">
          {message}
        </p>
      </div>
    </div>
  )
}

export default function CustomerAuthCompletePage() {
  return (
    <Suspense fallback={null}>
      <CompleteInner />
    </Suspense>
  )
}
