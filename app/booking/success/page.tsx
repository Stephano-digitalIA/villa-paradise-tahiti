import type { Metadata } from 'next'
import { Suspense } from 'react'

import { SuccessPageClient } from '@/components/booking/checkout'

/**
 * /booking/success — post-payment confirmation page.
 *
 * Architecture:
 *  - This file stays a server component for the `metadata` export and
 *    cheap initial paint.
 *  - The interactive bits (`useSearchParams`, `clearBookingState` on
 *    mount) live in `SuccessPageClient`, wrapped in `<Suspense>` per
 *    the Next.js 14 requirement for `useSearchParams()`.
 *
 * Phase E note: when Stripe is wired in, the success URL becomes
 *   `${SITE}/booking/success?session_id={CHECKOUT_SESSION_ID}`
 * — `SuccessPageClient` already accepts both `?ref=` (current stub) and
 * `?session_id=` for forward compatibility.
 */

export const metadata: Metadata = {
  title: 'Booking confirmed — Villa Paradise Tahiti',
  description:
    'Your booking is confirmed. Pre-arrival concierge details are on their way to your inbox.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessPageClient />
    </Suspense>
  )
}
