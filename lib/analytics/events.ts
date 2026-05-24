/**
 * Typed event helpers — Phase F2.
 *
 * Wraps `window.gtag('event', ...)` with strongly-typed business actions so
 * downstream components never call gtag directly. Every helper is a no-op
 * when GA isn't loaded (mock mode, consent declined, or SSR) so it's safe
 * to call from any component without guarding.
 *
 * Event naming follows GA4 recommended event conventions
 * (https://support.google.com/analytics/answer/9267735) wherever possible —
 * `begin_checkout`, `add_to_cart`, `purchase`, `view_item`, etc. — so the
 * GA4 UI surfaces them in standard reports without custom definitions.
 */

import type { GtagEventParams } from './types'

/**
 * Low-level dispatcher. Safe to call before gtag is ready: silently bails
 * out if `window.gtag` is missing (SSR, mock mode, consent declined).
 */
function track(eventName: string, params?: GtagEventParams) {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params ?? {})
}

export type PaymentMethod = 'stripe' | 'paypal'

/**
 * Business-level analytics surface. Add new helpers here as new flows
 * appear — do NOT call `window.gtag` directly from feature components.
 */
export const analytics = {
  /** Visitor opened the booking flow (Phase D entry). */
  bookingStarted: () => track('begin_checkout'),

  /** Experience added to the cart in D2. */
  addExperience: (slug: string, priceUSD: number) =>
    track('add_to_cart', {
      item_id: slug,
      value: priceUSD,
      currency: 'USD',
    }),

  /** Experience removed from the cart in D2. */
  removeExperience: (slug: string) =>
    track('remove_from_cart', { item_id: slug }),

  /** User submitted payment (begin_checkout with payment_method context). */
  checkoutInitiated: (totalUSD: number, paymentMethod: PaymentMethod) =>
    track('begin_checkout', {
      value: totalUSD,
      currency: 'USD',
      payment_method: paymentMethod,
    }),

  /** Payment confirmed — deposit captured. Use the deposit as the GA `value`. */
  bookingCompleted: (reservationId: string, _totalUSD: number, depositUSD: number) =>
    track('purchase', {
      transaction_id: reservationId,
      value: depositUSD,
      currency: 'USD',
      tax: 0,
      shipping: 0,
    }),

  /** Contact form submitted from the marketing pages. */
  contactFormSubmitted: () => track('generate_lead', { lead_type: 'contact_form' }),

  /** Experience detail viewed (gallery card click or detail page). */
  experienceViewed: (slug: string) =>
    track('view_item', { item_id: slug, item_category: 'experience' }),

  /** Hero / gallery video play. */
  videoPlayed: (label: string) => track('video_start', { video_title: label }),

  /** Gallery / lightbox opened. */
  galleryOpened: () => track('view_item_list', { item_list_name: 'gallery' }),
}

export type AnalyticsAPI = typeof analytics
