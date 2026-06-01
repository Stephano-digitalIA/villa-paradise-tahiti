'use client'

import { useState, type FormEvent } from 'react'
import { CheckCircle2, Mail } from 'lucide-react'

import { Button, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

interface EmailMagicLinkFormProps {
  redirectTo?: string
  /**
   * Path of the route handler that exchanges the OAuth code for a session.
   * Defaults to the customer callback `/auth/callback`. Admin callers must
   * pass `/admin/auth/callback` so the `admin_users` whitelist is enforced.
   */
  callbackPath?: string
  className?: string
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function EmailMagicLinkForm({
  redirectTo = '/booking/checkout',
  callbackPath = '/auth/callback',
  className,
}: EmailMagicLinkFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email || status === 'sending') return

    setStatus('sending')
    setErrorMsg(null)

    const supabase = createClient()
    const callbackUrl =
      window.location.origin +
      `${callbackPath}?next=${encodeURIComponent(redirectTo)}`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl },
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
      return
    }

    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div
        className={className}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3 rounded-xl border border-leaf/30 bg-leaf/10 p-4">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 flex-none text-leaf"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <p className="font-sans text-body-sm font-semibold text-midnight">
              Check your inbox
            </p>
            <p className="font-sans text-body-sm text-midnight-400">
              We've sent a sign-in link to <span className="font-medium text-midnight">{email}</span>.
              The link expires in 1 hour.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus('idle')
                setEmail('')
              }}
              className="mt-1 self-start text-xs font-medium uppercase tracking-wider2 text-gold underline-offset-2 hover:underline"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <label htmlFor="auth-email" className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-300"
            aria-hidden="true"
          />
          <Input
            id="auth-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'sending'}
            error={status === 'error'}
            className="pl-9"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={status === 'sending' || !email}
        >
          {status === 'sending' ? 'Sending link…' : 'Email me a sign-in link'}
        </Button>
      </div>

      {status === 'error' && errorMsg ? (
        <p
          role="alert"
          className="mt-2 text-xs text-coral"
        >
          {errorMsg}
        </p>
      ) : null}
    </form>
  )
}
