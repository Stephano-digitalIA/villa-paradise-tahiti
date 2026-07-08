'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { formatMoney, type Currency } from '@/lib/currency'

/** Cookie that persists the visitor's currency choice across reloads. */
export const CURRENCY_COOKIE = 'vpt_currency'

function readCurrencyCookie(): Currency | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)vpt_currency=(USD|EUR)/)
  return match ? (match[1] as Currency) : null
}

interface CurrencyContextValue {
  currency: Currency
  /** USD → EUR rate, server-authoritative (from settings). */
  rate: number
  setCurrency: (currency: Currency) => void
  /** Format a USD amount in the currently selected currency. */
  format: (valueUSD: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined)

/**
 * CurrencyProvider — holds the selected display currency for the public site.
 *
 * The `rate` is server-authoritative (the root layout reads
 * `settings.usd_to_eur_rate` and passes it in) so amounts are always converted
 * at the admin-managed rate. The visitor's currency CHOICE is read from the
 * `vpt_currency` cookie on the client after mount (server renders USD first),
 * then persisted back to the cookie on every toggle.
 *
 * The rate never comes from the client; toggling only changes which currency
 * a USD amount is displayed in.
 */
export function CurrencyProvider({
  rate,
  initialCurrency = 'USD',
  children,
}: {
  rate: number
  initialCurrency?: Currency
  children: ReactNode
}) {
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency)

  // Adopt the persisted choice after hydration (server always renders USD, so
  // this may re-render to EUR once for a returning EUR visitor).
  useEffect(() => {
    const saved = readCurrencyCookie()
    if (saved && saved !== currency) setCurrencyState(saved)
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next)
    // 1-year cookie, lax so normal navigation and payment redirects keep it.
    document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
  }, [])

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      rate,
      setCurrency,
      format: (valueUSD: number) => formatMoney(valueUSD, currency, rate),
    }),
    [currency, rate, setCurrency],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency must be used within a <CurrencyProvider>')
  }
  return ctx
}
