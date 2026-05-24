import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/seo'

/**
 * `/robots.txt` — generated dynamically.
 *
 * Allow everything except internal surfaces that have no SEO value and
 * could leak sensitive endpoints to crawlers:
 *  - `/api/*` — webhook + helper routes (no public payload).
 *  - `/studio/*` — Sanity Studio (auth-gated UI).
 *  - `/booking/checkout`, `/booking/success`, `/booking/cancel` — flow
 *    terminals reachable only from the booking funnel itself.
 *
 * The visible booking entry (`/booking` index) stays indexable so the
 * "Check availability" CTA can be discovered from search.
 *
 * Sitemap discovery is wired to `${SITE_URL}/sitemap.xml`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/studio/',
          '/booking/checkout',
          '/booking/success',
          '/booking/cancel',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
