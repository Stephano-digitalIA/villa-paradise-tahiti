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
