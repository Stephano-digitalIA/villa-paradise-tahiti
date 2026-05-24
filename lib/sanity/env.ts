/**
 * Sanity environment configuration.
 *
 * Single source of truth for the project's Sanity connection. Other modules
 * (client, image-url, studio config) import from here so the `mock` fallback
 * is decided in exactly one place.
 *
 * Mock mode: when `NEXT_PUBLIC_SANITY_PROJECT_ID` is absent OR equals the
 * sentinel value `"mock"`, the app refuses to talk to Sanity and falls
 * back to `mock-data.ts`. This lets the rest of the codebase be developed
 * before `npx sanity init` is ever run.
 */

const MOCK_SENTINEL = 'mock'

const rawProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? ''
const rawDataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() ?? 'production'
const rawApiVersion = process.env.SANITY_API_VERSION?.trim() ?? '2024-01-01'

/**
 * True when no real Sanity project is configured.
 * In this state, the app must use mock data.
 */
export const isMockMode: boolean =
  rawProjectId.length === 0 || rawProjectId.toLowerCase() === MOCK_SENTINEL

/**
 * The project ID to pass to `createClient` — never the sentinel.
 * Falls back to an obvious placeholder so misconfiguration is visible.
 */
export const projectId: string = isMockMode ? MOCK_SENTINEL : rawProjectId

export const dataset: string = rawDataset

export const apiVersion: string = rawApiVersion

/**
 * Read token — only present in server contexts. Optional for public
 * (published) reads.
 */
export const readToken: string | undefined =
  process.env.SANITY_API_READ_TOKEN?.trim() || undefined

/**
 * Studio basename — must match the Next.js route segment.
 */
export const studioBasePath = '/studio'
