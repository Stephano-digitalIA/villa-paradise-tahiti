/**
 * Stripe — public barrel.
 *
 * Import from `@/lib/stripe` so the SDK surface stays narrow and the
 * implementation can be refactored (PaymentIntents-first, e.g.) without
 * touching consumers.
 */

export { stripe, isStripeConfigured, getStripeWebhookSecret } from './client'
export {
  createStripeCheckoutSession,
  type CreateStripeSessionParams,
  type CreateStripeSessionResult,
} from './checkout'
export { verifyStripeWebhook } from './webhook'
