/**
 * Barrel — booking checkout components (Phase D2).
 *
 * Anything inside `components/booking/checkout/` is consumed via this
 * barrel, so route-level pages can stay clean:
 *   import { CheckoutPageClient } from '@/components/booking/checkout'
 */

export { CancelPageClient } from './CancelPageClient'
export { CheckoutBreadcrumb, type CheckoutStep } from './CheckoutBreadcrumb'
export { CheckoutForm } from './CheckoutForm'
export { CheckoutFormSkeleton } from './CheckoutFormSkeleton'
export { CheckoutPageClient } from './CheckoutPageClient'
export { CheckoutSummary } from './CheckoutSummary'
export { CheckoutTrustBadges } from './CheckoutTrustBadges'
export { SuccessPageClient } from './SuccessPageClient'
