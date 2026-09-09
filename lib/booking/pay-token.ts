import { randomBytes } from 'node:crypto'

/**
 * Token that authenticates a payment link.
 *
 * It is the only credential on the instalment page: the guest clicks a link in
 * an email and pays, without an account. So it has to be unguessable, and it
 * has to be per instalment rather than per reservation, or paying the second
 * would hand over a link to the third.
 *
 * 24 random bytes, url-safe. Guessing one is not a realistic attack.
 */
export function newPayToken(): string {
  return randomBytes(24).toString('base64url')
}
