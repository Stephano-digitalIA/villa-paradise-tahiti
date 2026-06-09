/**
 * Translation client singleton — Villa Paradise Tahiti.
 *
 * Powers the admin "Translate FR→EN" helper. The public site is English-only;
 * operators write content in French and translate it to the English that is
 * actually published. This module is the single place the Anthropic SDK is
 * instantiated.
 *
 * Mock mode rules (no `ANTHROPIC_API_KEY` in env):
 *   - `anthropic` is `null`.
 *   - `translateFrToEn` short-circuits to a passthrough (returns the FR text
 *     unchanged, editable in the admin), logs `[translate:mock]`, never throws.
 *   - The app keeps working in local dev / preview without a key.
 *
 * Server-only: this module reads the API key at construction. It must never be
 * imported into a "use client" component or the browser bundle.
 */

import Anthropic from '@anthropic-ai/sdk'

/** Trimmed env value, or `undefined` when missing / empty. */
function readEnv(name: string): string | undefined {
  const raw = process.env[name]
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const ANTHROPIC_API_KEY = readEnv('ANTHROPIC_API_KEY')

/** Selected provider — only `anthropic` is implemented today. */
export const TRANSLATE_PROVIDER = (readEnv('TRANSLATE_PROVIDER') ?? 'anthropic').toLowerCase()

/**
 * Haiku 4.5 — fastest, cheapest Claude model. Translation is a simple,
 * high-volume, latency-sensitive task, so Haiku is the right tier here.
 */
export const TRANSLATE_MODEL = 'claude-haiku-4-5'

/**
 * The Anthropic SDK instance, or `null` when no API key is configured.
 * Callers must check `isTranslateConfigured()` before using it.
 */
export const anthropic: Anthropic | null =
  TRANSLATE_PROVIDER === 'anthropic' && ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    : null

/** `true` when a translation provider + key is present in the environment. */
export function isTranslateConfigured(): boolean {
  return anthropic !== null
}
