/**
 * PayPal — public barrel.
 *
 * Import from `@/lib/paypal` so consumers stay decoupled from the
 * fetch-vs-SDK implementation choice (cf. `client.ts` header comment).
 */

export {
  PAYPAL_BASE,
  isPayPalConfigured,
  getPayPalAccessToken,
  getPayPalWebhookId,
  resetPayPalTokenCache,
} from './client'

export {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrder,
  type CreatePayPalOrderParams,
  type CreatePayPalOrderResult,
  type CapturePayPalOrderResult,
  type GetPayPalOrderResult,
} from './orders'

export {
  verifyPayPalWebhook,
  type PayPalWebhookEvent,
  type PayPalWebhookResult,
} from './webhook'
