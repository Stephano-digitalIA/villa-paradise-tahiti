/**
 * Stripe webhook signature verification — Villa Paradise Tahiti (Phase E2).
 *
 * Wraps `stripe.webhooks.constructEvent` with:
 *   - **Raw body reading** that respects the Next.js Web Request API
 *     (no body-parser shenanigans — we read `await req.text()`).
 *   - **Mock-mode safety** : if Stripe isn't configured, we don't attempt
 *     verification at all. The webhook route then responds 503 — production
 *     deployments must wire the secret.
 *   - **Never throws** : returns `null` on any failure so the caller can
 *     issue a clean `400 Invalid signature` response.
 *
 * IMPORTANT: the route that uses this MUST run on the Node.js runtime
 * (`export const runtime = 'nodejs'`). The Edge runtime cannot construct
 * the HMAC the SDK uses for signature verification.
 */

import type Stripe from 'stripe'

import { getStripeWebhookSecret, stripe } from './client'

/**
 * Verify and parse an incoming Stripe webhook request.
 *
 * Returns the parsed `Stripe.Event` on success, `null` on any error
 * (missing signature, bad signature, missing config, malformed body).
 * Logs verbose context on failure for debugging — Stripe redelivers up
 * to 3× automatically so transient logs are useful.
 */
export async function verifyStripeWebhook(
  req: Request,
): Promise<Stripe.Event | null> {
  const secret = getStripeWebhookSecret()
  if (!stripe || !secret) {
    // eslint-disable-next-line no-console
    console.warn('[stripe:webhook] not configured — skipping verification')
    return null
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    // eslint-disable-next-line no-console
    console.warn('[stripe:webhook] missing stripe-signature header')
    return null
  }

  let rawBody: string
  try {
    rawBody = await req.text()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[stripe:webhook] failed to read raw body', err)
    return null
  }

  try {
    // `constructEvent` does the heavy lifting: timing-safe signature
    // comparison + replay-protection via the timestamp inside the header.
    const event = stripe.webhooks.constructEvent(rawBody, signature, secret)
    return event
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // eslint-disable-next-line no-console
    console.error('[stripe:webhook] signature verification failed', message)
    return null
  }
}
