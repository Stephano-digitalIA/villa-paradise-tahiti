/**
 * Barrel export — composants Layout global Villa Paradise Tahiti (Phase B2).
 *
 * Usage :
 *   import { Header, Footer, SkipToContent } from '@/components/layout'
 *
 * `MobileDrawer` est exporté mais consommé uniquement par `Header`.
 * `LanguageSwitcher` est exporté mais consommé uniquement par `Header` à ce stade.
 */

export { ChromeGate } from './ChromeGate'
export { Footer } from './Footer'
export { Header } from './Header'
export { LanguageSwitcher, type LanguageSwitcherProps } from './LanguageSwitcher'
export { MobileDrawer, type MobileDrawerProps } from './MobileDrawer'
export { SkipToContent, type SkipToContentProps } from './SkipToContent'
export { UserMenu } from './UserMenu'
