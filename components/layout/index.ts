/**
 * Barrel export — composants Layout global Villa Paradise Tahiti (Phase B2).
 *
 * Usage :
 *   import { Header, Footer, SkipToContent } from '@/components/layout'
 *
 * `MobileDrawer` est exporté mais consommé uniquement par `Header`.
 * `LanguageSwitcher` n'est plus rendu (site EN-only, traduction laissée au
 * navigateur) ; conservé pour une éventuelle i18n Phase 2.
 */

export { ChromeGate } from './ChromeGate'
export { Footer } from './Footer'
export { Header } from './Header'
export { LanguageSwitcher, type LanguageSwitcherProps } from './LanguageSwitcher'
export { MobileDrawer, type MobileDrawerProps } from './MobileDrawer'
export { SkipToContent, type SkipToContentProps } from './SkipToContent'
export { UserMenu } from './UserMenu'
