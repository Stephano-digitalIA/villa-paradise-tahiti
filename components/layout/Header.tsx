'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Menu, Palmtree } from 'lucide-react'
import { Button } from '@/components/ui'
import { bookingHref, mainNav } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileDrawer } from './MobileDrawer'

/**
 * Header — Navigation principale sticky, transparente sur hero puis opaque au scroll.
 *
 * Comportement :
 *  - Position `fixed` top : reste visible pendant le scroll (cf. template fusion).
 *  - Variant transparent au repos (au-dessus du hero) → `bg-pearl/95 backdrop-blur`
 *    après ~60px de scroll vertical.
 *  - Logo texte "Villa Paradise" en Cormorant italic + icône palmier (Lucide).
 *  - Desktop ≥ md : nav inline + LanguageSwitcher + CTA primaire "Book Now".
 *  - Mobile < md : burger qui ouvre `MobileDrawer`.
 *
 * Note serveur/client : "use client" est nécessaire car le composant écoute
 * `scroll` et pilote l'état du drawer. Le scope reste minimal — pas de data
 * fetching ici. Composant rendu une seule fois dans `app/layout.tsx`.
 *
 * Hauteurs : ~80px desktop, ~64px mobile (cf. spec B2).
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)

  // Détection du scroll — bascule l'opacité du fond après 60px (alignement template fusion)
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 60)
    }

    // Initialise correctement si la page est rechargée mid-scroll
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Restaure le focus sur le burger après fermeture du drawer
  const handleDrawerClose = () => {
    setDrawerOpen(false)
    // Léger délai pour laisser le drawer se fermer avant le retour focus
    window.setTimeout(() => burgerRef.current?.focus(), 100)
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50',
          'transition-all duration-400 ease-luxe',
          scrolled
            ? 'bg-pearl/95 shadow-soft backdrop-blur-md'
            : 'bg-transparent'
        )}
      >
        <div
          className={cn(
            'mx-auto flex w-full max-w-7xl items-center justify-between',
            'px-4 sm:px-6 lg:px-8',
            // Hauteur : ~64px mobile, ~80px desktop (shrink légèrement au scroll)
            'transition-all duration-300 ease-luxe',
            scrolled ? 'h-16 lg:h-[72px]' : 'h-16 lg:h-20'
          )}
        >
          {/* Logo — texte display + icône palmier */}
          <Link
            href="/"
            aria-label="Villa Paradise Tahiti — Home"
            className={cn(
              'group inline-flex items-center gap-2 transition-colors duration-300',
              scrolled ? 'text-midnight' : 'text-pearl'
            )}
          >
            <Palmtree
              className={cn(
                'h-5 w-5 transition-colors duration-300',
                scrolled ? 'text-gold' : 'text-gold'
              )}
              aria-hidden="true"
            />
            <span className="font-display text-lg italic tracking-wider sm:text-xl">
              Villa Paradise
            </span>
          </Link>

          {/* Nav desktop — visible ≥ md */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex md:items-center md:gap-1 lg:gap-2"
          >
            <ul className="flex items-center gap-1 lg:gap-2">
              {mainNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'relative inline-flex items-center px-2 py-2 lg:px-3',
                      'font-sans text-[0.72rem] font-medium uppercase tracking-wider2',
                      'transition-colors duration-200',
                      scrolled
                        ? 'text-midnight-400 hover:text-gold'
                        : 'text-pearl/85 hover:text-gold',
                      // Underline animé doré au hover (cf. template fusion)
                      'after:absolute after:bottom-1 after:left-2 after:right-2 lg:after:left-3 lg:after:right-3',
                      'after:h-px after:origin-left after:scale-x-0 after:bg-gold',
                      'after:transition-transform after:duration-300 after:ease-luxe',
                      'hover:after:scale-x-100 focus-visible:after:scale-x-100',
                      'focus-visible:outline-none focus-visible:text-gold'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Cluster droit : LanguageSwitcher (desktop) + CTA Book Now + Burger (mobile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block">
              <LanguageSwitcher variant={scrolled ? 'default' : 'light'} />
            </div>

            {/* CTA Book Now — visible desktop, masqué mobile pour laisser place au burger */}
            <Button
              asChild
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link href={bookingHref}>Book Now</Link>
            </Button>

            {/* Burger mobile — visible < md */}
            <button
              ref={burgerRef}
              type="button"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              onClick={() => setDrawerOpen(true)}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden',
                'transition-colors duration-200',
                scrolled
                  ? 'text-midnight hover:bg-sand'
                  : 'text-pearl hover:bg-pearl/10',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                scrolled ? 'focus-visible:ring-offset-pearl' : 'focus-visible:ring-offset-midnight'
              )}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer mobile — rendu hors du header pour z-index propre */}
      <div id="mobile-drawer">
        <MobileDrawer open={drawerOpen} onClose={handleDrawerClose} />
      </div>
    </>
  )
}
