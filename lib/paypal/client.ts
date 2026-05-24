/**
 * PayPal REST client — Villa Paradise Tahiti (Phase E2).
 *
 * We deliberately avoid `@paypal/paypal-server-sdk`:
 *  - the official SDK is large, sometimes lags behind the REST API, and
 *    pulls a CommonJS-only dependency tree that Next.js' bundler dislikes.
 *  - the Orders v2 endpoints we need are 3 simple HTTPS calls behind an
 *    OAuth2 client-credentials flow. `fetch` does the job in ~30 lines.
 *
 * Public surface:
 *   - `PAYPAL_BASE`           : sandbox or live API root, switched by env.
 *   - `isPayPalConfigured()`  : true when both client id + secret present.
 *   - `getPayPalAccessToken()`: short-lived OAuth token, returned as a
 *                                string or `null` (never throws).
 *
 * Caching: PayPal tokens last ~9 hours. For a marketing site that gets a
 * handful of bookings per day, a fresh token per call is fine. We
 * memoize in-process for the token's lifetime to avoid hammering the
 * auth endpoint on bursts (which would also slow PayPal-side rate limits).
 */

function readEnv(name: string): string | undefined {
  const raw = process.env[name]
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * API root — sandbox by default. The dashboard URLs differ too; document
 * them in the env section of `.env.example` and `docs/06-technique-stack.md`.
 */
export const PAYPAL_BASE: string =
  readEnv('PAYPAL_MODE') === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

/**
 * `true` when both PayPal credentials are configured. The webhook id is
 * a separate concern (`getPayPalWebhookId()`) because some Phase E2
 * paths can work without it (manual capture from the return URL).
 */
export function isPayPalConfigured(): boolean {
  return Boolean(readEnv('PAYPAL_CLIENT_ID') && readEnv('PAYPAL_CLIENT_SECRET'))
}

export function getPayPalWebhookId(): string | undefined {
  return readEnv('PAYPAL_WEBHOOK_ID')
}

/* ---------------------------------------------------------------------------
 * Access token — OAuth2 client-credentials
 * ------------------------------------------------------------------------- */

interface CachedToken {
  value: string
  expiresAt: number
}

let cachedToken: CachedToken | null = null

/**
 * Get a fresh PayPal access token (or a cached one if still valid).
 *
 * Returns `null` (never throws) when:
 *  - PayPal isn't configured (no creds in env), or
 *  - the auth call fails (network, bad creds, throttling).
 */
export async function getPayPalAccessToken(): Promise<string | null> {
  if (!isPayPalConfigured()) return null

  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value
  }

  const clientId = readEnv('PAYPAL_CLIENT_ID')!
  const clientSecret = readEnv('PAYPAL_CLIENT_SECRET')!
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  try {
    const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    })

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error('[paypal:auth] token request failed', res.status, await res.text().catch(() => ''))
      return null
    }

    const data = (await res.json()) as {
      access_token?: string
      expires_in?: number
    }

    if (!data.access_token) {
      // eslint-disable-next-line no-console
      console.error('[paypal:auth] response missing access_token')
      return null
    }

    const ttlMs = (data.expires_in ?? 32_400) * 1000
    cachedToken = { value: data.access_token, expiresAt: now + ttlMs }
    return data.access_token
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[paypal:auth] exception', err)
    return null
  }
}

/**
 * Clears the cached token. Exported for tests and credential rotation
 * scripts; not part of the day-to-day surface.
 */
export function resetPayPalTokenCache(): void {
  cachedToken = null
}
