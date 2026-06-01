/**
 * Resend barrel — Villa Paradise Tahiti (Phase E1).
 *
 * Public surface consumed by:
 *   - `app/api/contact/route.ts`           (Phase E1)
 *   - `app/api/checkout/route.ts`          (Phase E2 — Stripe/PayPal webhook)
 *
 * Always import from `@/lib/resend` rather than reaching into submodules.
 */

export {
  FROM_EMAIL,
  OWNER_EMAIL,
  SITE_URL,
  isResendConfigured,
  resend,
} from './client'

export {
  sendBookingConfirmationGuest,
  sendBookingNotificationOwner,
  sendContactAutoReply,
  sendContactInquiryNotification,
  sendCustomCustomerEmail,
} from './send'

export type {
  BookingConfirmationData,
  ContactInquiryData,
  EmailResult,
} from './types'
