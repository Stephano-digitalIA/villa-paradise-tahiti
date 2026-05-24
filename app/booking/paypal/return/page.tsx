import type { Metadata } from 'next'
import { Suspense } from 'react'

import { PayPalReturnClient } from './PayPalReturnClient'

/**
 * /booking/paypal/return — interstitial page PayPal redirects to after
 * the user approves an order on PayPal's hosted page.
 *
 * Flow:
 *   1. PayPal sends the user back with `?token={orderId}&PayerID=...&ref={reservationId}`.
 *   2. The client component calls `/api/paypal/capture` with that order id.
 *   3. On success, it redirects to `/booking/success?ref={reservationId}`.
 *   4. On failure, it redirects to `/booking/cancel?ref={reservationId}`.
 *
 * We wrap the client in Suspense — Next.js 14 requires it for any
 * `useSearchParams()` consumer.
 */

export const metadata: Metadata = {
  title: 'Confirming your booking… — Villa Paradise Tahiti',
  description: 'Finalizing your PayPal payment. This will only take a moment.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PayPalReturnPage() {
  return (
    <Suspense fallback={null}>
      <PayPalReturnClient />
    </Suspense>
  )
}
