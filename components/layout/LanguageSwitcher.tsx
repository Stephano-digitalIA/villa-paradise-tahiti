'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Locale = 'en' | 'fr'

interface LocaleOption {
  code: Locale
  label: string
  flag: string
  /** Si `true`, l'option est sélectionnable. `false` = "Coming soon". */
  available: boolean
}

const locales: readonly LocaleOption[] = [
  { code: 'en', label: 'English (US)', flag: '🇺🇸', available: true },
  { code: 'fr', label: 'Français', flag: '🇫🇷', available: false },
] as const

export interface LanguageSwitcherProps {
  /** Variante de couleur — `light` pour fond sombre (hero transparent). */
  variant?: 'default' | 'light'
  className?: string
}

/**
 * LanguageSwitcher — Sélecteur de langue (UI placeholder pour Phase 2 i18n).
 *
 * Affiche le drapeau + code de la locale active, et ouvre un dropdown au clic.
 * La locale "Français" est marquée "Coming soon" et non sélectionnable.
 *
 * TODO Phase 2 : brancher sur `next-intl` ou `react-i18next` pour effectuer
 * le vrai switch de langue + persister la préférence (cookie).
 */
export function LanguageSwitcher({ variant = 'default', className }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [active] = useState<Locale>('en')
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Fermeture : clic hors zone + touche Échap
  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const activeLocale = locales.find((l) => l.code === active) ?? locales[0]!

  const triggerColors =
    variant === 'light'
      ? 'text-pearl hover:text-gold'
      : 'text-midnight hover:text-gold'

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5',
          'font-sans text-xs font-medium uppercase tracking-luxe',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pearl',
          triggerColors
        )}
      >
        <span aria-hidden="true" className="text-sm leading-none">
          {activeLocale.flag}
        </span>
        <span>{activeLocale.code.toUpperCase()}</span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language options"
          className={cn(
            'absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg',
            'border border-pearl-400 bg-pearl shadow-card',
            'animate-fade-in'
          )}
        >
          {locales.map((locale) => {
            const isActive = locale.code === active
            return (
              <li key={locale.code} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  disabled={!locale.available}
                  onClick={() => {
                    if (locale.available) {
                      // TODO Phase 2 : déclencher le switch i18n
                      setOpen(false)
                    }
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-4 py-3 text-left',
                    'font-sans text-sm transition-colors duration-150',
                    locale.available
                      ? 'text-midnight hover:bg-sand'
                      : 'cursor-not-allowed text-midnight-300',
                    isActive && 'bg-sand-100 font-semibold'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-base leading-none">
                      {locale.flag}
                    </span>
                    <span>{locale.label}</span>
                  </span>
                  {isActive ? (
                    <Check className="h-4 w-4 text-gold" aria-hidden="true" />
                  ) : !locale.available ? (
                    <span className="text-eyebrow text-midnight-300">Soon</span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
