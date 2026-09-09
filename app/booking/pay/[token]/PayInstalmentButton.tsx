'use client'

import { useState } from 'react'

import { Button } from '@/components/ui'

/**
 * Starts the PayPal approval for one instalment.
 *
 * The amount is never sent from here. The server reads it from the row the
 * token points at, so a guest cannot rewrite what they owe by editing a
 * request, which is the same rule the main checkout follows.
 */
export function PayInstalmentButton({ token }: { token: string }) {
  const [state, setState] = useState<'idle' | 'starting' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function pay() {
    if (state === 'starting') return
    setState('starting')
    setMessage('')
    try {
      const response = await fetch('/api/booking/instalment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const body = (await response.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null

      if (!response.ok || !body?.url) {
        setState('error')
        setMessage(body?.error ?? 'We could not start the payment. Please try again.')
        return
      }
      window.location.href = body.url
    } catch {
      setState('error')
      setMessage('We could not start the payment. Please try again.')
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={pay}
        disabled={state === 'starting'}
        className="w-full"
      >
        {state === 'starting' ? 'Opening PayPal…' : 'Pay this instalment'}
      </Button>
      {state === 'error' && message ? (
        <p role="alert" className="mt-3 font-sans text-body-sm text-coral">
          {message}
        </p>
      ) : null}
    </>
  )
}
