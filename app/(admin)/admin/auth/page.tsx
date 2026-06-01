'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Mail } from 'lucide-react'

import { verifyAdminMembership } from '@/app/actions/admin-auth'
import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/ui'

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function AuthErrorMessage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  if (!error) return null

  const message =
    error === 'unauthorized'
      ? 'Access denied. Your account is not authorized.'
      : 'Authentication failed. Please try again.'

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </div>
  )
}

function SignInForm() {
  const supabase = createClient()

  function handleSignIn() {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/admin/auth/callback',
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-midnight px-4">
      <div className="w-full max-w-sm rounded-2xl bg-pearl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
        {/* Logo */}
        <div className="mb-6 text-center">
          <p
            className="font-display text-[28px] italic leading-tight text-gold"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Villa Paradise Tahiti
          </p>
          <p className="mt-1 font-sans text-sm font-medium uppercase tracking-widest text-midnight-400">
            Admin Dashboard
          </p>
        </div>

        {/* Error banner */}
        <div className="mb-4">
          <Suspense fallback={null}>
            <AuthErrorMessage />
          </Suspense>
        </div>

        {/* Sign-in button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSignIn}
        >
          <GoogleIcon />
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-pearl-400" />
          <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-midnight-400">
            or
          </span>
          <span className="h-px flex-1 bg-pearl-400" />
        </div>

        {/* Email + password form — only whitelisted admin_users can sign in;
            non-admin sessions are signed out immediately. */}
        <PasswordSignInForm />

        {/* Footer */}
        <p className="mt-6 text-center font-sans text-xs text-midnight-400">
          Secure admin access &middot; Villa Paradise Tahiti
        </p>
      </div>
    </div>
  )
}

/**
 * Password sign-in form for the 1–2 trusted admins.
 *
 * Flow:
 *   1. supabase.auth.signInWithPassword({ email, password })
 *   2. If success → SELECT admin_users WHERE id = auth.uid()
 *      (RLS policy `admin_users_self` allows this read)
 *   3. If no row → signOut + display "Access denied"
 *   4. If admin → router.push('/admin')
 *
 * Magic-link is intentionally NOT offered here — for a restricted admin
 * with ≤ 2 users, explicit credentials are safer than passwordless email.
 */
function PasswordSignInForm() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'recovery-sent'>(
    'idle',
  )
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return
    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setStatus('submitting')
    setError(null)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError || !data.user) {
      setStatus('idle')
      setError(signInError?.message ?? 'Invalid email or password')
      return
    }

    // Enforce the admin_users whitelist via a service-role server action.
    // Going through `adminClient` server-side avoids the RLS / session
    // timing issues we saw with the @supabase/ssr browser client right
    // after signInWithPassword — same fix that unblocked the Google OAuth
    // callback earlier in the project.
    const membership = await verifyAdminMembership(data.user.id)

    if (!membership.isAdmin) {
      await supabase.auth.signOut()
      setStatus('idle')
      setError(
        membership.error
          ? `Access denied (${membership.error})`
          : 'Access denied. Your account is not authorized.',
      )
      return
    }

    router.push('/admin')
    router.refresh()
  }

  async function handleRecovery() {
    if (!email.trim()) {
      setError('Enter your email above first, then click "Forgot password"')
      return
    }
    setError(null)
    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        // Supabase hosted reset page → user sets new password → can sign in here.
        // Override with a custom /admin/auth/reset route later if needed.
        redirectTo: window.location.origin + '/admin/auth',
      },
    )
    if (recoveryError) {
      setError(recoveryError.message)
      return
    }
    setStatus('recovery-sent')
  }

  if (status === 'recovery-sent') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-leaf/30 bg-leaf/10 p-4 text-sm text-midnight"
      >
        <p className="font-semibold">Reset link sent</p>
        <p className="mt-1 text-midnight-400">
          Check the inbox of <span className="font-medium text-midnight">{email}</span>{' '}
          for a link to set a new password.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle')
            setPassword('')
          }}
          className="mt-2 text-xs font-medium uppercase tracking-wider text-gold underline-offset-2 hover:underline"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <label htmlFor="admin-email" className="sr-only">
        Email
      </label>
      <div className="relative">
        <Mail
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-300"
          aria-hidden="true"
        />
        <Input
          id="admin-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'submitting'}
          error={!!error && !password}
          className="pl-9"
        />
      </div>

      <label htmlFor="admin-password" className="sr-only">
        Password
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-300"
          aria-hidden="true"
        />
        <Input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={status === 'submitting'}
          error={!!error}
          className="pl-9"
        />
      </div>

      <Button
        type="submit"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={status === 'submitting' || !email || !password}
      >
        {status === 'submitting' ? 'Signing in…' : 'Sign in'}
      </Button>

      <button
        type="button"
        onClick={handleRecovery}
        disabled={status === 'submitting'}
        className="self-end text-xs font-medium text-midnight-400 underline-offset-2 hover:text-midnight hover:underline disabled:opacity-50"
      >
        Forgot password?
      </button>

      {error ? (
        <p role="alert" className="text-xs text-coral">
          {error}
        </p>
      ) : null}
    </form>
  )
}

export default function AdminAuthPage() {
  return <SignInForm />
}
