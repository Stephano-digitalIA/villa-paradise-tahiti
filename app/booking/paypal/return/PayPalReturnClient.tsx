'use client'

/**
 * PayPalReturnClient — captures the PayPal order then redirects.
 *
 * Lives next to its `page.tsx` (route co-located) rather than under
 * `components/booking/` because it's a one-shot, route-specific piece of
 * glue. Phase F may extract this into a reusable "capture & redirect"
 * client if we add Apple Pay or Google Pay flows that follow the same
 * pattern, but for now keeping it local makes the route easy to grep.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'

import { Container, Section } from '@/components/ui'

type CaptureState =
  | { phase: 'capturing' }
  | { phase: 'done'; reservationId?: string }
  | { phase: 'error'; message: string }

export function PayPalReturnClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ranRef = useRef(false)
  const [state, setState] = useState<CaptureState>({ phase: 'capturing' })

  useEffect(() => {
    // React Strict Mode mounts effects twice in dev — guard against the
    // double-capture call. PayPal would dedupe via PayPal-Request-Id but
    // the extra round-trip is wasteful.
    if (ranRef.current) return
    ranRef.current = true

    // PayPal sends the order id under `token`. `ref` is the reservation
    // id we appended ourselves when building the return URL.
    const orderId = searchParams.get('token')
    const refParam = searchParams.get('ref') ?? undefined

    if (!orderId) {
      setState({
        phase: 'error',
        message: 'Missing PayPal order token — please try again.',
      })
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/paypal/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })
        const data = (await res.json().catch(() => ({}))) as {
          status?: string
          reservationId?: string
          error?: string
        }

        if (!res.ok) {
          throw new Error(data.error ?? 'We could not finalize your payment.')
        }

        const reservationId = data.reservationId ?? refParam
        if (cancelled) return

        setState({ phase: 'done', reservationId })

        // Move the user along — the webhook handles emails out-of-band.
        const target = reservationId
          ? `/booking/success?ref=${encodeURIComponent(reservationId)}`
          : '/booking/success'
        router.replace(target)
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : 'Something went wrong with PayPal.'
        setState({ phase: 'error', message })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  return (
    <Section tone="pearl" spacing="tight">
      <Container className="flex flex-col items-center gap-6 py-20 text-center">
        {state.phase === 'capturing' ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-lagoon" aria-hidden="true" />
            <h1 className="font-heading text-h3-luxe font-medium leading-tight text-midnight">
              Confirming your booking…
            </h1>
            <p className="font-sans text-body-md text-midnight-400">
              We are finalizing the payment with PayPal. Please do not close
              this tab.
            </p>
          </>
        ) : null}

        {state.phase === 'done' ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-lagoon" aria-hidden="true" />
            <p className="font-sans text-body-md text-midnight-400">
              Almost there — redirecting you to the confirmation page…
            </p>
          </>
        ) : null}

        {state.phase === 'error' ? (
          <>
            <AlertCircle className="h-8 w-8 text-coral" aria-hidden="true" />
            <h1 className="font-heading text-h3-luxe font-medium leading-tight text-midnight">
              We hit a snag finalizing your payment
            </h1>
            <p className="font-sans text-body-md text-midnight-400">
              {state.message}
            </p>
            <p className="font-sans text-body-sm text-midnight-400">
              No charge has been confirmed yet — you can safely retry from
              the checkout page.
            </p>
            <a
              href="/booking/checkout"
              className="font-sans text-body-md font-semibold text-lagoon underline-offset-4 hover:underline"
            >
              Return to checkout
            </a>
          </>
        ) : null}
      </Container>
    </Section>
  )
}
