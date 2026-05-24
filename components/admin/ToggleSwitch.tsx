'use client'

import { useTransition } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// ToggleSwitch — on/off switch that fires a Server Action onClick
// ─────────────────────────────────────────────────────────────────────────────

type ToggleSwitchProps = {
  checked: boolean
  onToggle: () => Promise<void>
  label?: string
  disabled?: boolean
}

export function ToggleSwitch({ checked, onToggle, label, disabled }: ToggleSwitchProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await onToggle()
    })
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || isPending}
      onClick={handleClick}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-gold' : 'bg-midnight-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
