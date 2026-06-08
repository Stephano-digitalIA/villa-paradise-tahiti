/**
 * Sanity content types — Villa Paradise Tahiti.
 *
 * Hand-rolled TypeScript interfaces mirroring the Sanity schemas in
 * `sanity/schemas/`. Hand-rolling (vs generated) keeps the surface small,
 * stable, and intentional — generated types from `sanity-codegen` can be
 * added later when the schemas stabilise post-launch.
 *
 * Conventions:
 *  - Long-form text fields (description, body, answer, policy) are plain
 *    Markdown strings — sourced from Supabase, rendered via ReactMarkdown.
 *  - Images expose a stable shape so `urlForImage(image)` works regardless
 *    of whether the source is a real Sanity asset or a mock.
 *  - All copy fields are English (US market).
 */

/* ---------------------------------------------------------------------------
 * Primitives
 * ------------------------------------------------------------------------- */

export interface SanityImage {
  _type?: 'image'
  alt?: string
  caption?: string
  /** Mock-mode escape hatch — a direct URL to use instead of a real Sanity asset. */
  url?: string
  asset?: {
    _ref?: string
    _type?: 'reference'
    url?: string
  }
}

export interface SanitySlug {
  _type?: 'slug'
  current: string
}

export interface SanitySeo {
  metaTitle?: string
  metaDescription?: string
  ogImage?: SanityImage
}

/* ---------------------------------------------------------------------------
 * Villa (singleton)
 * ------------------------------------------------------------------------- */

export interface VillaSpecs {
  bedrooms: number
  bathrooms: number
  maxGuests: number
  sizeSqm?: number
  sizeSqft?: number
  hasPool: boolean
  hasJacuzzi: boolean
  hasAC: boolean
  hasWifi: boolean
  hasParking: boolean
}

export interface VillaLocation {
  address?: string
  city?: string
  country?: string
  lat?: number
  lng?: number
}

export interface VillaGalleryItem extends SanityImage {
  category?: 'exterior' | 'interior' | 'pool' | 'lagoon' | 'bedrooms' | 'night'
}

export interface Villa {
  _id: string
  _type: 'villa'
  name: string
  tagline: string
  description: string
  heroVideoUrl?: string
  heroImage: SanityImage
  gallery?: VillaGalleryItem[]
  specs: VillaSpecs
  amenities?: string[]
  location?: VillaLocation
  seo?: SanitySeo
}

/* ---------------------------------------------------------------------------
 * Experience
 * ------------------------------------------------------------------------- */

export type ExperienceCategory =
  | 'excursion'
  | 'evening'
  | 'dining'
  | 'wellness'
  | 'cultural'
  | 'adventure'

export type PriceUnit = 'per_person' | 'flat' | 'per_group'

export interface ExperienceProviderRef {
  _id: string
  name: string
  website?: string
}

export interface Experience {
  _id: string
  _type: 'experience'
  title: string
  slug: SanitySlug
  category: ExperienceCategory
  shortDescription: string
  description: string
  coverImage: SanityImage
  gallery?: SanityImage[]
  duration: string
  priceUSD: number
  priceUnit: PriceUnit
  minGuests?: number
  maxGuests?: number
  seasonal: boolean
  seasonStart?: string
  seasonEnd?: string
  provider?: ExperienceProviderRef
  highlights?: string[]
  meetingPoint?: string
  popularity: number
  featured: boolean
  active: boolean
  seo?: SanitySeo
}

/* ---------------------------------------------------------------------------
 * Excursion Provider (back-office)
 * ------------------------------------------------------------------------- */

export interface ExcursionProvider {
  _id: string
  _type: 'excursionProvider'
  name: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  commissionPercent?: number
  notes?: string
  services?: string[]
  active: boolean
}

/* ---------------------------------------------------------------------------
 * Review
 * ------------------------------------------------------------------------- */

export type ReviewSource = 'direct' | 'airbnb' | 'vrbo' | 'google' | 'tripadvisor'

export interface Review {
  _id: string
  _type: 'review'
  authorName: string
  authorLocation?: string
  authorPhoto?: SanityImage
  rating: 1 | 2 | 3 | 4 | 5
  title: string
  body: string
  stayDates?: {
    from?: string
    to?: string
  }
  verified: boolean
  source: ReviewSource
  featured: boolean
  publishedAt: string
}

/* ---------------------------------------------------------------------------
 * Blog Post
 * ------------------------------------------------------------------------- */

export interface PostAuthor {
  name: string
  photo?: SanityImage
  bio?: string
}

export interface Post {
  _id: string
  _type: 'post'
  title: string
  slug: SanitySlug
  excerpt: string
  coverImage: SanityImage
  body: string
  author?: PostAuthor
  tags?: string[]
  publishedAt: string
  readingTimeMin?: number
  seo?: SanitySeo
}

/* ---------------------------------------------------------------------------
 * FAQ
 * ------------------------------------------------------------------------- */

export type FaqCategory = 'booking' | 'villa' | 'tahiti' | 'payment' | 'experiences'

export interface FAQ {
  _id: string
  _type: 'faq'
  question: string
  answer: string
  category: FaqCategory
  order: number
}

/* ---------------------------------------------------------------------------
 * Settings (singleton)
 * ------------------------------------------------------------------------- */

export interface SettingsSocialLinks {
  instagram?: string
  facebook?: string
  pinterest?: string
  youtube?: string
  tiktok?: string
}

export interface Settings {
  _id: string
  _type: 'settings'
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone?: string
  whatsappNumber?: string
  socialLinks?: SettingsSocialLinks
  defaultCancellationPolicy?: string
  defaultMinNights: number
  defaultDepositPercent: number
  defaultNightlyRateUSD?: number
  cleaningFeeUSD?: number
  /** Per-season nightly rates (USD). Supabase-only; override the hardcoded SEASONAL_RATES. */
  rate_low_usd?: number | null
  rate_high_usd?: number | null
  rate_peak_usd?: number | null
  bookingTermsUrl?: string
}
