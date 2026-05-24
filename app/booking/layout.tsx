import type { ReactNode } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'

/**
 * Booking funnel layout — minimal chrome wrapper around the calculator,
 * checkout, success and cancel pages.
 *
 * What this does:
 *  - Renders the booking-specific minimal footer with the trust /
 *    secure-checkout strip below `{children}`.
 *  - Keeps the global Header (from `app/layout.tsx`) visible — we want
 *    users to be able to navigate out of the funnel if they need to.
 *
 * What this DOES NOT do (and why):
 *  - It does not hide the marketing Footer rendered by the root layout.
 *    Next.js App Router stacks layouts; a nested layout cannot remove a
 *    DOM node that an outer layout has emitted. To hide the global
 *    `<Footer />` on `/booking/*`, the orchestrator should extend
 *    `components/layout/ChromeGate.tsx` so it also opts out on this
 *    route (similar to how it currently opts out of `/studio`).
 *    See "TODOs" in the D2 report for the recommended one-liner.
 */

interface BookingLayoutProps {
  children: ReactNode
}

export default function BookingLayout({ children }: BookingLayoutProps) {
  return (
    <>
      {children}

      {/* Booking funnel mini-footer — tiny, distraction-free, trust-first. */}
      <div className="border-t border-pearl-400 bg-pearl py-4">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-midnight-400">
            <Lock className="h-3 w-3 text-gold" aria-hidden="true" />
            <span>Secure checkout · Encrypted via Stripe & PayPal</span>
          </div>
          <nav
            aria-label="Booking footer"
            className="flex items-center gap-4 text-xs text-midnight-400"
          >
            <Link
              href="/legal/privacy-policy"
              className="transition-colors hover:text-gold focus-visible:text-gold focus-visible:outline-none focus-visible:underline"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="transition-colors hover:text-gold focus-visible:text-gold focus-visible:outline-none focus-visible:underline"
            >
              Terms
            </Link>
            <Link
              href="/legal/cancellation"
              className="transition-colors hover:text-gold focus-visible:text-gold focus-visible:outline-none focus-visible:underline"
            >
              Cancellation
            </Link>
          </nav>
        </div>
      </div>
    </>
  )
}
