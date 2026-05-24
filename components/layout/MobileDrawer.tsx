'use client'

import { useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui'
import { bookingHref, mainNav } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export interface MobileDrawerProps {
  /** État ouvert/fermé contrôlé par le parent (Header). */
  open: boolean
  /** Callback de fermeture (clic backdrop, X, lien, Échap). */
  onClose: () => void
}

/**
 * MobileDrawer — Menu plein écran pour les tailles < md.
 *
 * Caractéristiques :
 *  - Slide-in depuis la droite avec backdrop semi-transparent.
 *  - Animations CSS pures (`transition-transform` / `transition-opacity`).
 *  - Body scroll-lock pendant l'ouverture (préserve le scrollY).
 *  - Focus trap : Tab et Shift+Tab restent dans le drawer.
 *  - Fermeture : clic backdrop, bouton X, touche Échap, clic sur un lien.
 *  - Le focus revient sur l'élément déclencheur après fermeture (géré côté Header).
 */
export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // 1. Body scroll-lock — préserve la position de scroll pour éviter le "jump"
  useEffect(() => {
    if (!open) return

    const scrollY = window.scrollY
    const originalOverflow = document.body.style.overflow
    const originalPosition = document.body.style.position
    const originalTop = document.body.style.top
    const originalWidth = document.body.style.width

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.position = originalPosition
      document.body.style.top = originalTop
      document.body.style.width = originalWidth
      window.scrollTo(0, scrollY)
    }
  }, [open])

  // 2. Échap pour fermer + focus initial sur le bouton X
  useEffect(() => {
    if (!open) return

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKey)
    // Focus initial : le bouton de fermeture, naturel pour reprendre la nav clavier
    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 50)

    return () => {
      document.removeEventListener('keydown', handleKey)
      window.clearTimeout(focusTimer)
    }
  }, [open, onClose])

  // 3. Focus trap minimaliste — restreint Tab au contenu du drawer
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !panelRef.current) return

    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusables.length === 0) return

    const first = focusables[0]!
    const last = focusables[focusables.length - 1]!
    const active = document.activeElement

    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }, [])

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-[90] md:hidden',
        // Quand fermé : aucun pointer-events pour ne pas bloquer la page
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      {/* Backdrop semi-transparent — clic pour fermer */}
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-midnight/60 backdrop-blur-sm',
          'transition-opacity duration-300 ease-luxe',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Panneau drawer — slide-in depuis la droite */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        onKeyDown={handleKeyDown}
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-sm flex-col',
          'bg-pearl shadow-elevated',
          'transition-transform duration-300 ease-luxe',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* En-tête du drawer : logo + bouton fermer */}
        <div className="flex items-center justify-between border-b border-pearl-400 px-6 py-5">
          <Link
            href="/"
            onClick={onClose}
            className="font-display text-xl italic tracking-wider text-midnight"
          >
            Villa Paradise
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full',
              'text-midnight transition-colors duration-200 hover:bg-sand',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2'
            )}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Liens nav verticaux — grande typographie display */}
        <nav
          aria-label="Mobile navigation"
          className="flex-1 overflow-y-auto px-6 py-8"
        >
          <ul className="flex flex-col gap-1">
            {mainNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    'block py-3 font-display text-3xl italic text-midnight transition-colors duration-200',
                    'hover:text-gold focus-visible:text-gold',
                    'focus-visible:outline-none'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA bas — Book Now full-width */}
        <div className="border-t border-pearl-400 px-6 py-6">
          <Button asChild variant="primary" size="lg" className="w-full">
            <Link href={bookingHref} onClick={onClose}>
              Book Now
            </Link>
          </Button>
          <p className="mt-4 text-center text-eyebrow text-midnight-400">
            Tahiti · French Polynesia
          </p>
        </div>
      </div>
    </div>
  )
}
