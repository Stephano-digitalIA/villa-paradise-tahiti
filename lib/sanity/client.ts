import { createClient, type SanityClient } from 'next-sanity'

import { apiVersion, dataset, isMockMode, projectId, readToken } from './env'

/**
 * Sanity client.
 *
 * Returns `null` in mock mode so callers can decide what to do without
 * triggering runtime errors. The `sanityFetch` helper in `./fetcher` is
 * the canonical consumer — it short-circuits to mock data when the client
 * is null.
 */
export const client: SanityClient | null = isMockMode
  ? null
  : createClient({
      projectId,
      dataset,
      apiVersion,
      // CDN is fine for public, published content. Disable for previews or
      // when the read token is used to fetch drafts.
      useCdn: !readToken,
      token: readToken,
      perspective: 'published',
    })
