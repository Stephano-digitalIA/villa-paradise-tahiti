'use client'

/**
 * Google Analytics 4 loader — Phase F2.
 *
 * Loads gtag.js via `next/script` with `afterInteractive` strategy so the
 * tracker boots once hydration is done — it never blocks First Paint and
 * never inflates the route-level First Load JS budget.
 *
 * Page-view tracking is handled manually (we set `send_page_view: false`
 * on the initial config) because the Next.js App Router does soft client
 * navigations that gtag.js cannot detect on its own. `GAPageviewTracker`
 * watches `usePathname` + `useSearchParams` and re-fires a `page_view`
 * event on every route change.
 *
 * Behaviour by mode:
 *   - no `NEXT_PUBLIC_GA_ID`  → component renders `null` (mock-safe).
 *   - consent declined        → not rendered by `<ConsentGate />`.
 *   - consent accepted        → scripts injected + SPA page_view tracking.
 *
 * This component is mounted by `<ConsentGate />` only after the visitor
 * has accepted cookies, so it never needs to gate itself on consent.
 */

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import '@/lib/analytics' // side-effect: ambient `window.gtag` types

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

/**
 * Re-fires `page_view` on every App Router navigation (gtag.js can't see
 * client-side route transitions on its own). Wrapped in <Suspense /> so
 * that `useSearchParams()` doesn't bail the whole route into CSR.
 */
function GAPageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_ID) return
    if (typeof window === 'undefined') return
    if (typeof window.gtag !== 'function') return

    const query = searchParams?.toString()
    const url = pathname + (query ? `?${query}` : '')
    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
    })
  }, [pathname, searchParams])

  return null
}

export function GoogleAnalytics() {
  if (!GA_ID) return null

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <GAPageviewTracker />
      </Suspense>
    </>
  )
}
