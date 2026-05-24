/**
 * Shared analytics types — Phase F2.
 *
 * Single source of truth for the `window.gtag` ambient declaration so
 * components and helpers can call it with proper typing without clashing
 * declarations across files.
 */

export type GtagCommand = 'config' | 'event' | 'js' | 'set' | 'consent'

export type GtagEventParams = Record<
  string,
  string | number | boolean | undefined
>

declare global {
  interface Window {
    /**
     * Google Analytics 4 global function (gtag.js). Injected once the
     * `<GoogleAnalytics />` script has loaded and the init snippet ran.
     */
    gtag?: (command: GtagCommand, ...args: unknown[]) => void
    /**
     * Backing array gtag uses before the real script boots — also used by
     * GTM-style integrations.
     */
    dataLayer?: unknown[]
    /**
     * Hotjar global queue. Optional — only present after the Hotjar
     * snippet has executed.
     */
    hj?: ((...args: unknown[]) => void) & {
      q?: unknown[]
    }
    _hjSettings?: {
      hjid: number
      hjsv: number
    }
  }
}

export {}
