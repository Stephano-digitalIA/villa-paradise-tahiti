/**
 * Sanity barrel — Villa Paradise Tahiti.
 *
 * Import from `@/lib/sanity` rather than reaching into submodules so the
 * surface stays narrow and refactorable. The mock fallback is fully
 * transparent — callers never need to know whether they're hitting real
 * Sanity or fixtures.
 */

// NOTE: fetcher.ts is server-only — import directly if needed:
// import { sanityFetch } from '@/lib/sanity/fetcher'
export { client } from './client'
export { apiVersion, dataset, isMockMode, projectId, studioBasePath } from './env'
export { urlForImage } from './image'

export * from './queries'
export * from './types'

// Mock fixtures are re-exported for tests and Storybook-like dev pages.
export {
  mockExperiences,
  mockFaqs,
  mockPosts,
  mockReviews,
  mockSettings,
  mockVilla,
} from './mock-data'
