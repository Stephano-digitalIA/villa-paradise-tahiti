import { cn } from '@/lib/utils'

export interface SkipToContentProps {
  /** Cible du lien (id de l'élément principal). Défaut : `#main-content`. */
  href?: string
  /** Libellé du lien (i18n future). Défaut : "Skip to content". */
  label?: string
  className?: string
}

/**
 * SkipToContent — Lien d'évitement WCAG 2.4.1.
 *
 * Reste hors écran tant qu'il n'a pas le focus clavier. Lorsqu'un utilisateur
 * navigue au clavier (Tab depuis le tout début de la page), le lien apparaît
 * en haut à gauche avec un fort contraste pour permettre de sauter directement
 * au contenu principal sans passer par toute la navigation.
 *
 * À placer en tout premier dans `<body>`, avant le Header.
 */
export function SkipToContent({
  href = '#main-content',
  label = 'Skip to content',
  className,
}: SkipToContentProps) {
  return (
    <a
      href={href}
      className={cn(
        // Caché par défaut hors flux visuel mais accessible aux lecteurs d'écran
        'sr-only',
        // Visible au focus clavier : positionné en haut-gauche, fond gold contrasté
        'focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]',
        'focus:rounded-lg focus:bg-gold focus:px-5 focus:py-3',
        'focus:font-sans focus:text-sm focus:font-bold focus:uppercase focus:tracking-luxe focus:text-midnight',
        'focus:shadow-elevated focus:outline-none focus:ring-2 focus:ring-midnight focus:ring-offset-2',
        className
      )}
    >
      {label}
    </a>
  )
}
