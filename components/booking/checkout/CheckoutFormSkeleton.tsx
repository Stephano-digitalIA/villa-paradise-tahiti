/**
 * CheckoutFormSkeleton — server-rendered shimmer placeholder.
 *
 * Shown during client-side hydration of the BookingProvider so the page
 * does not flicker between "no data" and "your booking is incomplete".
 * The Provider sets `hydrated = true` once it has read localStorage; the
 * checkout client component swaps this skeleton out at that point.
 *
 * Keeps the same broad shape as the final layout (2 columns, sections)
 * to minimise CLS — the content boxes fall into place instead of jumping.
 */

import { Container, Section } from '@/components/ui'
import { cn } from '@/lib/utils'

interface CheckoutFormSkeletonProps {
  className?: string
}

export function CheckoutFormSkeleton({ className }: CheckoutFormSkeletonProps) {
  return (
    <Section tone="pearl" spacing="compact" className={className}>
      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left column — form */}
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-6 rounded-2xl border border-pearl-400 bg-pearl p-6 shadow-soft sm:p-8">
              <SkeletonBar className="h-6 w-40" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SkeletonField />
                <SkeletonField />
                <SkeletonField />
                <SkeletonField />
              </div>
              <SkeletonBar className="h-6 w-32" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SkeletonField />
                <SkeletonField />
              </div>
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                <SkeletonBar className="h-16 w-full" />
                <SkeletonBar className="h-16 w-full" />
              </div>
              <SkeletonBar className="h-12 w-full" />
            </div>
          </div>

          {/* Right column — summary */}
          <div className="lg:col-span-5">
            <div className="flex flex-col gap-4 rounded-2xl border border-pearl-400 bg-pearl p-6 shadow-card">
              <SkeletonBar className="h-5 w-32" />
              <SkeletonBar className="h-7 w-48" />
              <div className="flex flex-col gap-3 border-t border-pearl-400 pt-4">
                <SkeletonBar className="h-4 w-full" />
                <SkeletonBar className="h-4 w-3/4" />
                <SkeletonBar className="h-4 w-2/3" />
              </div>
              <SkeletonBar className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

interface SkeletonBarProps {
  className?: string
}

function SkeletonBar({ className }: SkeletonBarProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-lg bg-pearl-400/70', className)}
    />
  )
}

function SkeletonField() {
  return (
    <div className="flex flex-col gap-1.5">
      <SkeletonBar className="h-3 w-20" />
      <SkeletonBar className="h-11 w-full" />
    </div>
  )
}
