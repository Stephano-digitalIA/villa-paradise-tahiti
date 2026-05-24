import type { Metadata } from 'next'

import {
  DEFAULT_OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TWITTER_HANDLE,
  SITE_URL,
  absoluteUrl,
} from './config'

/**
 * Factory for page-level metadata.
 *
 * The Next 14 Metadata API will merge each page's `metadata` export with the
 * root layout. We keep this helper minimal — title, description, canonical,
 * OpenGraph, and Twitter — so callers can override anything they need without
 * fighting the merge.
 *
 * Conventions:
 *  - Always pass `path` starting with a slash ("/villa", "/blog/[slug]").
 *  - Pass an absolute image URL or it will be resolved against `SITE_URL`.
 *  - `type: 'article'` enables OpenGraph article props (publishedTime, etc.).
 */

export interface BuildMetadataParams {
  title: string
  description: string
  /** Path on the site, starting with "/". Used for canonical + OG url. */
  path: string
  /** Absolute or relative image URL. Defaults to `DEFAULT_OG_IMAGE`. */
  image?: string
  /** Alt text for the OG image. Defaults to the page title. */
  imageAlt?: string
  /** OpenGraph type. Defaults to `'website'`. */
  type?: 'website' | 'article'
  /** ISO publish date. Only honoured when `type === 'article'`. */
  publishedTime?: string
  /** ISO update date. Only honoured when `type === 'article'`. */
  modifiedTime?: string
  /** Article authors (display names). Only honoured when `type === 'article'`. */
  authors?: string[]
  /** Set true on pages we don't want indexed (booking flow, drafts...). */
  noIndex?: boolean
}

/** Build a Metadata object with sensible OG / Twitter defaults. */
export function buildMetadata(params: BuildMetadataParams): Metadata {
  const {
    title,
    description,
    path,
    image,
    imageAlt,
    type = 'website',
    publishedTime,
    modifiedTime,
    authors,
    noIndex = false,
  } = params

  const url = absoluteUrl(path)
  const ogImage = image ? absoluteUrl(image) : DEFAULT_OG_IMAGE
  const ogImageAlt = imageAlt ?? title

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogImageAlt }],
      ...(type === 'article'
        ? {
            publishedTime,
            modifiedTime,
            authors,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      ...(SITE_TWITTER_HANDLE ? { site: SITE_TWITTER_HANDLE } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}
