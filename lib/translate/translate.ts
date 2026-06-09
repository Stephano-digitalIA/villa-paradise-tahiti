/**
 * FR → EN translation helpers — Villa Paradise Tahiti.
 *
 * Degrades gracefully: on a missing key (mock mode) or any API error the
 * functions return the original French text (passthrough) so the admin can
 * still edit and publish — they never throw. Logs mirror the Resend style
 * (`[translate:mock]` / `[translate:error]`).
 *
 * Markdown is preserved (legal pages are stored as markdown). The model is
 * instructed to translate prose only and leave markdown structure intact.
 */

import { anthropic, isTranslateConfigured, TRANSLATE_MODEL } from './client'

const SYSTEM_PROMPT = `You are a professional French-to-English translator for a \
luxury villa rental in Tahiti (French Polynesia) targeting US guests.

Rules:
- Translate the French input into natural, elegant US English fitting a luxury \
hospitality brand.
- Preserve all Markdown structure exactly: headings (#), lists, links, bold/italic, \
line breaks. Translate only the human-readable text, never the markup.
- Keep proper nouns, place names, brand names, numbers, and units as-is.
- Output ONLY the translated text. No preamble, no quotes, no explanation.`

/**
 * Translate a single French string to English.
 * Empty input returns '' without an API call. Falls back to the input text on
 * mock mode or error.
 */
export async function translateFrToEn(text: string): Promise<string> {
  const fr = (text ?? '').trim()
  if (fr === '') return ''

  if (!isTranslateConfigured() || !anthropic) {
    // eslint-disable-next-line no-console
    console.info('[translate:mock] passthrough (no ANTHROPIC_API_KEY)')
    return text
  }

  try {
    const message = await anthropic.messages.create({
      model: TRANSLATE_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: fr }],
    })
    const out = message.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim()
    return out.length > 0 ? out : text
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[translate:error] FR→EN failed, passthrough:', err)
    return text
  }
}

/**
 * Translate many French strings to English, in parallel. Order is preserved.
 * Each entry independently falls back to its input on error.
 */
export async function translateFrToEnBatch(texts: string[]): Promise<string[]> {
  return Promise.all(texts.map((t) => translateFrToEn(t)))
}
