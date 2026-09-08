/**
 * Server-side helpers for the first-party audience measurement.
 *
 * The design constraint drives everything here: measure without identifying.
 * No cookie is set, no IP or user agent is stored, and the only per-visitor
 * value is a hash that cannot be linked from one day to the next. That is
 * what lets the site count every visitor instead of only those who would
 * accept a consent banner.
 */
import { createHash } from 'node:crypto'

/** Search engines whose referrer means "found us by searching". */
const SEARCH_HOSTS = [
  'google.',
  'bing.',
  'duckduckgo.',
  'yahoo.',
  'ecosia.',
  'qwant.',
  'brave.',
  'baidu.',
  'yandex.',
]

/** Networks whose referrer means "came from a social post". */
const SOCIAL_HOSTS = [
  'facebook.',
  'fb.',
  'instagram.',
  'tiktok.',
  'pinterest.',
  'linkedin.',
  't.co',
  'twitter.',
  'x.com',
  'youtube.',
  'reddit.',
  'whatsapp.',
  'messenger.',
]

export type TrafficSource = 'direct' | 'search' | 'social' | 'referral'

export interface VisitContext {
  source: TrafficSource
  referrerHost: string | null
  country: string | null
  device: 'mobile' | 'tablet' | 'desktop'
  visitorDay: string
}

/**
 * Bucket the referrer, keeping the host and discarding the rest.
 *
 * A full referrer URL can carry a search query or a path that identifies a
 * person, so only the host is ever stored, and a visit from our own domain
 * counts as direct rather than as a referral from ourselves.
 */
export function classifyReferrer(
  referrer: string | null,
  selfHost: string,
): { source: TrafficSource; referrerHost: string | null } {
  if (!referrer) return { source: 'direct', referrerHost: null }

  let host: string
  try {
    host = new URL(referrer).hostname.toLowerCase()
  } catch {
    return { source: 'direct', referrerHost: null }
  }

  if (!host || host === selfHost || host.endsWith(`.${selfHost}`)) {
    return { source: 'direct', referrerHost: null }
  }
  if (SEARCH_HOSTS.some((h) => host.includes(h))) {
    return { source: 'search', referrerHost: host }
  }
  if (SOCIAL_HOSTS.some((h) => host.includes(h))) {
    return { source: 'social', referrerHost: host }
  }
  return { source: 'referral', referrerHost: host }
}

/** Coarse device class. Three buckets is all the admin ever shows. */
export function classifyDevice(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase()
  if (/ipad|tablet|playbook|silk/.test(ua)) return 'tablet'
  if (/mobi|android|iphone|ipod|phone/.test(ua)) return 'mobile'
  return 'desktop'
}

/**
 * A per-visitor, per-day value that identifies nobody.
 *
 * The salt includes the date, so the same person visiting tomorrow produces a
 * different hash and no one can follow them across days. It also includes a
 * server secret when one is set, so the hash cannot be recomputed from a
 * guessed IP by anyone who obtains the table. Truncated to 16 hex characters:
 * enough to keep daily collisions negligible at this traffic, short enough to
 * be useless as an identifier.
 */
export function visitorDayHash(ip: string, userAgent: string, day: string): string {
  const secret = process.env.CRON_SECRET?.trim() ?? 'villa-paradise'
  return createHash('sha256')
    .update(`${day}|${secret}|${ip}|${userAgent}`)
    .digest('hex')
    .slice(0, 16)
}

/**
 * Read what the edge tells us about a request.
 *
 * The IP and user agent are used to compute the daily hash and are then
 * dropped: neither is returned, so no caller can store them by accident.
 */
export function visitContextFrom(
  headers: Headers,
  referrer: string | null,
  selfHost: string,
): VisitContext {
  const ip =
    headers.get('x-nf-client-connection-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  const userAgent = headers.get('user-agent') ?? ''

  // Netlify sends geo as a JSON header. Absent everywhere else, hence the try.
  let country: string | null = null
  const geo = headers.get('x-nf-geo')
  if (geo) {
    try {
      const parsed = JSON.parse(geo) as { country?: { code?: string } }
      country = parsed.country?.code ?? null
    } catch {
      country = null
    }
  }
  country = country ?? headers.get('x-country') ?? null

  const { source, referrerHost } = classifyReferrer(referrer, selfHost)
  const day = new Date().toISOString().slice(0, 10)

  return {
    source,
    referrerHost,
    country,
    device: classifyDevice(userAgent),
    visitorDay: visitorDayHash(ip, userAgent, day),
  }
}

/** Strip the query string: it can carry a token or an email address. */
export function safePath(raw: string): string {
  const path = raw.split('?')[0].split('#')[0]
  if (!path.startsWith('/')) return '/'
  return path.length > 1 ? path.replace(/\/+$/, '') || '/' : '/'
}
