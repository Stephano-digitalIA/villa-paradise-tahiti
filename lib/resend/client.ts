/**
 * Resend client singleton — Villa Paradise Tahiti (Phase E1).
 *
 * Single place where the SDK is instantiated. We expose:
 *   - `resend`            : the SDK instance (or `null` in mock mode).
 *   - `isResendConfigured`: a boolean helper used by every send function.
 *
 * Mock mode rules (no `RESEND_API_KEY` in env):
 *   - `resend` is `null`.
 *   - Every `send*` function in `./send.ts` short-circuits, logs a
 *     structured line, and returns `{ ok: false, reason: 'not_configured' }`.
 *   - We never throw — the app must keep working in local dev / preview.
 *
 * Why we read the env at module load time:
 *   The Resend SDK only reads the key at construction. The `lib/resend`
 *   module is server-only (Next.js route handlers + RSC) so module load
 *   happens inside a Node.js process — there's no risk of leaking the
 *   key to the browser.
 */

import { Resend } from 'resend'

/**
 * Trimmed env value, or `undefined` when missing / empty.
 * We deliberately treat empty strings as "not configured" because that's
 * the default in `.env.example`.
 */
function readEnv(name: string): string | undefined {
  const raw = process.env[name]
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const RESEND_API_KEY = readEnv('RESEND_API_KEY')

/**
 * The Resend SDK instance, or `null` when no API key is configured.
 *
 * Callers must check `isResendConfigured()` (or null-narrow `resend`)
 * before invoking `resend.emails.send`.
 */
export const resend: Resend | null = RESEND_API_KEY
  ? new Resend(RESEND_API_KEY)
  : null

/**
 * `true` when a Resend API key is present in the environment.
 *
 * The send helpers in `./send.ts` use this to short-circuit cleanly in
 * mock mode rather than throw at the SDK level.
 */
export function isResendConfigured(): boolean {
  return resend !== null
}

/**
 * "From" address used on every outbound email. Falls back to a clearly
 * fake value so misconfiguration is visible in dev logs without crashing.
 *
 * `.env.example` exposes this as `EMAIL_FROM`. We also accept
 * `RESEND_FROM_EMAIL` as a compatibility alias for parity with the brief.
 */
export const FROM_EMAIL: string =
  readEnv('EMAIL_FROM') ??
  readEnv('RESEND_FROM_EMAIL') ??
  'villaparadisetahiti@gmail.com'

/**
 * Owner inbox — where booking and contact notifications land.
 *
 * `.env.example` exposes this as `EMAIL_OWNER`. We also accept
 * `RESEND_OWNER_EMAIL` for parity with the brief.
 */
export const OWNER_EMAIL: string =
  readEnv('EMAIL_OWNER') ??
  readEnv('RESEND_OWNER_EMAIL') ??
  'thierry@villaparadisetahiti.com'

/**
 * Public site URL — used to build absolute links inside emails. Falls
 * back to the production host so emails from local dev still render
 * with working CTAs.
 */
export const SITE_URL: string =
  readEnv('NEXT_PUBLIC_SITE_URL') ?? 'https://villaparadisetahiti.com'
