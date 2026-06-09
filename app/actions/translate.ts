'use server'

import { translateFrToEn, translateFrToEnBatch } from '@/lib/translate'

/**
 * Generic FR→EN translation server actions, reusable by every admin content
 * form. The admin layout already gates `/admin/*` to verified admin users, so
 * these actions are only reachable by authenticated operators.
 *
 * Both fall back to passthrough (returning the French input) in mock mode or on
 * error — they never throw — so the form's "Translate" button always resolves.
 */

export async function translateText(fr: string): Promise<string> {
  return translateFrToEn(fr)
}

export async function translateBatch(texts: string[]): Promise<string[]> {
  return translateFrToEnBatch(texts)
}
