/**
 * Newsletter helpers, server-only.
 *
 * Single opt-in: an address is subscribed the moment it is submitted, and gets
 * a welcome email at once. That choice puts the weight on two things, both
 * handled here: the address must be normalised so the same inbox cannot enter
 * twice, and every subscriber must carry a token that lets them leave in one
 * click without proving who they are.
 *
 * Rendering lives in `./render`, which imports nothing from Node so the admin
 * preview can use it in the browser. It is re-exported here for server code.
 */
import { randomBytes } from 'node:crypto'

import { SITE_URL } from '@/lib/seo'

export {
  buildNewsletterEmailHtml,
  renderNewsletterHtml,
  renderNewsletterText,
} from './render'

/** Lower-cased and trimmed, so `Jean@X.com` and `jean@x.com` are one row. */
export function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

/**
 * Deliberately conservative. This is not a full RFC check: the welcome email
 * is the real test of whether an address exists. It rejects the obvious
 * mistakes without turning away a valid but unusual address.
 */
export function isPlausibleEmail(email: string): boolean {
  if (email.length < 6 || email.length > 254) return false
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)
}

/** 32 random bytes, url-safe. Guessing one is not a realistic attack. */
export function newUnsubscribeToken(): string {
  return randomBytes(24).toString('base64url')
}

export function unsubscribeUrl(token: string): string {
  return `${SITE_URL}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
}

/**
 * The link shown in the admin preview. Not a real token: previewing must never
 * mint one, or every look at a draft would leave a stray row behind.
 */
export const PREVIEW_UNSUBSCRIBE_URL = `${SITE_URL}/newsletter/unsubscribe?token=apercu`
