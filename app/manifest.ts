import type { MetadataRoute } from 'next'

import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo'

/**
 * Web App Manifest — `/manifest.webmanifest`.
 *
 * Minimal PWA-ready manifest. The icons are referenced by absolute path
 * and need to be uploaded to `/public/icon-192.png` and
 * `/public/icon-512.png` (see "TODOs post-assets" in the F1 report).
 *
 * Theme colors mirror the design tokens used in `tailwind.config.ts`:
 *  - background: `#FAFAF8` (pearl)
 *  - theme:      `#C9A84C` (gold)
 *
 * Reference: docs/02-design-identite.md.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'Villa Paradise',
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF8',
    theme_color: '#C9A84C',
    orientation: 'portrait-primary',
    categories: ['travel', 'lifestyle'],
    icons: [
      {
        src: '/placeholder.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
