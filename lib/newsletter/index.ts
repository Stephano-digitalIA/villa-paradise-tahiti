/**
 * Newsletter helpers, server-only.
 *
 * Single opt-in: an address is subscribed the moment it is submitted, and gets
 * a welcome email at once. That choice puts the weight on two things, both
 * handled here: the address must be normalised so the same inbox cannot enter
 * twice, and every subscriber must carry a token that lets them leave in one
 * click without proving who they are.
 */
import { randomBytes } from 'node:crypto'

import { SITE_URL } from '@/lib/seo'

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
 * Render the operator's plain text into the body of an email.
 *
 * The admin composes in light Markdown, which is what a non-technical operator
 * will actually type without being taught anything: a line starting with `#` is
 * a heading, `**bold**` is bold, `[text](url)` is a link, a blank line starts a
 * paragraph. Anything else is escaped, so a stray `<` in the text cannot inject
 * markup into the email.
 */
export function renderNewsletterHtml(body: string): string {
  const escape = (t: string) =>
    t
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const inline = (t: string) =>
    escape(t)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" style="color:#006994">$1</a>',
      )

  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const heading = block.match(/^(#{1,3})\s+(.*)$/)
      if (heading) {
        const size = [22, 18, 16][heading[1].length - 1]
        return `<h${heading[1].length} style="font-size:${size}px;margin:24px 0 8px;color:#1A2A3A">${inline(heading[2])}</h${heading[1].length}>`
      }
      if (/^[-*]\s+/.test(block)) {
        const items = block
          .split('\n')
          .map((l) => l.replace(/^[-*]\s+/, '').trim())
          .filter(Boolean)
          .map((l) => `<li style="margin-bottom:6px">${inline(l)}</li>`)
          .join('')
        return `<ul style="padding-left:20px;margin:12px 0">${items}</ul>`
      }
      return `<p style="margin:0 0 14px;line-height:1.6">${inline(block.replace(/\n/g, '<br>'))}</p>`
    })
    .join('')
}

/** Plain-text twin of the HTML body, for clients that refuse HTML. */
export function renderNewsletterText(body: string, unsubUrl: string): string {
  const plain = body
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1 ($2)')
  return `${plain}\n\n---\nSe désinscrire en un clic : ${unsubUrl}`
}
