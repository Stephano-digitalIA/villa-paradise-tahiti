'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Currency } from '@/lib/currency'
import { useCurrency } from './CurrencyProvider'

interface CurrencyOption {
  code: Currency
  label: string
  symbol: string
}

const OPTIONS: readonly CurrencyOption[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
] as const

export interface CurrencySwitcherProps {
  /** Colour variant — `light` for dark backgrounds. */
  variant?: 'default' | 'light'
  /** Full-width block layout for the mobile drawer. */
  block?: boolean
  className?: string
}

/**
 * CurrencySwitcher — lets a visitor view every public price in USD or EUR.
 *
 * Reads and updates the shared `CurrencyProvider`. The EUR amounts are
 * converted at the admin-managed rate; the choice is remembered via a cookie
 * (handled by the provider) so it survives navigation and reloads.
 */
export function CurrencySwitcher({
  variant = 'default',
  block = false,
  className,
}: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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

  const active = OPTIONS.find((o) => o.code === currency) ?? OPTIONS[0]!

  const triggerColors =
    variant === 'light' ? 'text-pearl hover:text-gold' : 'text-midnight hover:text-gold'

  function choose(code: Currency) {
    setCurrency(code)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={cn('relative', block && 'w-full', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change currency"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5',
          'font-sans text-xs font-medium uppercase tracking-luxe',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pearl',
          block && 'w-full justify-between',
          triggerColors,
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="text-sm leading-none">
            {active.symbol}
          </span>
          <span>{active.code}</span>
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Currency options"
          className={cn(
            'absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg',
            'border border-pearl-400 bg-pearl shadow-card',
            'animate-fade-in',
            block && 'left-0 w-full',
          )}
        >
          {OPTIONS.map((option) => {
            const isActive = option.code === currency
            return (
              <li key={option.code} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => choose(option.code)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-4 py-3 text-left',
                    'font-sans text-sm transition-colors duration-150',
                    'text-midnight hover:bg-sand',
                    isActive && 'bg-sand-100 font-semibold',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="w-4 text-center text-base leading-none">
                      {option.symbol}
                    </span>
                    <span>
                      {option.code} · {option.label}
                    </span>
                  </span>
                  {isActive ? <Check className="h-4 w-4 text-gold" aria-hidden="true" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
