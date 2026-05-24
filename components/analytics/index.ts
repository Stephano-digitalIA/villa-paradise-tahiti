/**
 * Barrel — Phase F2 analytics components.
 *
 * The only consumer of these components should be `app/layout.tsx` via
 * `<ConsentGate />`. The individual trackers are exported for testing
 * and for ad-hoc usage (e.g. server-rendered preview pages that bypass
 * the gate).
 */

export { ConsentGate } from './ConsentGate'
export { CookieConsent } from './CookieConsent'
export type { ConsentChoice, CookieConsentProps } from './CookieConsent'
export { GoogleAnalytics } from './GoogleAnalytics'
export { Hotjar } from './Hotjar'
