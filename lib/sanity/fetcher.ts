/**
 * lib/sanity/fetcher.ts — Supabase bridge
 *
 * This module keeps the original `sanityFetch<T>(query, params?, options?)`
 * call signature so every page that imports it continues to compile unchanged.
 *
 * Internally it routes each GROQ query constant (from ./queries.ts) to the
 * corresponding Supabase query function and runs the result through the
 * adapters in lib/supabase/adapters.ts to produce the camelCase shape that
 * the existing components expect.
 *
 * The `options` argument (revalidate / tags) is accepted for API compatibility
 * but is currently a no-op because Supabase queries are always fresh on the
 * server; ISR caching can be re-introduced at the Next.js page/route layer.
 */

import {
  getSettings,
  getVilla,
  getGalleryItems,
  getExperiences,
  getExperienceBySlug,
  getReviews,
  getPosts,
  getPostBySlug,
  getFAQs,
  type GetExperiencesOptions,
} from '@/lib/supabase/queries'

import {
  mockVilla,
  mockExperiences,
  mockReviews,
  mockPosts,
  mockFaqs,
  mockSettings,
} from './mock-data'

import {
  adaptSettings,
  adaptVilla,
  adaptExperience,
  adaptReview,
  adaptPost,
  adaptFAQ,
  adaptGalleryItem,
} from '@/lib/supabase/adapters'

import {
  villaQuery,
  settingsQuery,
  experiencesQuery,
  experiencesByCategoryQuery,
  featuredExperiencesQuery,
  experienceBySlugQuery,
  reviewsQuery,
  featuredReviewsQuery,
  postsQuery,
  postBySlugQuery,
  faqsQuery,
} from './queries'

/* ---------------------------------------------------------------------------
 * Types (kept for callers that imported SanityFetchOptions)
 * ------------------------------------------------------------------------- */

export interface SanityFetchOptions {
  /** Retained for API compatibility — currently unused. */
  revalidate?: number | false
  /** Retained for API compatibility — currently unused. */
  tags?: string[]
}

/* ---------------------------------------------------------------------------
 * Main entry point
 * ------------------------------------------------------------------------- */

/**
 * Fetch content by GROQ query string, routed to Supabase instead of Sanity.
 *
 * Routes are matched by strict equality against the query constants exported
 * from `./queries.ts` — the same mechanism that the old mock dispatcher used,
 * which means all existing call sites continue to work without modification.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  _options: SanityFetchOptions = {},
): Promise<T> {
  /* --- Settings ---------------------------------------------------------- */
  if (query === settingsQuery) {
    const data = await getSettings()
    if (data) return adaptSettings(data) as T
    return mockSettings as unknown as T
  }

  /* --- Villa ------------------------------------------------------------- */
  if (query === villaQuery) {
    const data = await getVilla()
    if (data) return adaptVilla(data) as T
    return mockVilla as unknown as T
  }

  /* --- Experiences ------------------------------------------------------- */
  if (query === featuredExperiencesQuery) {
    const data = await getExperiences({ featured: true, active: true })
    if (data.length) return data.map(adaptExperience) as T
    return mockExperiences.filter((e) => e.featured) as unknown as T
  }

  if (query === experiencesByCategoryQuery) {
    const category = params?.category as GetExperiencesOptions['category']
    const data = await getExperiences({ category, active: true })
    if (data.length) return data.map(adaptExperience) as T
    return mockExperiences.filter((e) => !category || e.category === category) as unknown as T
  }

  if (query === experienceBySlugQuery) {
    const slug = params?.slug as string | undefined
    if (!slug) return null as T
    const data = await getExperienceBySlug(slug)
    if (data) return adaptExperience(data) as T
    return (mockExperiences.find((e) => e.slug.current === slug) ?? null) as unknown as T
  }

  if (query === experiencesQuery) {
    const data = await getExperiences({ active: true })
    if (data.length) return data.map(adaptExperience) as T
    return mockExperiences as unknown as T
  }

  /* --- Reviews ----------------------------------------------------------- */
  if (query === featuredReviewsQuery) {
    const data = await getReviews({ featured: true, limit: 8 })
    if (data.length) return data.map(adaptReview) as T
    return mockReviews.filter((r) => r.featured) as unknown as T
  }

  if (query === reviewsQuery) {
    const data = await getReviews()
    if (data.length) return data.map(adaptReview) as T
    return mockReviews as unknown as T
  }

  /* --- Blog posts -------------------------------------------------------- */
  if (query === postBySlugQuery) {
    const slug = params?.slug as string | undefined
    if (!slug) return null as T
    const data = await getPostBySlug(slug)
    if (data) return adaptPost(data) as T
    return (mockPosts.find((p) => p.slug.current === slug) ?? null) as unknown as T
  }

  if (query === postsQuery) {
    const data = await getPosts({ publishedOnly: true })
    if (data.length) return data.map(adaptPost) as T
    return mockPosts as unknown as T
  }

  /* --- FAQs -------------------------------------------------------------- */
  if (query === faqsQuery) {
    const data = await getFAQs()
    if (data.length) return data.map(adaptFAQ) as T
    return mockFaqs as unknown as T
  }

  /* --- Gallery (not a GROQ query — direct call, kept for completeness) --- */
  if (query.includes('gallery')) {
    const data = await getGalleryItems()
    if (data.length) return data.map(adaptGalleryItem) as T
    return [] as unknown as T
  }

  // Unknown query — warn and return null rather than throwing, mirroring the
  // old mock behaviour so pages that hit an unmapped branch degrade gracefully.
  console.warn('[sanityFetch] Unmapped query — returning null.\n', query.substring(0, 120))
  return null as T
}
