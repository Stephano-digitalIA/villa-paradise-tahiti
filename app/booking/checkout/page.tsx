import type { Metadata } from 'next'

import { BookingProvider } from '@/components/booking'
import { CheckoutPageClient } from '@/components/booking/checkout'
import { sanityFetch } from '@/lib/sanity/fetcher'
import {
  experiencesQuery,
  settingsQuery,
  type Experience,
  type Settings,
} from '@/lib/sanity'

/**
 * /booking/checkout — customer information + payment method selection.
 *
 * Server component: fetches the same Sanity catalogues as `/booking`
 * (experiences + settings) and forwards them to the same
 * `<BookingProvider>` so the cart state hydrates from the user's
 * localStorage on the client side.
 *
 * Why fetch again here:
 *  - Pricing rules (deposit %, cleaning fee, min nights) live in
 *    `settings` and the recap on this page needs to display the deposit.
 *  - Selected experiences are stored by slug in localStorage; if the
 *    Sanity catalogue changes between two visits the Provider can still
 *    recompute them against fresh data.
 */

export const metadata: Metadata = {
  title: 'Checkout — Villa Paradise Tahiti',
  description:
    'Confirm your details and pay your deposit to secure your villa stay in Tahiti. Secure checkout via Stripe and PayPal.',
  robots: {
    // Funnel page — personal cart state, no SEO value.
    index: false,
    follow: true,
  },
}

export default async function CheckoutPage() {
  const [experiences, settings] = await Promise.all([
    sanityFetch<Experience[]>(experiencesQuery),
    sanityFetch<Settings>(settingsQuery),
  ])

  return (
    <BookingProvider
      experiences={experiences ?? []}
      settings={settings ?? null}
    >
      <CheckoutPageClient />
    </BookingProvider>
  )
}
