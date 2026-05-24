/**
 * Reservation helpers — Villa Paradise Tahiti (Phase E2).
 *
 * Shared logic used by the payment route(s) and the webhook handlers:
 *
 *  - `generateReservationId()` — short, all-caps, human-readable reference
 *    surfaced in confirmation emails, ticket support, and the success page.
 *  - `buildLineItems(state, breakdown, catalog)` — turns the booking state
 *    into a flat list of `{ name, description, amountUSD, quantity }` lines.
 *    Stripe's `line_items` and PayPal's `purchase_units` consume it after a
 *    small adapter layer.
 *  - `buildBookingMetadata(state, customer)` — flattens the booking into a
 *    string-only key/value map suitable for Stripe metadata
 *    (max 50 keys, max 500 chars per value). The webhook handler reads
 *    this back to reconstruct the `BookingConfirmationData` shape that
 *    Phase E1's email helpers expect.
 *
 * Design notes:
 *  - **Strings only** for metadata: Stripe rejects nested objects and
 *    coerces numbers / booleans inconsistently. We stringify aggressively
 *    here so the webhook can round-trip with `Number(...)` / `JSON.parse`.
 *  - **Truncation guard**: the per-value 500-char limit matters mostly for
 *    the `experiences` JSON. We trim experience titles to keep the payload
 *    safe even with a long cart.
 *  - **Catalog-aware titles**: when an experience selection only carries a
 *    slug + title (no full Sanity record), we still try to enrich from
 *    the supplied `experienceCatalog` so the line item shown on the Stripe
 *    Checkout page matches what the user saw in the calculator.
 */

import type { BookingState, PriceBreakdown, SelectedExperience } from './types'
import type { CheckoutFormData } from './checkout-schema'
import { calculateExperienceLineTotal } from './pricing'

/* ---------------------------------------------------------------------------
 * Reservation reference
 * ------------------------------------------------------------------------- */

/**
 * Generate a short, all-caps, easy-to-read reservation reference such as
 * `VPT-LRC9X4P-K3D5W`. Not a UUID — it's intended to be shown in emails,
 * spelled over the phone, and pasted in support tickets without confusion.
 *
 * Format: `VPT-{base36 timestamp}-{5-char base36 random}` (uppercase).
 */
export function generateReservationId(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase().padEnd(5, 'X')
  return `VPT-${ts}-${rand}`
}

/* ---------------------------------------------------------------------------
 * Line items
 * ------------------------------------------------------------------------- */

/**
 * A normalized line item, payment-processor-agnostic.
 *
 *  - `amountUSD` is in **whole USD** (e.g. `690` for $690.00). Stripe wants
 *    cents (multiply by 100), PayPal wants `.toFixed(2)` strings. Both
 *    conversions live in the respective adapters in `lib/stripe` / `lib/paypal`.
 *  - `quantity` already accounts for `priceUnit` semantics — callers
 *    multiply directly (`amountUSD × quantity`).
 */
export interface ReservationLineItem {
  name: string
  description?: string
  amountUSD: number
  quantity: number
}

/**
 * Minimal shape of an experience entry that `buildLineItems` can enrich a
 * selection with. We accept whatever the caller has — full Sanity Experience
 * or just `{ slug, title }` — keeping the function easy to unit-test.
 */
export interface ExperienceCatalogEntry {
  slug?: { current?: string } | string
  title?: string
  shortDescription?: string
}

/**
 * Resolve the slug string out of a catalog entry, regardless of whether the
 * caller supplied a Sanity slug object or a plain string.
 */
function resolveSlug(entry: ExperienceCatalogEntry): string | undefined {
  if (typeof entry.slug === 'string') return entry.slug
  return entry.slug?.current
}

/**
 * Find a catalog entry matching a selected experience by slug.
 */
function findCatalogEntry(
  catalog: ExperienceCatalogEntry[],
  slug: string,
): ExperienceCatalogEntry | undefined {
  return catalog.find((entry) => resolveSlug(entry) === slug)
}

/**
 * Build a flat list of normalized line items from the booking state.
 *
 * Composition (in order):
 *  1. Villa nightly fee — `nights` × `nightlyRate`. Single line with the
 *     nightly rate as the unit price; Stripe / PayPal then show
 *     `quantity × unit` on the receipt automatically.
 *  2. Cleaning fee — flat single line, when `nights > 0`.
 *  3. One line per selected experience, with quantity-aware unit price.
 *
 * Lines are skipped when their amount is zero so the receipt stays clean.
 */
export function buildLineItems(
  state: BookingState,
  breakdown: PriceBreakdown,
  experienceCatalog: ExperienceCatalogEntry[] = [],
): ReservationLineItem[] {
  const lines: ReservationLineItem[] = []

  // 1. Villa nights
  if (breakdown.nights > 0 && breakdown.nightlyRate > 0) {
    lines.push({
      name: 'Villa Paradise Tahiti — Nightly stay',
      description: `${breakdown.nights} night${breakdown.nights > 1 ? 's' : ''} at $${breakdown.nightlyRate.toFixed(0)} / night`,
      amountUSD: breakdown.nightlyRate,
      quantity: breakdown.nights,
    })
  }

  // 2. Cleaning fee (only when there's an actual stay)
  if (breakdown.cleaningFee > 0 && breakdown.nights > 0) {
    lines.push({
      name: 'Cleaning fee',
      description: 'One-time housekeeping & turnover',
      amountUSD: breakdown.cleaningFee,
      quantity: 1,
    })
  }

  // 3. Experiences — one line each, quantity-aware
  for (const exp of state.selectedExperiences) {
    const lineTotal = calculateExperienceLineTotal(exp)
    if (lineTotal <= 0) continue

    const catalog = findCatalogEntry(experienceCatalog, exp.slug)
    const title = exp.title || catalog?.title || exp.slug
    const description = catalog?.shortDescription

    // For `flat` priced experiences, the "unit price" is the full line total;
    // quantity stays at 1 so receipts read naturally.
    const quantity = exp.priceUnit === 'flat' ? 1 : Math.max(1, Math.floor(exp.quantity))
    const unitPrice = exp.priceUnit === 'flat' ? exp.priceUSD : exp.priceUSD

    lines.push({
      name: `Experience — ${title}`,
      description,
      amountUSD: unitPrice,
      quantity,
    })
  }

  return lines
}

/* ---------------------------------------------------------------------------
 * Booking metadata (string-only, Stripe-compatible)
 * ------------------------------------------------------------------------- */

/**
 * Cap a metadata value to Stripe's 500-char per-value limit, with a visible
 * truncation marker to aid debugging if it ever hits.
 */
function clampValue(value: string, max = 500): string {
  if (value.length <= max) return value
  return `${value.slice(0, max - 3)}...`
}

/**
 * Flatten the booking state + customer into a Stripe-compatible metadata
 * object. Every value is a string — Stripe enforces this.
 *
 * Keys (deliberately short to stay within Stripe's 50-key / 500-char-each
 * constraints, even with a long cart):
 *
 *   firstName, lastName, email, phone, country, city
 *   checkIn, checkOut, guests, nights
 *   villaSubtotal, experiencesTotal, cleaningFee, total
 *   depositAmount, balanceAmount
 *   experiences          → JSON `[ { title, quantity }, ... ]`
 *   specialRequests      → trimmed (optional)
 *   arrivalFlight, departureFlight (optional)
 *
 * Note: `reservationId` is **not** added here — the API route does that as
 * a separate, deliberate step so the function stays referentially-pure.
 */
export function buildBookingMetadata(
  state: BookingState,
  customer: CheckoutFormData,
  breakdown?: PriceBreakdown,
): Record<string, string> {
  const meta: Record<string, string> = {
    firstName: clampValue(customer.firstName ?? ''),
    lastName: clampValue(customer.lastName ?? ''),
    email: clampValue(customer.email ?? ''),
    phone: clampValue(customer.phone ?? ''),
    country: clampValue(customer.country ?? ''),
    city: clampValue(customer.city ?? ''),
    checkIn: clampValue(state.checkIn ?? ''),
    checkOut: clampValue(state.checkOut ?? ''),
    guests: String(state.guests ?? 0),
  }

  if (customer.zipCode) meta.zipCode = clampValue(customer.zipCode)
  if (customer.arrivalFlight) meta.arrivalFlight = clampValue(customer.arrivalFlight)
  if (customer.departureFlight) meta.departureFlight = clampValue(customer.departureFlight)
  if (state.specialRequests || customer.specialRequests) {
    meta.specialRequests = clampValue(
      (state.specialRequests || customer.specialRequests || '').trim(),
    )
  }

  if (breakdown) {
    meta.nights = String(breakdown.nights)
    meta.villaSubtotal = String(breakdown.villaSubtotal)
    meta.experiencesTotal = String(breakdown.experiencesTotal)
    meta.cleaningFee = String(breakdown.cleaningFee)
    meta.total = String(breakdown.total)
    meta.depositAmount = String(breakdown.depositAmount)
    meta.balanceAmount = String(breakdown.balanceAmount)
  }

  // Experiences as compact JSON. The webhook handler will JSON.parse this
  // back into the `selectedExperiences` shape Phase E1 expects.
  if (state.selectedExperiences.length > 0) {
    const compact = state.selectedExperiences.map((exp: SelectedExperience) => ({
      title: clampValue(exp.title ?? exp.slug ?? '', 80),
      quantity: exp.quantity,
    }))
    meta.experiences = clampValue(JSON.stringify(compact))
  }

  return meta
}

/* ---------------------------------------------------------------------------
 * Email payload reconstruction (webhook side)
 * ------------------------------------------------------------------------- */

/**
 * Parse the compact JSON we stuffed under `metadata.experiences` back into
 * `{ title, quantity }[]`. Returns `[]` on any failure so the webhook never
 * crashes on a malformed payload.
 */
export function parseExperiencesMetadata(
  raw: string | undefined,
): Array<{ title: string; quantity: number }> {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item): item is { title: string; quantity: number } =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as { title?: unknown }).title === 'string' &&
          typeof (item as { quantity?: unknown }).quantity === 'number',
      )
      .map((item) => ({ title: item.title, quantity: item.quantity }))
  } catch {
    return []
  }
}
