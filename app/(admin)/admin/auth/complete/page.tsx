'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { verifyAdminMembership } from '@/app/actions/admin-auth'
import { createImplicitClient } from '@/lib/supabase/client'

/**
 * /admin/auth/complete — finish the admin Google OAuth flow IN THE BROWSER.
 *
 * Primary path (implicit flow): Supabase returns the tokens in the URL
 * fragment (#access_token=…). The implicit client's `detectSessionInUrl`
 * consumes it during initialization — no PKCE code verifier involved, which is
 * what kept failing in production ("code verifier not found in storage", on
 * both the server and client exchange paths).
 *
 * Fallback path: if a ?code arrives instead (old links, middleware fallback
 * forwarding a Site-URL bounce), attempt the PKCE exchange client-side.
 *
 * Either way, the admin_users whitelist is enforced via the service-role
 * server action before landing on /admin — same guarantee as before.
 */
function CompleteInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Finalisation de la connexion…')
  const ran = useRef(false)

  useEffect(() => {
    // Guard against double-run (React strict mode) — OAuth codes are single-use.
    if (ran.current) return
    ran.current = true

    const supabase = createImplicitClient()

    function fail(detail: string) {
      // Append where we are + which sb-* cookies exist: pinpoints origin
      // mismatches and cookie-write failures in one glance.
      const sbCookies =
        document.cookie
          .split(';')
          .map((c) => c.trim().split('=')[0])
          .filter((n) => n.startsWith('sb-'))
          .join(',') || 'none'
      const diag = `${detail} | origin=${window.location.origin} | sb-cookies=${sbCookies}`
      router.replace(`/admin/auth?error=auth_failed&detail=${encodeURIComponent(diag)}`)
    }

    async function run() {
      try {
        // getSession awaits the client's initialization, which consumes the
        // implicit-flow tokens from the URL fragment when present.
        const { data: pre } = await supabase.auth.getSession()
        let userId = pre.session?.user.id ?? null

        // Fallback: PKCE ?code (old links / middleware Site-URL bounce).
        if (!userId) {
          const code = searchParams.get('code')
          if (!code) {
            fail('no_session_and_no_code_on_complete')
            return
          }
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error || !data.session) {
            fail(`client_exchange: ${error?.message ?? 'no session returned'}`)
            return
          }
          userId = data.session.user.id
        }

        setMessage('Vérification de l’accès administrateur…')
        const membership = await verifyAdminMembership(userId)
        if (!membership.isAdmin) {
          await supabase.auth.signOut()
          router.replace('/admin/auth?error=unauthorized')
          return
        }

        router.replace('/admin')
        router.refresh()
      } catch (err) {
        fail(`complete_threw: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    run()
  }, [router, searchParams])

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

export default function CompleteAuthPage() {
  return (
    <Suspense fallback={null}>
      <CompleteInner />
    </Suspense>
  )
}
