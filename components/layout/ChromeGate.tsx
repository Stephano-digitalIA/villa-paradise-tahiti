'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * ChromeGate — hides marketing chrome (Header/Footer/SkipToContent) on
 * routes that should render their own full-screen UI, namely the embedded
 * Sanity Studio at `/studio` (and its sub-paths).
 *
 * Rationale: Next.js App Router enforces a single root layout; we can't
 * branch Header/Footer based on the route at the layout level without
 * route groups + a more invasive restructure. A tiny client gate on
 * `usePathname` is the least-invasive way to keep the studio chrome-free.
 *
 * Lives in `components/layout/` for discoverability; consumed only by
 * `app/layout.tsx`.
 */
export function ChromeGate({
  children,
  hideOnBookingFlow = false,
}: {
  children: ReactNode
  hideOnBookingFlow?: boolean
}) {
  const pathname = usePathname()
  const isStudio = pathname?.startsWith('/studio') ?? false
  const isAdmin = pathname?.startsWith('/admin') ?? false
  const isBookingFlow =
    hideOnBookingFlow &&
    (pathname === '/booking/checkout' ||
      pathname === '/booking/success' ||
      pathname === '/booking/cancel')

  if (isStudio || isAdmin || isBookingFlow) return null
  return <>{children}</>
}
