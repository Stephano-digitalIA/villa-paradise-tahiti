import { adminClient } from './admin'
import type {
  Settings,
  Villa,
  GalleryItem,
  Experience,
  ExperienceCategory,
  Review,
  Post,
  FAQ,
  BlockedDate,
} from './types'

// Public queries use adminClient (no cookies required, safe at build time).
const supabase = adminClient

// ─────────────────────────────────────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the single settings row, or null on error / missing row.
 */
export async function getSettings(): Promise<Settings | null> {
  // supabase = adminClient (aliased above)
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('[getSettings]', error.message)
    return null
  }
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// Villa
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the single villa row, or null on error / missing row.
 */
export async function getVilla(): Promise<Villa | null> {
  // supabase = adminClient (aliased above)
  const { data, error } = await supabase
    .from('villa')
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('[getVilla]', error.message)
    return null
  }
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// Gallery
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns active gallery items, optionally filtered by category.
 * Ordered by sort_order ASC.
 */
export async function getGalleryItems(category?: string): Promise<GalleryItem[]> {
  // supabase = adminClient (aliased above)
  let query = supabase
    .from('gallery_items')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (category) {
    query = query.eq('category', category as never)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getGalleryItems]', error.message)
    return []
  }
  return data ?? []
}

// ─────────────────────────────────────────────────────────────────────────────
// Experiences
// ─────────────────────────────────────────────────────────────────────────────

export type GetExperiencesOptions = {
  category?: ExperienceCategory
  featured?: boolean
  /** Defaults to true — pass false to include inactive experiences (admin only). */
  active?: boolean
}

/**
 * Returns experiences with optional filters.
 * Always ordered by sort_order ASC, then popularity DESC.
 */
export async function getExperiences(
  opts: GetExperiencesOptions = {},
): Promise<Experience[]> {
  const { category, featured, active = true } = opts
  // supabase = adminClient (aliased above)

  let query = supabase
    .from('experiences')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('popularity', { ascending: false })

  if (active !== undefined) {
    query = query.eq('active', active)
  }
  if (category) {
    query = query.eq('category', category)
  }
  if (featured !== undefined) {
    query = query.eq('featured', featured)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getExperiences]', error.message)
    return []
  }
  return data ?? []
}

/**
 * Returns a single experience by slug, joining the excursion_providers table.
 * Returns null if not found or on error.
 */
export async function getExperienceBySlug(slug: string): Promise<Experience | null> {
  // supabase = adminClient (aliased above)
  const { data, error } = await supabase
    .from('experiences')
    .select('*, provider:excursion_providers(id, name, website, instagram)')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('[getExperienceBySlug]', error.message)
    return null
  }
  return data as Experience | null
}

/**
 * Returns up to `limit` active experiences in the same category,
 * excluding the current one (by slug).
 */
export async function getRelatedExperiences(
  currentSlug: string,
  category: ExperienceCategory,
  limit = 3,
): Promise<Experience[]> {
  // supabase = adminClient (aliased above)
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('active', true)
    .eq('category', category)
    .neq('slug', currentSlug)
    .order('popularity', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[getRelatedExperiences]', error.message)
    return []
  }
  return data ?? []
}

// ─────────────────────────────────────────────────────────────────────────────
// Reviews
// ─────────────────────────────────────────────────────────────────────────────

export type GetReviewsOptions = {
  featured?: boolean
  source?: string
  limit?: number
}

/**
 * Returns published reviews.
 * Ordered by featured DESC, published_at DESC.
 */
export async function getReviews(opts: GetReviewsOptions = {}): Promise<Review[]> {
  const { featured, source, limit } = opts
  // supabase = adminClient (aliased above)

  let query = supabase
    .from('reviews')
    .select('*')
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })

  if (featured !== undefined) {
    query = query.eq('featured', featured)
  }
  if (source) {
    query = query.eq('source', source as never)
  }
  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getReviews]', error.message)
    return []
  }
  return data ?? []
}

// ─────────────────────────────────────────────────────────────────────────────
// Blog Posts
// ─────────────────────────────────────────────────────────────────────────────

export type GetPostsOptions = {
  /** When true (default), only returns posts with published_at <= now(). */
  publishedOnly?: boolean
}

/**
 * Returns blog posts ordered by published_at DESC.
 */
export async function getPosts(opts: GetPostsOptions = {}): Promise<Post[]> {
  const { publishedOnly = true } = opts
  // supabase = adminClient (aliased above)

  let query = supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false })

  if (publishedOnly) {
    const now = new Date().toISOString()
    query = query
      .not('published_at', 'is', null)
      .lte('published_at', now)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getPosts]', error.message)
    return []
  }
  return data ?? []
}

/**
 * Returns a single published post by slug, or null if not found / on error.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  // supabase = adminClient (aliased above)
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .lte('published_at', now)
    .maybeSingle()

  if (error) {
    console.error('[getPostBySlug]', error.message)
    return null
  }
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns active FAQs, optionally filtered by category.
 * Ordered by category ASC, sort_order ASC.
 */
export async function getFAQs(category?: string): Promise<FAQ[]> {
  // supabase = adminClient (aliased above)

  let query = supabase
    .from('faqs')
    .select('*')
    .eq('active', true)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  if (category) {
    query = query.eq('category', category as never)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getFAQs]', error.message)
    return []
  }
  return data ?? []
}

// ─────────────────────────────────────────────────────────────────────────────
// Blocked Dates
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns blocked date ranges where blocked_to >= today.
 * Ordered by blocked_from ASC.
 */
export async function getBlockedDates(): Promise<BlockedDate[]> {
  // supabase = adminClient (aliased above)
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const { data, error } = await supabase
    .from('blocked_dates')
    .select('*')
    .gte('blocked_to', today)
    .order('blocked_from', { ascending: true })

  if (error) {
    console.error('[getBlockedDates]', error.message)
    return []
  }
  return data ?? []
}
