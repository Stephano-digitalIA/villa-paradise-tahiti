/**
 * localStorage persistence for the booking state.
 *
 *  - All accesses are wrapped in `try/catch` so SSR (no `window`), Safari
 *    private mode (throws on quota), or disabled storage (incognito policy)
 *    never crash the page.
 *  - A versioned envelope (`BookingStorageEnvelope`) lets us evolve the
 *    schema later by bumping `version` and discarding old payloads on read.
 *  - Carts older than `CART_TTL_DAYS` are treated as expired and discarded
 *    transparently — no user-facing migration UI required.
 */

import type { BookingState, BookingStorageEnvelope } from './types'
import { CART_TTL_DAYS } from './pricing'

/** localStorage key — kept exported so D2 can clean up on success/cancel. */
export const STORAGE_KEY = 'vpt:booking-state:v1'

const TTL_MS = CART_TTL_DAYS * 24 * 60 * 60 * 1000

function hasWindow(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

/**
 * Persist the booking state. Failures are swallowed silently — the live
 * in-memory state is the source of truth; storage is a convenience.
 */
export function saveBookingState(state: BookingState): void {
  if (!hasWindow()) return
  try {
    const envelope: BookingStorageEnvelope = {
      version: 1,
      savedAt: Date.now(),
      state,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    // ignore — quota exceeded, disabled storage, etc.
  }
}

/**
 * Load a previously saved booking state. Returns `null` if:
 *   - we're on the server (no `window`),
 *   - nothing was saved,
 *   - the payload is malformed,
 *   - the schema version doesn't match,
 *   - the payload is older than `CART_TTL_DAYS`.
 */
export function loadBookingState(): BookingState | null {
  if (!hasWindow()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<BookingStorageEnvelope>
    if (!parsed || parsed.version !== 1) return null
    if (typeof parsed.savedAt !== 'number') return null
    if (Date.now() - parsed.savedAt > TTL_MS) return null
    const state = parsed.state
    if (!state || typeof state !== 'object') return null
    // Defensive normalisation — never trust persisted data.
    return {
      checkIn: typeof state.checkIn === 'string' ? state.checkIn : null,
      checkOut: typeof state.checkOut === 'string' ? state.checkOut : null,
      guests: typeof state.guests === 'number' && state.guests >= 1 ? state.guests : 2,
      selectedExperiences: Array.isArray(state.selectedExperiences)
        ? state.selectedExperiences.filter(
            (e) =>
              e &&
              typeof e.slug === 'string' &&
              typeof e.title === 'string' &&
              typeof e.priceUSD === 'number' &&
              typeof e.quantity === 'number' &&
              (e.priceUnit === 'per_person' ||
                e.priceUnit === 'flat' ||
                e.priceUnit === 'per_group'),
          )
        : [],
      specialRequests:
        typeof state.specialRequests === 'string' ? state.specialRequests : undefined,
    }
  } catch {
    return null
  }
}

/** Wipe the persisted booking state. Useful for D2 after successful checkout. */
export function clearBookingState(): void {
  if (!hasWindow()) return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
