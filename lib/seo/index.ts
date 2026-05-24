/**
 * SEO helpers barrel.
 *
 * Import from `@/lib/seo` rather than reaching into submodules so the
 * surface stays narrow and refactorable.
 */

export {
  DEFAULT_OG_IMAGE,
  ORG_CONTACT,
  ORG_SAME_AS,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TWITTER_HANDLE,
  SITE_URL,
  absoluteUrl,
} from './config'

export { buildMetadata, type BuildMetadataParams } from './metadata'
