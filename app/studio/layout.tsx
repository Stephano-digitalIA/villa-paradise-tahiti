/**
 * Studio layout — minimal wrapper for the embedded Sanity Studio.
 *
 * The root layout (`app/layout.tsx`) already hides Header/Footer for
 * `/studio` via `ChromeGate`, so this layout exists mainly to declare
 * viewport metadata that the Studio expects (no scaling, full height)
 * and to clearly mark this branch of the tree as non-marketing.
 */

import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Villa Paradise Studio',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
