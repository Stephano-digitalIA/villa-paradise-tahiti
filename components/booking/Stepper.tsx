'use client'

import { Minus, Plus } from 'lucide-react'

interface StepperProps {
  value: number
  min: number
  max: number
  onChange: (next: number) => void
  /** Group label for assistive tech, e.g. "Guest count". */
  label: string
  decreaseLabel?: string
  increaseLabel?: string
}

/**
 * The one -/+ control used across the booking flow, so the guest count and
 * every experience quantity look and behave the same.
 *
 * The digit is rendered as a single text node: React then rewrites it whole
 * on each change, which keeps it right even under browser translation.
 */
export function Stepper({
  value,
  min,
  max,
  onChange,
  label,
  decreaseLabel = 'Decrease',
  increaseLabel = 'Increase',
}: StepperProps) {
  const button =
    'flex h-9 w-9 items-center justify-center rounded-full border border-lagoon/30 text-midnight transition-all hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pearl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-lagoon/30 disabled:hover:text-midnight'

  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={decreaseLabel}
        className={button}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span
        className="w-7 text-center font-heading text-base font-semibold text-midnight"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={increaseLabel}
        className={button}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
