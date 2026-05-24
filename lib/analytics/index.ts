/**
 * Barrel — Phase F2.
 *
 * Public entrypoint for the analytics helpers. Importing from
 * `@/lib/analytics` re-exports the typed event surface AND makes sure
 * the ambient `window.gtag` typings get included anywhere the helper is
 * consumed.
 */

export { analytics } from './events'
export type { AnalyticsAPI, PaymentMethod } from './events'
export type { GtagCommand, GtagEventParams } from './types'
// Side-effect import — registers the global `window.gtag` declaration.
import './types'
