/**
 * Schema.org structured-data factories.
 *
 * Each helper returns a plain JSON object compatible with Google's Rich
 * Results test. Types are hand-rolled rather than pulled from `schema-dts`
 * to keep our dependency surface minimal — the shapes mirror schema.org
 * but stay narrow on purpose (only the fields we actually emit).
 *
 * Pattern:
 *  - All factories return objects with `@context` + `@type`.
 *  - Callers wrap the return value in `<JsonLd data={...} />`.
 *  - Image URLs MUST be absolute — pass them resolved with `absoluteUrl()`.
 */

import {
  ORG_CONTACT,
  ORG_SAME_AS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from '@/lib/seo'
import type {
  Experience,
  Post,
  Review,
  SanityImage,
  Villa,
} from '@/lib/sanity/types'
import { urlForImage } from '@/lib/sanity/image'

/* ---------------------------------------------------------------------------
 * Shared building blocks
 * ------------------------------------------------------------------------- */

/** Safely resolve a Sanity image to an absolute URL — empty string when missing. */
function imageUrl(image: SanityImage | undefined | null): string {
  if (!image) return ''
  // Prefer the direct `url` (mock mode) or `asset.url` (Sanity expansion).
  const direct = image.url ?? image.asset?.url
  if (direct) return direct
  // Fall back to the URL builder (production Sanity with reference assets).
  return urlForImage(image).width(1600).height(900).fit('crop').url()
}

const ORGANIZATION_ID = `${SITE_URL}#organization`
const WEBSITE_ID = `${SITE_URL}#website`
const VILLA_ID = `${SITE_URL}/villa#vacation-rental`

/* ---------------------------------------------------------------------------
 * Organization
 * ------------------------------------------------------------------------- */

export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/icon-512.png'),
    description: SITE_DESCRIPTION,
    email: ORG_CONTACT.email,
    telephone: ORG_CONTACT.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORG_CONTACT.streetAddress,
      addressLocality: ORG_CONTACT.city,
      addressRegion: ORG_CONTACT.region,
      postalCode: ORG_CONTACT.postalCode,
      addressCountry: ORG_CONTACT.country,
    },
    sameAs: [...ORG_SAME_AS],
  }
}

/* ---------------------------------------------------------------------------
 * Website (with potential SearchAction)
 * ------------------------------------------------------------------------- */

export function websiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'en-US',
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/* ---------------------------------------------------------------------------
 * Vacation rental (primary product)
 * ------------------------------------------------------------------------- */

/**
 * `VacationRental` is the most specific schema.org type for short-term
 * rentals. It extends `LodgingBusiness` so it naturally surfaces in Google's
 * lodging carousels and rich results.
 */
export function vacationRentalSchema(villa: Villa): Record<string, unknown> {
  const heroImg = imageUrl(villa.heroImage)
  const galleryImgs = (villa.gallery ?? [])
    .map((g) => imageUrl(g))
    .filter(Boolean)
    .slice(0, 8)
  const images = [heroImg, ...galleryImgs].filter(Boolean)

  const amenities = (villa.amenities ?? []).map((name) => ({
    '@type': 'LocationFeatureSpecification',
    name,
    value: true,
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'VacationRental',
    '@id': VILLA_ID,
    name: villa.name,
    description: villa.tagline,
    url: absoluteUrl('/villa'),
    image: images.length > 0 ? images : undefined,
    brand: { '@id': ORGANIZATION_ID },
    containedInPlace: villa.location?.city
      ? {
          '@type': 'Place',
          name: `${villa.location.city}, ${villa.location.country ?? 'French Polynesia'}`,
        }
      : undefined,
    address: villa.location
      ? {
          '@type': 'PostalAddress',
          streetAddress: villa.location.address,
          addressLocality: villa.location.city,
          addressCountry:
            villa.location.country === 'French Polynesia' ? 'PF' : villa.location.country,
        }
      : undefined,
    geo:
      typeof villa.location?.lat === 'number' && typeof villa.location?.lng === 'number'
        ? {
            '@type': 'GeoCoordinates',
            latitude: villa.location.lat,
            longitude: villa.location.lng,
          }
        : undefined,
    numberOfRooms: villa.specs.bedrooms,
    numberOfBedrooms: villa.specs.bedrooms,
    numberOfBathroomsTotal: villa.specs.bathrooms,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: villa.specs.maxGuests,
      unitCode: 'C62',
    },
    floorSize: villa.specs.sizeSqm
      ? {
          '@type': 'QuantitativeValue',
          value: villa.specs.sizeSqm,
          unitCode: 'MTK',
        }
      : undefined,
    amenityFeature: amenities.length > 0 ? amenities : undefined,
    petsAllowed: false,
    smokingAllowed: false,
  }
}

/* ---------------------------------------------------------------------------
 * Lodging accommodation (lightweight companion schema)
 * ------------------------------------------------------------------------- */

export function accommodationSchema(villa: Villa): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: villa.name,
    description: villa.tagline,
    image: imageUrl(villa.heroImage) || undefined,
    numberOfRooms: villa.specs.bedrooms,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: villa.specs.maxGuests,
    },
    amenityFeature: (villa.amenities ?? []).map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    })),
  }
}

/* ---------------------------------------------------------------------------
 * Experiences → schema.org Product (offers section)
 * ------------------------------------------------------------------------- */

export function productSchema(experience: Experience): Record<string, unknown> {
  const cover = imageUrl(experience.coverImage)
  const priceCurrency = 'USD'

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: experience.title,
    description: experience.shortDescription,
    image: cover ? [cover] : undefined,
    url: absoluteUrl(`/experiences/${experience.slug.current}`),
    brand: { '@id': ORGANIZATION_ID },
    category: experience.category,
    offers: {
      '@type': 'Offer',
      price: experience.priceUSD,
      priceCurrency,
      availability: experience.active
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: absoluteUrl(`/experiences/${experience.slug.current}`),
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: experience.priceUSD,
        priceCurrency,
        valueAddedTaxIncluded: true,
        unitText:
          experience.priceUnit === 'per_person'
            ? 'per person'
            : experience.priceUnit === 'per_group'
              ? 'per group'
              : 'flat rate',
      },
    },
  }
}

/* ---------------------------------------------------------------------------
 * Blog post → schema.org Article
 * ------------------------------------------------------------------------- */

export function articleSchema(post: Post): Record<string, unknown> {
  const cover = imageUrl(post.coverImage)
  const url = absoluteUrl(`/blog/${post.slug.current}`)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: cover ? [cover] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: post.author?.name
      ? {
          '@type': 'Person',
          name: post.author.name,
        }
      : { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en-US',
    keywords: post.tags?.join(', '),
  }
}

/* ---------------------------------------------------------------------------
 * Breadcrumbs
 * ------------------------------------------------------------------------- */

export interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/* ---------------------------------------------------------------------------
 * Aggregate rating + reviews
 * ------------------------------------------------------------------------- */

export function aggregateRatingSchema(
  reviews: Review[],
  /** Optional override — useful when the marketing copy says "100+ reviews" while
   * we only have a subset migrated into Sanity. */
  displayCount?: number,
): Record<string, unknown> | null {
  if (!reviews.length) return null
  const ratingValue =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  const reviewCount = displayCount ?? reviews.length

  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    itemReviewed: { '@id': VILLA_ID },
    ratingValue: Number(ratingValue.toFixed(2)),
    bestRating: 5,
    worstRating: 1,
    ratingCount: reviewCount,
    reviewCount,
  }
}

export function reviewSchema(review: Review): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: { '@id': VILLA_ID },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      '@type': 'Person',
      name: review.authorName,
    },
    reviewBody: review.body,
    name: review.title,
    datePublished: review.publishedAt,
  }
}

/* ---------------------------------------------------------------------------
 * FAQ
 * ------------------------------------------------------------------------- */

export interface FaqEntry {
  question: string
  answer: string
}

export function faqPageSchema(entries: FaqEntry[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  }
}

/* ---------------------------------------------------------------------------
 * Generic pages
 * ------------------------------------------------------------------------- */

export interface CollectionPageParams {
  name: string
  description: string
  path: string
}

export function collectionPageSchema(
  params: CollectionPageParams,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: params.name,
    description: params.description,
    url: absoluteUrl(params.path),
    isPartOf: { '@id': WEBSITE_ID },
  }
}

export interface ImageGalleryParams {
  name: string
  description: string
  path: string
  images: Array<{ url: string; caption?: string }>
}

export function imageGallerySchema(
  params: ImageGalleryParams,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: params.name,
    description: params.description,
    url: absoluteUrl(params.path),
    associatedMedia: params.images.map((image) => ({
      '@type': 'ImageObject',
      contentUrl: image.url,
      caption: image.caption,
    })),
  }
}

export interface ContactPageParams {
  name: string
  description: string
  path: string
}

export function contactPageSchema(
  params: ContactPageParams,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: params.name,
    description: params.description,
    url: absoluteUrl(params.path),
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: { '@id': ORGANIZATION_ID },
  }
}

export interface BlogParams {
  name: string
  description: string
  path: string
}

export function blogSchema(params: BlogParams): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: params.name,
    description: params.description,
    url: absoluteUrl(params.path),
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en-US',
  }
}

/* ---------------------------------------------------------------------------
 * Price specification (rates page)
 * ------------------------------------------------------------------------- */

export interface PriceTier {
  name: string
  /** Nightly rate in USD. */
  priceUSD: number
  /** Optional human-readable season window. */
  season?: string
}

export function priceSpecificationSchema(
  tiers: PriceTier[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${SITE_NAME} — Nightly Rates`,
    description:
      'Direct nightly rates for Villa Paradise Tahiti, varying by season.',
    brand: { '@id': ORGANIZATION_ID },
    url: absoluteUrl('/rates'),
    offers: tiers.map((tier) => ({
      '@type': 'Offer',
      name: tier.name,
      priceCurrency: 'USD',
      price: tier.priceUSD,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: tier.priceUSD,
        priceCurrency: 'USD',
        unitText: 'per night',
        ...(tier.season ? { description: tier.season } : {}),
      },
      availability: 'https://schema.org/InStock',
      url: absoluteUrl('/rates'),
    })),
  }
}
