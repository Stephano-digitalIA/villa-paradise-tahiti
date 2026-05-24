'use client'

/**
 * CheckoutBreadcrumb — 3-step progress trail for the booking funnel.
 *
 *  1. Build your stay   (active when on /booking)
 *  2. Checkout          (active when on /booking/checkout)
 *  3. Confirmation      (active when on /booking/success)
 *
 * Marked as a client component because we want users to see the funnel
 * even mid-form — no client-side state required, but pairing it with
 * the form keeps it logically grouped.
 */

import Link from 'next/link'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

export type CheckoutStep = 'stay' | 'checkout' | 'confirmation'

interface Step {
  id: CheckoutStep
  label: string
  href: string
}

const STEPS: Step[] = [
  { id: 'stay', label: 'Build your stay', href: '/booking' },
  { id: 'checkout', label: 'Checkout', href: '/booking/checkout' },
  { id: 'confirmation', label: 'Confirmation', href: '#' },
]

interface CheckoutBreadcrumbProps {
  current: CheckoutStep
}

export function CheckoutBreadcrumb({ current }: CheckoutBreadcrumbProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === current)

  return (
    <nav aria-label="Checkout steps" className="w-full">
      <ol className="flex flex-wrap items-center justify-center gap-2 text-xs sm:gap-3">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isActive = index === currentIndex
          const isLast = index === STEPS.length - 1

          const baseClasses =
            'inline-flex items-center gap-2 font-sans uppercase tracking-widest2'

          // Only steps we've already walked are clickable. Future steps are
          // disabled so users can't skip the funnel.
          const labelMarkup = isCompleted ? (
            <Link
              href={step.href}
              className={cn(baseClasses, 'text-midnight-400 hover:text-gold focus-visible:text-gold')}
            >
              <StepDot completed />
              <span>{step.label}</span>
            </Link>
          ) : (
            <span
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                baseClasses,
                isActive ? 'text-midnight' : 'text-midnight-300',
              )}
            >
              <StepDot active={isActive} index={index + 1} />
              <span>{step.label}</span>
            </span>
          )

          return (
            <li key={step.id} className="flex items-center gap-2 sm:gap-3">
              {labelMarkup}
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-px w-6 sm:w-10',
                    index < currentIndex ? 'bg-gold' : 'bg-pearl-500',
                  )}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ---------------------------------------------------------------------------
 * Step dot — numbered or check-marked depending on state.
 * ------------------------------------------------------------------------- */

interface StepDotProps {
  active?: boolean
  completed?: boolean
  index?: number
}

function StepDot({ active, completed, index }: StepDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[10px] font-semibold',
        completed
          ? 'border-gold bg-gold text-midnight'
          : active
            ? 'border-midnight bg-midnight text-pearl'
            : 'border-pearl-500 bg-pearl text-midnight-300',
      )}
    >
      {completed ? <Check className="h-3 w-3" /> : index}
    </span>
  )
}
