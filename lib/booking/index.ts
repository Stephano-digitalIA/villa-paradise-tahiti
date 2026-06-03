/**
 * Booking domain — barrel.
 *
 * Always import from `@/lib/booking`, never from the submodules directly,
 * so we can refactor the internal organisation without touching consumers.
 */

export type {
  BookingState,
  BookingStorageEnvelope,
  PriceBreakdown,
  Season,
  SelectedExperience,
} from './types'

export {
  CART_TTL_DAYS,
  SEASONAL_RATES,
  addDaysISO,
  calculateExperienceLineTotal,
  calculateNights,
  computeBreakdown,
  formatUSD,
  fromCents,
  getNightlyRate,
  getSeason,
  toCents,
  todayISO,
  toPricingSettings,
  validateBookingState,
  type BookingValidation,
  type PricingSettings,
} from './pricing'

export {
  STORAGE_KEY,
  clearBookingState,
  loadBookingState,
  saveBookingState,
} from './storage'

export {
  generateReservationId,
  buildLineItems,
  buildBookingMetadata,
  parseExperiencesMetadata,
  type ReservationLineItem,
  type ExperienceCatalogEntry,
} from './reservation'

// Client-safe only (pure overlap + type).
//
// IMPORTANT: do NOT re-export from './availability' here — that module
// imports the Supabase admin client and its server-only env vars. Even a
// `export { ... } from './availability'` statement makes webpack pull
// the module into any bundle that imports from this barrel, throwing
// `supabaseKey is required` on the client.
//
// Server-side callers import directly from `@/lib/booking/availability`.
export {
  rangeOverlapsAny,
  type PublicBlockedRange,
} from './availability-client'
