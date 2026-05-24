import type { Metadata } from 'next'
import { Suspense } from 'react'

import { CancelPageClient } from '@/components/booking/checkout'

/**
 * /booking/cancel — landing when the user aborts a payment.
 *
 * Server component for metadata + initial paint. The interactive client
 * (which reads `?ref=` / `?session_id=`) is wrapped in Suspense — Next 14
 * requires it for any `useSearchParams` consumer.
 *
 * Important: this page does NOT clear the booking localStorage on
 * purpose — users who cancel should be able to come back to checkout
 * without having to rebuild their cart.
 */

export const metadata: Metadata = {
  title: 'Booking cancelled — Villa Paradise Tahiti',
  description:
    'Your booking was cancelled and no charges have been made. Your selection is still saved — return to checkout whenever you are ready.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function CancelPage() {
  return (
    <Suspense fallback={null}>
      <CancelPageClient />
    </Suspense>
  )
}
