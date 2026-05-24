'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

/**
 * LegalSidebar — sticky in-page nav across the three legal documents.
 *
 * Client component because it reads `usePathname()` to mark the active
 * entry; the rest of the legal pages stay server components. The aside
 * is hidden on smaller viewports (the same links live in the footer)
 * and revealed at `lg:` to keep mobile reading uncluttered.
 */

interface LegalNavItem {
  href: string
  label: string
  description: string
}

const LEGAL_NAV: readonly LegalNavItem[] = [
  {
    href: '/legal/privacy-policy',
    label: 'Privacy Policy',
    description: 'What we collect & your rights',
  },
  {
    href: '/legal/terms',
    label: 'Terms of Service',
    description: 'Booking conditions',
  },
  {
    href: '/legal/cancellation',
    label: 'Cancellation Policy',
    description: 'Refunds & change requests',
  },
] as const

export function LegalSidebar() {
  const pathname = usePathname()

  return (
    <aside
      aria-label="Legal navigation"
      className={cn(
        'hidden lg:block',
        'lg:sticky lg:top-28 lg:self-start',
        'lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto'
      )}
    >
      <p className="text-eyebrow font-semibold uppercase text-gold">Legal</p>
      <nav className="mt-4">
        <ul className="space-y-1">
          {LEGAL_NAV.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group block rounded-lg px-4 py-3',
                    'border-l-2 transition-colors duration-200',
                    isActive
                      ? 'border-gold bg-pearl-300/40'
                      : 'border-transparent hover:border-pearl-400 hover:bg-pearl-300/30'
                  )}
                >
                  <span
                    className={cn(
                      'block font-sans text-body-md font-medium',
                      isActive ? 'text-midnight' : 'text-midnight'
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="mt-0.5 block font-sans text-body-sm text-midnight-400">
                    {item.description}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-8 rounded-2xl border border-pearl-400 bg-pearl-300/40 p-5">
        <p className="text-eyebrow font-semibold uppercase text-gold">Need help?</p>
        <p className="mt-2 font-sans text-body-sm text-midnight-400">
          Questions about a booking, refund, or data request?
        </p>
        <Link
          href="/contact"
          className="mt-3 inline-block font-sans text-body-sm font-medium text-lagoon underline-offset-4 hover:underline"
        >
          Contact our team &rarr;
        </Link>
      </div>
    </aside>
  )
}
