// ─────────────────────────────────────────────────────────────────────────────
// lib/supabase/adapters.ts
//
// Transforms Supabase snake_case rows into the camelCase shapes that the
// existing marketing-page components expect (previously provided by Sanity).
//
// Rules:
//  - Original row is spread first so no database field is lost.
//  - Compatibility aliases are added ON TOP — they do not replace the source
//    columns, so any code that already reads snake_case keeps working.
//  - Image shaping mirrors SanityImage: { url, alt, caption? }.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Villa,
  Experience,
  Review,
  Post,
  FAQ,
  Settings,
  GalleryItem,
} from './types'

/* ---------------------------------------------------------------------------
 * Villa
 * ------------------------------------------------------------------------- */

export function adaptVilla(v: Villa) {
  return {
    ...v,
    // Compatibility aliases for components expecting Sanity shape
    heroImage: v.hero_image_url
      ? { url: v.hero_image_url, alt: v.hero_image_alt ?? '' }
      : null,
    heroVideoUrl: v.hero_video_url,
    seo: {
      metaTitle: v.seo_title,
      metaDescription: v.seo_description,
    },
    specs: {
      bedrooms: v.bedrooms,
      bathrooms: v.bathrooms,
      maxGuests: v.max_guests,
      sizeSqm: v.size_sqm,
      sizeSqft: v.size_sqft,
      hasPool: v.has_pool,
      hasJacuzzi: v.has_jacuzzi,
      hasAC: v.has_ac,
      hasWifi: v.has_wifi,
      hasParking: v.has_parking,
    },
    location: {
      city: v.city,
      country: v.country,
      lat: v.latitude,
      lng: v.longitude,
    },
  }
}

/* ---------------------------------------------------------------------------
 * Experience
 * ------------------------------------------------------------------------- */

export function adaptExperience(e: Experience) {
  return {
    ...e,
    shortDescription: e.short_description,
    coverImage: e.cover_image_url
      ? { url: e.cover_image_url, alt: e.cover_image_alt ?? e.title }
      : null,
    priceUSD: e.price_usd,
    priceUnit: e.price_unit,
    minGuests: e.min_guests,
    maxGuests: e.max_guests,
    seasonal: e.seasonal,
    seasonStart: e.season_start,
    seasonEnd: e.season_end,
    // Normalize slug to Sanity shape: { current: string }
    slug: { current: e.slug },
    seo: {
      metaTitle: e.seo_title,
      metaDescription: e.seo_description,
    },
  }
}

/* ---------------------------------------------------------------------------
 * Review
 * ------------------------------------------------------------------------- */

export function adaptReview(r: Review) {
  return {
    ...r,
    authorName: r.author_name,
    authorLocation: r.author_location,
    authorPhoto: r.author_photo_url ? { url: r.author_photo_url } : null,
    publishedAt: r.published_at,
    stayDates: r.stay_from ? { from: r.stay_from, to: r.stay_to } : null,
  }
}

/* ---------------------------------------------------------------------------
 * Post
 * ------------------------------------------------------------------------- */

export function adaptPost(p: Post) {
  return {
    ...p,
    excerpt: p.excerpt,
    coverImage: p.cover_image_url
      ? { url: p.cover_image_url, alt: p.cover_image_alt ?? p.title }
      : null,
    publishedAt: p.published_at,
    readingTimeMin: p.reading_time_min,
    author: p.author_name
      ? {
          name: p.author_name,
          photo: p.author_photo_url ? { url: p.author_photo_url } : null,
          bio: p.author_bio,
        }
      : null,
    // Normalize slug to Sanity shape: { current: string }
    slug: { current: p.slug },
    seo: {
      metaTitle: p.seo_title,
      metaDescription: p.seo_description,
    },
  }
}

/* ---------------------------------------------------------------------------
 * FAQ
 * ------------------------------------------------------------------------- */

export function adaptFAQ(f: FAQ) {
  return {
    ...f,
    // answer is already a plain string (Markdown) — no transformation needed.
    // NOTE: components using <PortableText> must be updated to a Markdown
    // renderer (e.g. react-markdown) since there are no PortableTextBlocks here.
    answer: f.answer,
  }
}

/* ---------------------------------------------------------------------------
 * Settings
 * ------------------------------------------------------------------------- */

export function adaptSettings(s: Settings) {
  return {
    ...s,
    siteName: s.site_name,
    siteDescription: s.site_description,
    contactEmail: s.contact_email,
    contactPhone: s.contact_phone,
    whatsappNumber: s.whatsapp_number,
    defaultMinNights: s.default_min_nights,
    defaultDepositPercent: s.default_deposit_percent,
    defaultNightlyRateUSD: s.default_nightly_rate_usd ?? 690,
    cleaningFeeUSD: s.cleaning_fee_usd ?? 150,
    socialLinks: {
      instagram: s.social_instagram,
      facebook: s.social_facebook,
      pinterest: s.social_pinterest,
      tiktok: s.social_tiktok,
    },
    // Pricing rate tiers — used by pricing.ts when available
    rate_low_usd: s.rate_low_usd,
    rate_high_usd: s.rate_high_usd,
    rate_peak_usd: s.rate_peak_usd,
    long_stay_min_nights: s.long_stay_min_nights,
    long_stay_discount_percent: s.long_stay_discount_percent,
  }
}

/* ---------------------------------------------------------------------------
 * GalleryItem
 * ------------------------------------------------------------------------- */

export function adaptGalleryItem(g: GalleryItem) {
  return {
    ...g,
    // Shape the image the same way as SanityImage so gallery components
    // that call urlForImage / read .url and .alt keep working.
    url: g.image_url,
    alt: g.alt,
    caption: g.caption,
    category: g.category,
  }
}

/* ---------------------------------------------------------------------------
 * Derived types
 * ------------------------------------------------------------------------- */

export type AdaptedVilla = ReturnType<typeof adaptVilla>
export type AdaptedExperience = ReturnType<typeof adaptExperience>
export type AdaptedReview = ReturnType<typeof adaptReview>
export type AdaptedPost = ReturnType<typeof adaptPost>
export type AdaptedFAQ = ReturnType<typeof adaptFAQ>
export type AdaptedSettings = ReturnType<typeof adaptSettings>
export type AdaptedGalleryItem = ReturnType<typeof adaptGalleryItem>
