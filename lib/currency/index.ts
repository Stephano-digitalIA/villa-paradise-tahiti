/**
 * Currency layer — Villa Paradise Tahiti.
 *
 * The site prices everything in USD (the pricing engine in
 * `lib/booking/pricing.ts` is the single source of truth). This module adds an
 * optional EUR view for European guests, at an admin-managed exchange rate
 * (`settings.usd_to_eur_rate`, exposed as `usdToEurRate` by `adaptSettings`).
 *
 * Rules (mirror the pricing engine):
 *  - All arithmetic goes through integer cents.
 *  - Convert exactly once, at the boundary: `Math.round(usdCents * rate)`.
 *  - Never re-convert an amount that is already in the target currency.
 *
 * The exchange rate is ALWAYS server-authoritative (read from settings). The
 * client only ever chooses a `Currency`; it never supplies the rate.
 */

import { formatUSD, fromCents, toCents } from '@/lib/booking/pricing'

export type Currency = 'USD' | 'EUR'

/** Convert an integer USD-cents amount to integer EUR cents at `rate`. */
export function convertUsdCentsToEurCents(usdCents: number, rate: number): number {
  return Math.round(usdCents * rate)
}

/** Convert a USD amount (dollars) to an EUR amount (euros) at `rate`. */
export function convertUsdToEur(valueUSD: number, rate: number): number {
  return fromCents(convertUsdCentsToEurCents(toCents(valueUSD), rate))
}

/**
 * Format a USD amount in the requested display currency.
 *  - USD reuses the canonical `formatUSD` (en-US, `$`).
 *  - EUR converts at `rate` then formats fr-FR (`1 234,56 €`).
 * Whole amounts drop the decimals; fractional amounts show two.
 */
export function formatMoney(
  valueUSD: number,
  currency: Currency,
  rate: number,
): string {
  if (currency === 'USD') return formatUSD(valueUSD)

  const eur = convertUsdToEur(valueUSD, rate)
  const hasCents = Math.round(eur * 100) % 100 !== 0
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(eur)
}
