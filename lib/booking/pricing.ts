/**
 * Pricing engine — Villa Paradise Tahiti.
 *
 * Pure functions: given a `BookingState` and a `Settings` snapshot, produce
 * a fully-typed `PriceBreakdown`. No side effects, no DOM, no fetch — every
 * function in this file is deterministic and unit-testable.
 *
 * Computation rules:
 *  - All arithmetic in **integer USD cents** to avoid float drift.
 *  - Rounding only at the breakdown boundary, with `Math.round`.
 *  - Season detection from the **check-in** date alone (mid-stay
 *    season changes are out-of-scope for D1).
 *  - Season boundaries mirror `components/sections/rates/RatesGrid.tsx`
 *    so the public marketing copy and the calculator stay in sync.
 *
 * Sources of truth:
 *  - `docs/04-fonctionnalites.md` §1.5 (récapitulatif).
 *  - `components/sections/rates/RatesGrid.tsx` (saisonnalité affichée).
 *  - Mock `Settings` for fallback rates / cleaning / deposit percent.
 */

import type {
  BookingState,
  PriceBreakdown,
  Season,
  SelectedExperience,
} from './types'

/* ---------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */

/**
 * Seasonal nightly rates in USD.
 * Mirrors `RatesGrid.tsx` — keep both in sync.
 * TODO: pull from Sanity (settings.seasonalRates) once Thierry confirms.
 */
export const SEASONAL_RATES: Record<Season, number> = {
  low: 590,
  high: 890,
  peak: 1290,
}

/** Fallback nightly rate when no season can be detected (e.g. dates blank). */
const FALLBACK_NIGHTLY_RATE = 690

/** Days a saved cart stays valid in localStorage before being discarded. */
export const CART_TTL_DAYS = 7

/* ---------------------------------------------------------------------------
 * Money helpers (integer cents)
 * ------------------------------------------------------------------------- */

/** USD → cents (integer). */
export function toCents(usd: number): number {
  return Math.round(usd * 100)
}

/** cents → USD (rounded to nearest cent, returned as number — display-only). */
export function fromCents(cents: number): number {
  return Math.round(cents) / 100
}

/**
 * Format a USD amount for display.
 * Whole-dollar values are shown without trailing `.00` for visual cleanliness.
 *
 *   formatUSD(150)      → "$150"
 *   formatUSD(6798.5)   → "$6,798.50"
 */
export function formatUSD(amount: number): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount)
}

/* ---------------------------------------------------------------------------
 * Date helpers (UTC-anchored, ISO YYYY-MM-DD)
 * ------------------------------------------------------------------------- */

const MS_PER_DAY = 86_400_000

/** Parse `YYYY-MM-DD` to a UTC Date or null. Returns null for malformed input. */
function parseISODate(iso: string | null | undefined): Date | null {
  if (!iso) return null
  // strict YYYY-MM-DD shape
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  if (Number.isNaN(date.getTime())) return null
  return date
}

/** Today's date as `YYYY-MM-DD` in the user's local timezone. */
export function todayISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Add `days` (positive or negative) to an ISO date string. */
export function addDaysISO(iso: string, days: number): string {
  const date = parseISODate(iso)
  if (!date) return iso
  const next = new Date(date.getTime() + days * MS_PER_DAY)
  return next.toISOString().slice(0, 10)
}

/**
 * Compute the number of nights between two ISO dates.
 * Returns 0 if dates are missing, malformed, or out of order.
 */
export function calculateNights(
  checkIn: string | null,
  checkOut: string | null,
): number {
  const a = parseISODate(checkIn)
  const b = parseISODate(checkOut)
  if (!a || !b) return 0
  const diff = b.getTime() - a.getTime()
  if (diff <= 0) return 0
  return Math.round(diff / MS_PER_DAY)
}

/* ---------------------------------------------------------------------------
 * Season detection
 * ------------------------------------------------------------------------- */

/**
 * Classify a check-in date into a Tahitian rate season.
 *
 * Rule (synced with RatesGrid + docs/04 §Tarification):
 *  - Peak  : Dec 20 → Jan 5  (Christmas + New Year)
 *  - Peak  : Easter week (≈ Mar 28 → Apr 5 every year — coarse approximation)
 *  - High  : Jul → Sep + Dec 6 → Dec 19 + early Jan after the peak
 *  - Low   : everything else (May–Jun, Oct–Nov, Feb–Apr outside peak)
 *
 * For pre-launch we approximate Easter as `Mar 28 → Apr 5`. A precise
 * computus algorithm is overkill here — the marketing copy itself only
 * says "Easter week".
 */
export function getSeason(checkIn: string | null | undefined): Season | null {
  const date = parseISODate(checkIn ?? null)
  if (!date) return null

  const month = date.getUTCMonth() + 1 // 1..12
  const day = date.getUTCDate() // 1..31

  // Peak — Christmas + New Year
  if ((month === 12 && day >= 20) || (month === 1 && day <= 5)) {
    return 'peak'
  }
  // Peak — Easter approximation (coarse, OK for indicative pricing)
  if ((month === 3 && day >= 28) || (month === 4 && day <= 5)) {
    return 'peak'
  }
  // High — Jul, Aug, Sep
  if (month >= 7 && month <= 9) {
    return 'high'
  }
  // High — early-to-mid December (pre-peak holiday) + early January (post-peak)
  if (month === 12 && day < 20) return 'high'
  if (month === 1 && day > 5) return 'high'

  // Everything else — Low
  return 'low'
}

/** Look up the nightly rate (USD) for a given check-in date. */
export function getNightlyRate(checkIn: string | null | undefined): number {
  const season = getSeason(checkIn)
  if (!season) return FALLBACK_NIGHTLY_RATE
  return SEASONAL_RATES[season]
}

/* ---------------------------------------------------------------------------
 * Experience line total
 * ------------------------------------------------------------------------- */

/**
 * Compute the line total (USD) for a single selected experience.
 *
 *   per_person : priceUSD × quantity
 *   per_group  : priceUSD × quantity
 *   flat       : priceUSD (quantity ignored, treated as 1)
 */
export function calculateExperienceLineTotal(exp: SelectedExperience): number {
  if (exp.priceUnit === 'flat') return exp.priceUSD
  const qty = Math.max(1, Math.floor(exp.quantity))
  return exp.priceUSD * qty
}

/* ---------------------------------------------------------------------------
 * Full breakdown
 * ------------------------------------------------------------------------- */

/**
 * Settings shape — only the fields the calculator needs. Decoupling the
 * input here from the full `Settings` type means future schema additions
 * won't tighten this function's contract.
 *
 * Fields are camelCase (matching AdaptedSettings) so callers can pass an
 * AdaptedSettings directly or build a plain object for unit tests.
 */
export interface PricingSettings {
  defaultMinNights?: number
  defaultDepositPercent?: number
  defaultNightlyRateUSD?: number
  cleaningFeeUSD?: number
  /** When present, overrides the hardcoded SEASONAL_RATES.low constant. */
  rate_low_usd?: number | null
  /** When present, overrides the hardcoded SEASONAL_RATES.high constant. */
  rate_high_usd?: number | null
  /** When present, overrides the hardcoded SEASONAL_RATES.peak constant. */
  rate_peak_usd?: number | null
}

/**
 * Input shape for `toPricingSettings` — a structural duck-type that is
 * satisfied by both the Sanity `Settings` type and `AdaptedSettings`. Only
 * the fields actually read by the function are listed, all optional, so
 * callers can pass either type without needing an explicit cast.
 */
export interface SettingsInput {
  defaultMinNights?: number
  defaultDepositPercent?: number
  defaultNightlyRateUSD?: number | null
  cleaningFeeUSD?: number | null
  /** Supabase-only: seasonal rate tiers from the settings row. Absent on Sanity Settings. */
  rate_low_usd?: number | null
  rate_high_usd?: number | null
  rate_peak_usd?: number | null
}

/**
 * Narrow a settings object (Sanity shape or AdaptedSettings) into the
 * `PricingSettings` object consumed by `computeBreakdown`.
 */
export function toPricingSettings(
  settings: SettingsInput | null | undefined,
): PricingSettings {
  return {
    defaultMinNights: settings?.defaultMinNights,
    defaultDepositPercent: settings?.defaultDepositPercent,
    // Convert null → undefined so PricingSettings (which uses number | undefined) stays happy
    defaultNightlyRateUSD: settings?.defaultNightlyRateUSD ?? undefined,
    cleaningFeeUSD: settings?.cleaningFeeUSD ?? undefined,
    rate_low_usd: settings?.rate_low_usd,
    rate_high_usd: settings?.rate_high_usd,
    rate_peak_usd: settings?.rate_peak_usd,
  }
}

/**
 * Compute the full price breakdown from the current booking state.
 *
 * This function is the **only** way to obtain a `PriceBreakdown` — keeping
 * derivation centralized prevents the UI from drifting away from the
 * canonical calculation.
 */
export function computeBreakdown(
  state: BookingState,
  settings: PricingSettings,
): PriceBreakdown {
  const minNights = settings.defaultMinNights ?? 5
  const depositPercent = settings.defaultDepositPercent ?? 30
  const cleaningFee = settings.cleaningFeeUSD ?? 150

  // Build effective seasonal rates: prefer Supabase settings when populated,
  // fall back to the hardcoded constants so pricing stays correct even before
  // the settings row is seeded in the database.
  const effectiveRates: Record<Season, number> = {
    low: settings.rate_low_usd ?? SEASONAL_RATES.low,
    high: settings.rate_high_usd ?? SEASONAL_RATES.high,
    peak: settings.rate_peak_usd ?? SEASONAL_RATES.peak,
  }

  const nights = calculateNights(state.checkIn, state.checkOut)
  const season = getSeason(state.checkIn)
  const nightlyRate = season
    ? effectiveRates[season]
    : (settings.defaultNightlyRateUSD ?? FALLBACK_NIGHTLY_RATE)

  // Work in cents to avoid float drift, then convert at the end.
  const villaSubtotalCents = toCents(nightlyRate) * nights
  const cleaningFeeCents = nights > 0 ? toCents(cleaningFee) : 0
  const experiencesTotalCents = state.selectedExperiences.reduce(
    (sum, exp) => sum + toCents(calculateExperienceLineTotal(exp)),
    0,
  )
  const subtotalCents = villaSubtotalCents + cleaningFeeCents + experiencesTotalCents

  // Taxes are 0 in French Polynesia (TVA non applicable) — keep the line for layout parity.
  const taxesCents = 0
  const totalCents = subtotalCents + taxesCents

  const depositCents = Math.round((totalCents * depositPercent) / 100)
  const balanceCents = totalCents - depositCents

  return {
    nights,
    nightlyRate,
    season,
    villaSubtotal: fromCents(villaSubtotalCents),
    cleaningFee: fromCents(cleaningFeeCents),
    experiencesTotal: fromCents(experiencesTotalCents),
    subtotal: fromCents(subtotalCents),
    taxes: fromCents(taxesCents),
    total: fromCents(totalCents),
    depositAmount: fromCents(depositCents),
    balanceAmount: fromCents(balanceCents),
    meetsMinNights: nights === 0 || nights >= minNights,
    minNights,
  }
}

/* ---------------------------------------------------------------------------
 * State validation
 * ------------------------------------------------------------------------- */

export interface BookingValidation {
  /** True only when the state is ready to move to D2's checkout. */
  isValid: boolean
  /** Why the state is not yet valid — empty when `isValid` is true. */
  issues: string[]
}

/**
 * Lightweight validation used to enable/disable the "Continue to checkout"
 * button. D2 will do a deeper validation against the client form.
 */
export function validateBookingState(
  state: BookingState,
  breakdown: PriceBreakdown,
): BookingValidation {
  const issues: string[] = []
  if (!state.checkIn) issues.push('Pick a check-in date.')
  if (!state.checkOut) issues.push('Pick a check-out date.')
  if (state.checkIn && state.checkOut && breakdown.nights <= 0) {
    issues.push('Check-out must be after check-in.')
  }
  if (!breakdown.meetsMinNights) {
    issues.push(`Minimum stay is ${breakdown.minNights} nights.`)
  }
  if (state.guests < 1) issues.push('Add at least one guest.')
  return { isValid: issues.length === 0, issues }
}
