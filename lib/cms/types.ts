/**
 * Content types — Villa Paradise Tahiti.
 *
 * Hand-rolled TypeScript interfaces mirroring the tables read by
 * the admin. Hand-rolling (vs generated) keeps the surface small,
 * stable, and intentional — generated types can be
 * added later when the schemas stabilise post-launch.
 *
 * Conventions:
 *  - Long-form text fields (description, body, answer, policy) are plain
 *    Markdown strings — sourced from Supabase, rendered via ReactMarkdown.
 *  - Images expose a stable shape so `urlForImage(image)` works regardless
 *    of whether the source is a stored image or a fixture.
 *  - All copy fields are English (US market).
 */

/* ---------------------------------------------------------------------------
 * Primitives
 * ------------------------------------------------------------------------- */

export interface CmsImage {
  _type?: 'image'
  alt?: string
  caption?: string
  /** A direct URL to the stored image —  */
  url?: string
  asset?: {
    _ref?: string
    _type?: 'reference'
    url?: string
  }
}

export interface CmsSlug {
  _type?: 'slug'
  current: string
}

export interface CmsSeo {
  metaTitle?: string
  metaDescription?: string
  ogImage?: CmsImage
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

export interface VillaGalleryItem extends CmsImage {
  category?: 'exterior' | 'interior' | 'pool' | 'lagoon' | 'bedrooms' | 'night'
}

export interface Villa {
  _id: string
  _type: 'villa'
  name: string
  tagline: string
  description: string
  heroVideoUrl?: string
  heroImage: CmsImage
  gallery?: VillaGalleryItem[]
  specs: VillaSpecs
  amenities?: string[]
  location?: VillaLocation
  seo?: CmsSeo
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
  slug: CmsSlug
  category: ExperienceCategory
  shortDescription: string
  description: string
  coverImage: CmsImage
  gallery?: CmsImage[]
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
  seo?: CmsSeo
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
  authorPhoto?: CmsImage
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
  photo?: CmsImage
  bio?: string
}

export interface Post {
  _id: string
  _type: 'post'
  title: string
  slug: CmsSlug
  excerpt: string
  coverImage: CmsImage
  body: string
  author?: PostAuthor
  tags?: string[]
  publishedAt: string
  readingTimeMin?: number
  seo?: CmsSeo
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
  /**
   * French source text, keyed `question` / `answer`, as written in
   * `/admin/content/faq`. The published page stays English, but the FAQ
   * search reads these too: visitors browse through auto-translate and
   * type French words, which cannot match the English source.
   *
   * Already carried end to end (the query selects `*`, `adaptFAQ` spreads
   * the row); it just had to be declared to be usable.
   */
  translations?: Record<string, string>
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
  /** USD → EUR rate for the public currency switcher. Admin-managed; defaults to 0.88. */
  usdToEurRate?: number
  /** Per-season nightly rates (USD). Supabase-only; override the hardcoded SEASONAL_RATES. */
  rate_low_usd?: number | null
  rate_high_usd?: number | null
  rate_peak_usd?: number | null
  bookingTermsUrl?: string
}
