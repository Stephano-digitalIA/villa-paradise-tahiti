/**
 * Numbers inside editable copy.
 *
 * A sentence like "A 5-night minimum stay applies" goes stale the day the
 * operator changes the minimum in Réglages. The copy keeps a placeholder
 * instead, `{minNights}`, and the page fills it in from the live settings,
 * so the number can only ever come from one place.
 *
 * Unknown placeholders are left as they are, so a typo shows on the page
 * rather than silently vanishing.
 */
export type CopyValues = Record<string, string | number | null | undefined>

export function fillPlaceholders(text: string, values: CopyValues): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) => {
    const v = values[name]
    return v === null || v === undefined ? match : String(v)
  })
}

/** The values the rates page exposes to its copy. */
export function ratesCopyValues(input: {
  minNights?: number | null
  maxGuests?: number | null
  longStayNights?: number | null
  longStayPercent?: number | null
  depositPercent?: number | null
}): CopyValues {
  return {
    minNights: input.minNights ?? 5,
    maxGuests: input.maxGuests ?? 8,
    longStayNights: input.longStayNights ?? 14,
    longStayPercent: input.longStayPercent ?? 10,
    depositPercent: input.depositPercent ?? 30,
  }
}
