'use client'

import { useCurrency } from './CurrencyProvider'

/**
 * Price — renders a USD amount in the visitor's selected currency.
 *
 * This is the bridge for server components: a React Server Component can't read
 * the client currency context, but it CAN render this client leaf. Drop
 * `<Price valueUSD={x} />` wherever a price is shown and it converts reactively
 * when the header switcher toggles USD ↔ EUR.
 */
export function Price({
  valueUSD,
  className,
}: {
  valueUSD: number
  className?: string
}) {
  const { format } = useCurrency()
  return <span className={className}>{format(valueUSD)}</span>
}
