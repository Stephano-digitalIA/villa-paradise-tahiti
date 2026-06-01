'use client'

import { useState } from 'react'

import { ToggleSwitch } from '@/components/admin/ToggleSwitch'

import { toggleExperienceField } from './actions'

interface ExperienceToggleProps {
  id: string
  field: 'active' | 'featured'
  value: boolean
}

/**
 * Single inline toggle for one experience boolean field.
 *
 * Use one instance per column so the table layout stays in sync with
 * the header (Active / Featured). Local optimistic state flips on click
 * and is then persisted server-side via the toggleExperienceField action.
 */
export function ExperienceToggle({
  id,
  field,
  value: initialValue,
}: ExperienceToggleProps) {
  const [value, setValue] = useState(initialValue)

  return (
    <ToggleSwitch
      checked={value}
      label={field === 'active' ? 'Active' : 'Featured'}
      onToggle={async () => {
        const next = !value
        // Optimistic flip — revert if the server action throws.
        setValue(next)
        try {
          await toggleExperienceField(id, field, next)
        } catch {
          setValue((v) => !v)
        }
      }}
    />
  )
}
