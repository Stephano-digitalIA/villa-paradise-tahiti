'use client'

import { useState, type FormEvent } from 'react'
import { CheckCircle2, Mail } from 'lucide-react'

import { Button, Input } from '@/components/ui'
import { createImplicitClient } from '@/lib/supabase/client'

interface EmailMagicLinkFormProps {
  /** Path to land on once signed in. Internal path, never a URL. */
  redirectTo?: string
  className?: string
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function EmailMagicLinkForm({
  redirectTo = '/booking/checkout',
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

    // Implicit flow and the client-side completion page, same as the Google
    // button. A magic link is opened wherever the mailbox is — usually the
    // phone, while the booking was started on a laptop. PKCE keeps its code
    // verifier in the browser that asked for the link, so on any other device
    // the exchange failed and the guest landed on the checkout with
    // `?auth_error=1` and no explanation. Implicit carries the tokens in the
    // URL fragment and needs no verifier, so the link works from anywhere.
    const completeUrl =
      window.location.origin +
      `/auth/complete?next=${encodeURIComponent(redirectTo)}`

    const { error } = await createImplicitClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: completeUrl },
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
