import imageUrlBuilder from '@sanity/image-url'
import type { Image as SanityImageSource } from 'sanity'

import { dataset, isMockMode, projectId } from './env'
import type { SanityImage } from './types'

/**
 * Image URL builder.
 *
 * In real-Sanity mode, returns a chainable URL builder backed by Sanity CDN.
 * In mock mode, returns a builder that yields back the literal `url` already
 * present on the mock image — every call (`.width()`, `.fit()`, etc.)
 * silently no-ops so consumer code stays identical.
 */

interface FluentBuilder {
  url(): string
  width(_v: number): FluentBuilder
  height(_v: number): FluentBuilder
  fit(_v: string): FluentBuilder
  format(_v: string): FluentBuilder
  quality(_v: number): FluentBuilder
  auto(_v: string): FluentBuilder
}

function makeMockBuilder(url: string): FluentBuilder {
  const noop: FluentBuilder = {
    url: () => url,
    width: () => noop,
    height: () => noop,
    fit: () => noop,
    format: () => noop,
    quality: () => noop,
    auto: () => noop,
  }
  return noop
}

const realBuilder = isMockMode ? null : imageUrlBuilder({ projectId, dataset })

/**
 * Resolve a Sanity image source to a URL builder.
 *
 * Accepts both `SanityImage` (our type) and the broader `SanityImageSource`
 * the underlying library expects.
 */
export function urlForImage(
  source: SanityImage | SanityImageSource | null | undefined,
): FluentBuilder {
  // Mock mode — read the embedded URL directly.
  if (!realBuilder) {
    const asAny = (source ?? {}) as SanityImage
    const url = asAny.url ?? asAny.asset?.url ?? ''
    return makeMockBuilder(url)
  }

  if (!source) {
    return makeMockBuilder('')
  }

  return realBuilder.image(source as SanityImageSource) as unknown as FluentBuilder
}
