/**
 * Content barrel: the villa, experiences, reviews, posts, FAQs and settings.
 *
 * The folder used to be `lib/sanity` and the data really did come from Sanity.
 * It has come from Supabase for a long time, and the name was actively
 * misleading: `cmsFetch` read Postgres, and the GROQ strings in
 * `queries.ts` are now just keys that `fetcher.ts` matches to a Supabase
 * query function. The Sanity SDK, its Studio route and its client are gone;
 * what stays is the shape those components expect.
 *
 * Import from `@/lib/cms` rather than reaching into submodules, so the surface
 * stays narrow. Not to be confused with `lib/content`, which is the override
 * layer for editable page copy.
 *
 * NOTE: fetcher.ts is server-only, import it directly:
 *   import { cmsFetch } from '@/lib/cms/fetcher'
 */

export { urlForImage } from './image'

export * from './queries'
export * from './types'

// Fixtures, used as the fallback when a Supabase read comes back empty.
export {
  mockExperiences,
  mockFaqs,
  mockPosts,
  mockReviews,
  mockSettings,
  mockVilla,
} from './mock-data'
