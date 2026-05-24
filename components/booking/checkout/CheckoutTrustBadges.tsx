/**
 * CheckoutTrustBadges — server component (no state, no hooks).
 *
 * Four reassurance badges shown under the checkout form. Targets the US
 * audience — `docs/03-cible-marche-us.md` lists "secure payment",
 * "cancellation policy", and "fast response" as the must-haves before a
 * direct-booking customer commits to a wire transfer.
 *
 * Visual tone: pearl background, subtle border, gold icon — sits below
 * the form without competing with the gold "Continue to Payment" CTA.
 */

import { Clock, Lock, ShieldCheck, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

interface TrustBadge {
  icon: typeof Lock
  title: string
  body: string
}

const BADGES: TrustBadge[] = [
  {
    icon: Lock,
    title: 'Secure payment',
    body: '256-bit SSL · Stripe & PayPal · We never store card details',
  },
  {
    icon: ShieldCheck,
    title: 'Flexible cancellation',
    body: 'Cancel up to 60 days before arrival for a 90% refund',
  },
  {
    icon: Clock,
    title: 'Fast response',
    body: 'Our concierge replies within 1 hour, 7 days a week',
  },
  {
    icon: Sparkles,
    title: 'Direct booking',
    body: 'No third-party fees · 4.9★ on Airbnb · Verified host',
  },
]

interface CheckoutTrustBadgesProps {
  className?: string
}

export function CheckoutTrustBadges({ className }: CheckoutTrustBadgesProps) {
  return (
    <section
      aria-label="Booking guarantees"
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {BADGES.map(({ icon: Icon, title, body }) => (
        <div
          key={title}
          className="flex items-start gap-3 rounded-xl border border-pearl-400 bg-pearl p-4 shadow-soft"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gold/15 text-gold"
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="font-heading text-sm font-semibold text-midnight">
              {title}
            </p>
            <p className="font-sans text-xs leading-snug text-midnight-400">
              {body}
            </p>
          </div>
        </div>
      ))}
    </section>
  )
}
