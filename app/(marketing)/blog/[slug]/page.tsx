import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  JsonLd,
  articleSchema,
  breadcrumbSchema,
} from '@/components/seo'
import { BlogArticleBody } from '@/components/sections/blog/BlogArticleBody'
import { BlogArticleCta } from '@/components/sections/blog/BlogArticleCta'
import { BlogArticleHero } from '@/components/sections/blog/BlogArticleHero'
import { BlogAuthorBio } from '@/components/sections/blog/BlogAuthorBio'
import { BlogRelated } from '@/components/sections/blog/BlogRelated'
import { sanityFetch } from '@/lib/sanity/fetcher'
import {
  postBySlugQuery,
  postsQuery,
  urlForImage,
  type Post,
} from '@/lib/sanity'
import { SITE_URL, absoluteUrl, buildMetadata } from '@/lib/seo'

interface BlogPostPageProps {
  params: { slug: string }
}

/**
 * Generate the static set of /blog/[slug] paths at build time.
 * In mock mode this reads the local fixtures; with real Sanity it hits
 * the API. Either way the surface stays the same.
 */
export async function generateStaticParams() {
  const posts = await sanityFetch<Post[]>(postsQuery)
  return posts.map((post) => ({ slug: post.slug.current }))
}

/**
 * Per-post SEO metadata, sourced from `post.seo` with sensible fallbacks
 * on title / description / cover image.
 */
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await sanityFetch<Post | null>(postBySlugQuery, {
    slug: params.slug,
  })

  if (!post) {
    return buildMetadata({
      title: 'Article not found — Villa Paradise Tahiti',
      description:
        'The article you are looking for is no longer available. Browse the latest Villa Paradise Tahiti journal entries.',
      path: `/blog/${params.slug}`,
      noIndex: true,
    })
  }

  const ogImage = post.seo?.ogImage
    ? urlForImage(post.seo.ogImage).width(1200).height(630).fit('crop').url()
    : urlForImage(post.coverImage).width(1200).height(630).fit('crop').url()

  return buildMetadata({
    title: post.seo?.metaTitle ?? `${post.title} — Villa Paradise Tahiti`,
    description: post.seo?.metaDescription ?? post.excerpt,
    path: `/blog/${post.slug.current}`,
    image: ogImage,
    imageAlt: post.coverImage.alt ?? post.title,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.publishedAt,
    authors: post.author?.name ? [post.author.name] : undefined,
  })
}

/**
 * /blog/[slug] — single article view.
 *
 * Layout:
 *  1. Full-width hero (cover image + floating meta card)
 *  2. Portable-text body, constrained to a comfortable measure
 *  3. Author bio
 *  4. Booking CTA
 *  5. Related posts (up to 2)
 *
 * Structured data: schema.org `Article` + a BreadcrumbList linking back
 * to the journal index.
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await sanityFetch<Post | null>(postBySlugQuery, {
    slug: params.slug,
  })

  if (!post) {
    notFound()
  }

  // Fetch the rest to pick related posts. Cheap with both the mock and
  // real Sanity (already cached after the first call thanks to ISR).
  const allPosts = await sanityFetch<Post[]>(postsQuery)
  const related = allPosts.filter((p) => p._id !== post._id).slice(0, 2)

  return (
    <>
      <JsonLd data={articleSchema(post)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Journal', url: absoluteUrl('/blog') },
          { name: post.title, url: absoluteUrl(`/blog/${post.slug.current}`) },
        ])}
      />
      <BlogArticleHero post={post} />
      <BlogArticleBody post={post} />
      {post.author ? <BlogAuthorBio author={post.author} /> : null}
      <BlogArticleCta />
      <BlogRelated posts={related} />
    </>
  )
}
