import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/seo'
import { sanityFetch } from '@/lib/sanity/fetcher'
import {
  experiencesQuery,
  postsQuery,
  type Experience,
  type Post,
} from '@/lib/sanity'

/**
 * `/sitemap.xml` — generated dynamically at build / revalidation time.
 *
 * Composition:
 *  1. Static marketing pages (homepage + 8 secondary + 3 legal).
 *  2. Every active experience detail page from Sanity.
 *  3. Every published blog post from Sanity.
 *
 * Conventions:
 *  - Priorities follow Google's recommendation: 1.0 for the homepage,
 *    0.9 for the core conversion page (`/villa`), 0.7 for other marketing
 *    pages, 0.6 for experiences, 0.5 for blog posts, 0.3 for legal.
 *  - `changeFrequency` is a hint only — real signals come from
 *    `lastModified`, which we wire to `publishedAt` where available.
 *  - Booking, studio, API and other internal routes are deliberately
 *    omitted (also blocked in `robots.ts`).
 *
 * Reference: docs/06-technique-stack.md § 5.
 */

interface StaticEntry {
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
}

const STATIC_ENTRIES: StaticEntry[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/villa', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/experiences', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gallery', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/rates', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/reviews', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/legal/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/legal/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/legal/cancellation', priority: 0.3, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = STATIC_ENTRIES.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }))

  // Dynamic data — done in parallel so the sitemap build stays snappy.
  const [experiences, posts] = await Promise.all([
    sanityFetch<Experience[]>(experiencesQuery).catch(() => [] as Experience[]),
    sanityFetch<Post[]>(postsQuery).catch(() => [] as Post[]),
  ])

  const experienceRoutes: MetadataRoute.Sitemap = (experiences ?? []).map(
    (experience) => ({
      url: `${SITE_URL}/experiences/${experience.slug.current}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }),
  )

  const blogRoutes: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug.current}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...experienceRoutes, ...blogRoutes]
}
