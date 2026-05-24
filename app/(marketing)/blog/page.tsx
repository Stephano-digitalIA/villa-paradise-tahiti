import type { Metadata } from 'next'

import { JsonLd, blogSchema, breadcrumbSchema } from '@/components/seo'
import { BlogGrid } from '@/components/sections/blog/BlogGrid'
import { BlogHero } from '@/components/sections/blog/BlogHero'
import { BlogNewsletter } from '@/components/sections/blog/BlogNewsletter'
import { sanityFetch } from '@/lib/sanity/fetcher'
import { postsQuery, type Post } from '@/lib/sanity'
import { SITE_URL, absoluteUrl, buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Tahiti Inspirations — Villa Paradise Journal',
  description:
    'Practical guides, local tips and Tahiti inspiration from the team behind Villa Paradise. Written by people who actually live here.',
  path: '/blog',
})

/**
 * /blog — Journal index.
 *
 * Server component — fetches all posts (most-recent first via the GROQ
 * sort) and hands them to the grid. The most recent post is rendered as
 * a featured horizontal hero; the rest fall into a 3-column grid.
 *
 * Structured data: schema.org `Blog` + a BreadcrumbList so the index
 * page registers as a proper container of `Article` items.
 */
export default async function BlogIndexPage() {
  const posts = await sanityFetch<Post[]>(postsQuery)

  return (
    <>
      <JsonLd
        data={blogSchema({
          name: 'Villa Paradise Tahiti — Journal',
          description:
            'Practical guides, local tips and Tahiti inspiration from the team behind Villa Paradise.',
          path: '/blog',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Journal', url: absoluteUrl('/blog') },
        ])}
      />
      <BlogHero />
      <BlogGrid posts={posts} />
      <BlogNewsletter />
    </>
  )
}
