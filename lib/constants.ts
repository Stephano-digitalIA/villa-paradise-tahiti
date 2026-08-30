/**
 * Project-wide constants for Villa Paradise Tahiti.
 */

/**
 * Public contact address, shown to guests.
 *
 * Single source of truth on purpose: the site used to name three
 * different addresses depending on the page, which reads as carelessness
 * to a guest who notices, and guarantees that one of them goes stale.
 *
 * Note this is what guests SEE. What the site SENDS FROM is EMAIL_FROM,
 * and where operator notifications LAND is EMAIL_OWNER, both set in the
 * environment. The three serve different purposes and need not match.
 */
export const CONTACT_EMAIL = 'villa.paradise.tahiti@gmail.com'
