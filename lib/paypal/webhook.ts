/**
 * PayPal webhook signature verification — Villa Paradise Tahiti (Phase E2).
 *
 * PayPal's signature verification differs from Stripe's: there's no local
 * HMAC. Instead, PayPal exposes a `/v1/notifications/verify-webhook-signature`
 * endpoint that takes the original request headers, the parsed event body
 * (yes, the body, not the raw string) and the configured `webhook_id`, and
 * returns `{ verification_status: "SUCCESS" | "FAILURE" }`.
 *
 * Returns:
 *   - `{ event, verified: true }`  : signature was checked and accepted.
 *   - `{ event, verified: false }` : checked and rejected — caller MUST 400.
 *   - `{ event: null, verified: false }` : couldn't even parse the body
 *     or the secret is missing.
 *
 * Caveat: this function performs **one** outbound HTTP call to PayPal per
 * webhook event. PayPal retries failed deliveries up to 25 times with
 * exponential backoff, so a missed verification call surfaces quickly in
 * the PayPal dashboard.
 */

import { getPayPalAccessToken, getPayPalWebhookId, PAYPAL_BASE } from './client'

export interface PayPalWebhookEvent {
  id?: string
  event_type?: string
  resource_type?: string
  resource?: Record<string, unknown>
  create_time?: string
  [key: string]: unknown
}

export interface PayPalWebhookResult {
  event: PayPalWebhookEvent | null
  verified: boolean
}

/**
 * Read raw text, parse JSON, then ask PayPal to verify the signature.
 * Never throws — the route handler renders a clean error response.
 */
export async function verifyPayPalWebhook(req: Request): Promise<PayPalWebhookResult> {
  const webhookId = getPayPalWebhookId()
  const token = await getPayPalAccessToken()

  let rawBody: string
  try {
    rawBody = await req.text()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[paypal:webhook] failed to read raw body', err)
    return { event: null, verified: false }
  }

  let parsed: PayPalWebhookEvent
  try {
    parsed = JSON.parse(rawBody) as PayPalWebhookEvent
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[paypal:webhook] failed to parse body', err)
    return { event: null, verified: false }
  }

  // Without secrets we still surface the event to the caller so logging /
  // observability stays useful, but we set `verified: false` so the
  // production route can decide whether to bail.
  if (!token || !webhookId) {
    // eslint-disable-next-line no-console
    console.warn('[paypal:webhook] credentials or webhook id missing — skipping verification')
    return { event: parsed, verified: false }
  }

  // Header names per PayPal docs. Express normalises headers to lowercase
  // and Next/Web Request also returns lowercase — we use `req.headers.get`
  // which is case-insensitive.
  const transmissionId = req.headers.get('paypal-transmission-id') ?? ''
  const transmissionTime = req.headers.get('paypal-transmission-time') ?? ''
  const certUrl = req.headers.get('paypal-cert-url') ?? ''
  const authAlgo = req.headers.get('paypal-auth-algo') ?? ''
  const transmissionSig = req.headers.get('paypal-transmission-sig') ?? ''

  if (!transmissionId || !transmissionSig) {
    // eslint-disable-next-line no-console
    console.warn('[paypal:webhook] missing required signature headers')
    return { event: parsed, verified: false }
  }

  try {
    const verifyRes = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: parsed,
      }),
      cache: 'no-store',
    })

    if (!verifyRes.ok) {
      const text = await verifyRes.text().catch(() => '')
      // eslint-disable-next-line no-console
      console.error('[paypal:webhook] verify endpoint error', verifyRes.status, text)
      return { event: parsed, verified: false }
    }

    const data = (await verifyRes.json()) as { verification_status?: string }
    return { event: parsed, verified: data.verification_status === 'SUCCESS' }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[paypal:webhook] verify exception', err)
    return { event: parsed, verified: false }
  }
}
