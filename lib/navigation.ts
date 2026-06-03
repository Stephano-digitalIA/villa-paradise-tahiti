/**
 * Navigation centralisée — Villa Paradise Tahiti.
 *
 * Source unique de vérité pour les liens de navigation, consommée par
 * le `Header`, le `Footer` et le `MobileDrawer`. Évite la duplication.
 *
 * Source d'arborescence : `docs/05-contenu-pages.md`.
 */

export interface NavLink {
  /** Libellé affiché à l'utilisateur. */
  label: string
  /** URL absolue ou route Next.js (préfixée par `/`). */
  href: string
}

/**
 * Navigation principale — visible dans le header desktop et le drawer mobile.
 * L'ordre suit le parcours type d'un visiteur : découvrir → comparer → réserver.
 */
export const mainNav: readonly NavLink[] = [
  { label: 'Villa', href: '/villa' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Rates', href: '/rates' },
  { label: 'Getting Here', href: '/getting-here' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
] as const

/**
 * Liens regroupés pour la colonne "Explore" du footer.
 */
export const exploreNav: readonly NavLink[] = [
  { label: 'The Villa', href: '/villa' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Rates & Booking', href: '/rates' },
] as const

/**
 * Liens regroupés pour la colonne "Information" du footer.
 */
export const informationNav: readonly NavLink[] = [
  { label: 'Getting Here', href: '/getting-here' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
] as const

/**
 * Liens légaux — colonne "Legal" du footer.
 */
export const legalNav: readonly NavLink[] = [
  { label: 'Privacy Policy', href: '/legal/privacy-policy' },
  { label: 'Terms', href: '/legal/terms' },
  { label: 'Cancellation', href: '/legal/cancellation' },
] as const

/**
 * Cible canonique du CTA principal "Book Now".
 */
export const bookingHref = '/booking'
