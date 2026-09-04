'use client'

import { useState } from 'react'

import { Button, Input } from '@/components/ui'

/**
 * The subscription form itself.
 *
 * Split out of `BlogNewsletter` so the surrounding section stays a server
 * component: only the form needs state.
 *
 * Every outcome says something. The previous version had `action="#"`, so
 * submitting reloaded the page and looked like success while discarding the
 * address, which is worse than having no form at all.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    setState('sending')
    setMessage('')
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      })
      const body = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null
      if (!response.ok || !body?.ok) {
        setState('error')
        setMessage(body?.error ?? 'Something went wrong. Please try again.')
        return
      }
      setState('done')
      setEmail('')
    } catch {
      setState('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  if (state === 'done') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mx-auto mt-8 max-w-md rounded-2xl border border-leaf/30 bg-leaf/5 px-6 py-5"
      >
        <p className="font-heading text-body-lg text-midnight">You are on the list.</p>
        <p className="mt-1 font-sans text-body-sm text-midnight-400">
          A welcome email is on its way. If it does not appear within a few minutes,
          have a look in your spam folder.
        </p>
      </div>
    )
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1"
        />

        {/* Honeypot: off-screen, not hidden, so bots that read `display:none`
            still fill it. Never shown to a person, hence aria-hidden. */}
        <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="newsletter-website">Leave this field empty</label>
          <input
            id="newsletter-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <Button type="submit" variant="primary" size="md" disabled={state === 'sending'}>
          {state === 'sending' ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </form>

      {state === 'error' && message ? (
        <p role="alert" className="mt-3 font-sans text-body-sm text-coral">
          {message}
        </p>
      ) : null}
    </>
  )
}
