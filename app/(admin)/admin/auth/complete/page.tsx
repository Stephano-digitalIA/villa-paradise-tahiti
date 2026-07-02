'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { verifyAdminMembership } from '@/app/actions/admin-auth'
import { createClient } from '@/lib/supabase/client'

/**
 * /admin/auth/complete — finish the Google OAuth flow IN THE BROWSER.
 *
 * The PKCE code verifier lives in a browser cookie written by
 * `createBrowserClient` when "Continue with Google" is clicked. Exchanging the
 * returned `?code=` on the server (the old /admin/auth/callback route) proved
 * fragile in production — the verifier cookie did not reliably reach the
 * serverless function, failing with "PKCE code verifier not found in storage".
 *
 * Doing the exchange client-side is immune to that: the browser client reads
 * its own cookie jar directly. After the session is established we still
 * enforce the admin_users whitelist via a service-role server action, exactly
 * like the password flow does.
 */
function CompleteInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Finalisation de la connexion…')
  const ran = useRef(false)

  useEffect(() => {
    // Guard against double-run (React strict mode / fast refresh) — the OAuth
    // code is single-use, a second exchange would fail spuriously.
    if (ran.current) return
    ran.current = true

    const supabase = createClient()

    function fail(detail: string) {
      router.replace(
        `/admin/auth?error=auth_failed&detail=${encodeURIComponent(detail)}`,
      )
    }

    async function run() {
      try {
        // A session may already exist (e.g. the server callback succeeded and
        // forwarded here, or the user re-opened the page). Reuse it.
        const { data: pre } = await supabase.auth.getSession()
        let userId = pre.session?.user.id ?? null

        if (!userId) {
          const code = searchParams.get('code')
          if (!code) {
            fail('no_code_on_complete')
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
