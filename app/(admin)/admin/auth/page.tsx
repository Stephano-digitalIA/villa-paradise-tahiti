'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'

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

        {/* Footer */}
        <p className="mt-6 text-center font-sans text-xs text-midnight-400">
          Secure admin access &middot; Villa Paradise Tahiti
        </p>
      </div>
    </div>
  )
}

export default function AdminAuthPage() {
  return <SignInForm />
}
