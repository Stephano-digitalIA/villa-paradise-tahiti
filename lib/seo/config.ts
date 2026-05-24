/**
 * Global SEO configuration constants.
 *
 * Centralises site-wide identifiers so we never hard-code the canonical URL
 * or brand name in metadata, structured data, sitemaps, or OG images.
 * `NEXT_PUBLIC_SITE_URL` is the single source of truth — set it in
 * `.env.local` for previews and per-environment in Vercel for production.
 */

export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://villaparadisetahiti.com'

export const SITE_NAME = 'Villa Paradise Tahiti'

export const SITE_DESCRIPTION =
  'A private luxury villa retreat in Tahiti, French Polynesia. Direct booking with curated experiences and concierge services.'

/** Locale of all marketing copy. */
export const SITE_LOCALE = 'en_US'

/** Default OG image served by Next 14 `app/opengraph-image.tsx`. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`

/** Twitter / X handle for `twitter:site`. Optional — empty means omit. */
export const SITE_TWITTER_HANDLE = ''

/** Brand contact metadata used in Organization JSON-LD. */
export const ORG_CONTACT = {
  email: 'hello@villaparadisetahiti.com',
  phone: '+689 87 12 34 56',
  streetAddress: 'Punaauia Coast Road',
  city: 'Punaauia',
  region: 'Tahiti',
  postalCode: '98718',
  country: 'PF',
  countryName: 'French Polynesia',
  latitude: -17.6373,
  longitude: -149.6014,
} as const

/** Social profile URLs surfaced via Organization `sameAs`. */
export const ORG_SAME_AS: readonly string[] = [
  'https://instagram.com/villaparadisetahiti',
  'https://facebook.com/villaparadisetahiti',
  'https://pinterest.com/villaparadisetahiti',
]

/**
 * Absolute URL helper — joins a path to the site origin. Pure string concat
 * to keep this safe at edge runtime where `URL` polyfills can misbehave.
 */
export function absoluteUrl(path: string = ''): string {
  if (!path) return SITE_URL
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
