import type { Metadata } from 'next'

import { BookingPageClient, BookingProvider } from '@/components/booking'
import { cmsFetch } from '@/lib/cms/fetcher'
import {
  experiencesQuery,
  settingsQuery,
  type Experience,
  type Settings,
} from '@/lib/cms'

/**
 * /booking — Villa Paradise Tahiti calculator (Phase D1).
 *
 * Architecture:
 *  - Server component fetches the experiences catalogue + settings
 *    (rates, deposit %, cleaning fee, min nights) once at request time.
 *  - State is then handed off to the client `<BookingProvider>` which
 *    powers a live, localStorage-backed price calculator.
 *  - The "Continue to checkout" CTA points to `/booking/checkout`,
 *    which Phase D2 will build (client form → PayPal).
 *
 * Sources: docs/04-fonctionnalites.md §1, docs/05-contenu-pages.md (booking).
 */

export const metadata: Metadata = {
  title: 'Build Your Stay — Villa Paradise Tahiti',
  description:
    'Configure your villa stay in Tahiti — dates, guests and curated experiences — with live pricing in USD. No commitment until checkout.',
  robots: {
    // Calculator state is per-user; keep search engines out.
    index: false,
    follow: true,
  },
}

export default async function BookingPage() {
  const [experiences, settings] = await Promise.all([
    cmsFetch<Experience[]>(experiencesQuery),
    cmsFetch<Settings>(settingsQuery),
  ])

  return (
    <BookingProvider experiences={experiences ?? []} settings={settings ?? null}>
      <BookingPageClient />
    </BookingProvider>
  )
}
