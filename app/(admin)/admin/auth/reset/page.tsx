'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/ui'

type Phase = 'checking' | 'ready' | 'invalid'

/**
 * /admin/auth/reset — set a new password after following the "forgot password"
 * email link. Supabase redirects here with a recovery `?code=`; we exchange it
 * for a short-lived recovery session, then let the admin choose a new password
 * (supabase.auth.updateUser) before sending them back to the login screen.
 */
export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()

  const [phase, setPhase] = useState<Phase>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)

  // Establish the recovery session from the email link.
  useEffect(() => {
    let cancelled = false

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && !cancelled) setPhase('ready')
    })

    async function init() {
      const { data: existing } = await supabase.auth.getSession()
      if (existing.session) {
        if (!cancelled) setPhase('ready')
        return
      }
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (!cancelled) setPhase(exchangeError ? 'invalid' : 'ready')
        // Strip the code from the URL so a refresh doesn't retry a used code.
        window.history.replaceState({}, '', '/admin/auth/reset')
        return
      }
      if (!cancelled) setPhase('invalid')
    }

    init()
    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setStatus('submitting')
    setError(null)

    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setStatus('idle')
      setError(updateError.message)
      return
    }

    // New password saved. Sign the recovery session out and send them to the
    // login page to sign in fresh with the new password.
    setStatus('done')
    await supabase.auth.signOut()
    setTimeout(() => router.push('/admin/auth'), 1600)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-midnight px-4">
      <div className="w-full max-w-sm rounded-2xl bg-pearl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
        <div className="mb-6 text-center">
          <p
            className="font-display text-[28px] italic leading-tight text-gold"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Villa Paradise Tahiti
          </p>
          <p className="mt-1 font-sans text-sm font-medium uppercase tracking-widest text-midnight-400">
            Nouveau mot de passe
          </p>
        </div>

        {phase === 'checking' && (
          <p className="text-center font-sans text-sm text-midnight-400">
            Vérification du lien…
          </p>
        )}

        {phase === 'invalid' && (
          <div className="space-y-4 text-center">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Ce lien de réinitialisation est invalide ou a expiré.
            </div>
            <Button asChild variant="outline" size="md" className="w-full">
              <Link href="/admin/auth">Demander un nouveau lien</Link>
            </Button>
          </div>
        )}

        {phase === 'ready' && status === 'done' && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border border-leaf/30 bg-leaf/10 p-4 text-center text-sm text-midnight"
          >
            <p className="font-semibold">Mot de passe mis à jour</p>
            <p className="mt-1 text-midnight-400">Redirection vers la connexion…</p>
          </div>
        )}

        {phase === 'ready' && status !== 'done' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
            <label htmlFor="new-password" className="sr-only">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-300"
                aria-hidden="true"
              />
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status === 'submitting'}
                error={!!error}
                className="pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={status === 'submitting'}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-midnight-300 transition-colors hover:text-midnight focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>

            <label htmlFor="confirm-password" className="sr-only">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-300"
                aria-hidden="true"
              />
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="Confirmer le mot de passe"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={status === 'submitting'}
                error={!!error}
                className="pl-9"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={status === 'submitting' || !password || !confirm}
            >
              {status === 'submitting' ? 'Enregistrement…' : 'Mettre à jour le mot de passe'}
            </Button>

            {error ? (
              <p role="alert" className="text-xs text-coral">
                {error}
              </p>
            ) : null}
          </form>
        )}

        <p className="mt-6 text-center font-sans text-xs text-midnight-400">
          Secure admin access &middot; Villa Paradise Tahiti
        </p>
      </div>
    </div>
  )
}
