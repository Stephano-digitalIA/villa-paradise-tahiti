'use client'

import { AlertCircle } from 'lucide-react'

interface MinNightsAlertProps {
  minNights: number
  selectedNights: number
}

/**
 * MinNightsAlert — soft "sand" callout shown when the user's selection
 * is shorter than the configured minimum stay. Stays out of the
 * way when the user hasn't picked dates yet, and once the selection
 * meets the threshold.
 */
export function MinNightsAlert({ minNights, selectedNights }: MinNightsAlertProps) {
  if (selectedNights <= 0) return null
  if (selectedNights >= minNights) return null

  const missing = minNights - selectedNights
  const label = missing === 1 ? 'night' : 'nights'

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-body-sm text-midnight"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-coral" aria-hidden="true" />
      <p className="font-sans">
        Minimum stay is{' '}
        <strong className="font-semibold">{minNights} nights</strong>. Please add{' '}
        {missing} {label} to continue.
      </p>
    </div>
  )
}
