/**
 * Stripe client singleton — Villa Paradise Tahiti (Phase E2).
 *
 * One place to instantiate the SDK. Mock-mode (no `STRIPE_SECRET_KEY`) is a
 * first-class citizen: `stripe` is `null` and `isStripeConfigured()`
 * returns `false`, so the `/api/checkout` route can transparently fall
 * back to the Phase D2 stub for local dev / preview.
 *
 * `apiVersion` is pinned to whatever the SDK's `LatestApiVersion` type
 * exposes — Stripe types the version field as a strict literal so any
 * older string fails to typecheck. Pinning explicitly makes future
 * upgrades intentional (bump the SDK + re-run typecheck).
 */

import Stripe from 'stripe'

function readEnv(name: string): string | undefined {
  const raw = process.env[name]
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const STRIPE_SECRET_KEY = readEnv('STRIPE_SECRET_KEY')

/**
 * The Stripe SDK instance, or `null` when no API key is configured.
 *
 * Callers must check `isStripeConfigured()` (or null-narrow) before using.
 */
export const stripe: Stripe | null = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      // Use the SDK's latest known version. Bumping the SDK forces the
      // app maintainer to opt into a new dashboard version intentionally.
      apiVersion: '2025-08-27.basil',
      typescript: true,
      appInfo: {
        name: 'Villa Paradise Tahiti',
        url: 'https://villaparadisetahiti.com',
      },
    })
  : null

/**
 * `true` when both the API secret AND the webhook secret are present.
 * We require both because the public API is only useful end-to-end if we
 * can also process the webhook callback.
 */
export function isStripeConfigured(): boolean {
  return stripe !== null && Boolean(readEnv('STRIPE_WEBHOOK_SECRET'))
}

/**
 * Returns the configured webhook secret, or `undefined`. Centralised here
 * so the webhook handler doesn't read `process.env` directly.
 */
export function getStripeWebhookSecret(): string | undefined {
  return readEnv('STRIPE_WEBHOOK_SECRET')
}
