import type { CmsImage } from './types'

/**
 * Image URL resolver.
 *
 * This used to wrap Sanity's image-url builder, which rewrote a URL to add
 * width, crop and quality. The content now comes from Supabase, whose images
 * are plain URLs on a storage bucket with no transform endpoint, so the
 * builder had been running in its no-op branch for a long time: it returned
 * the embedded URL and quietly discarded every `.width()` and `.fit()`.
 *
 * That branch is now the whole implementation, and the Sanity dependency is
 * gone. The chainable shape is kept on purpose: eight call sites read
 * `urlForImage(x).width(1600).quality(85).url()`, and rewriting them to drop
 * arguments that never did anything would be a larger diff for no gain. It
 * also leaves the seam in place if a real transform service is added later.
 *
 * Callers should not expect resizing to happen. `next/image` handles that.
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

function builderFor(url: string): FluentBuilder {
  const self: FluentBuilder = {
    url: () => url,
    width: () => self,
    height: () => self,
    fit: () => self,
    format: () => self,
    quality: () => self,
    auto: () => self,
  }
  return self
}

/** Resolve an image reference to a chainable builder. Never throws on null. */
export function urlForImage(source: CmsImage | null | undefined): FluentBuilder {
  const image = (source ?? {}) as CmsImage
  return builderFor(image.url ?? image.asset?.url ?? '')
}
