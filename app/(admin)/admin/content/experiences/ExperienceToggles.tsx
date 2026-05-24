'use client'

import { useState } from 'react'
import { ToggleSwitch } from '@/components/admin/ToggleSwitch'
import { toggleExperienceField } from './actions'

type Props = { id: string; active: boolean; featured: boolean }

export function ExperienceToggles({ id, active: initialActive, featured: initialFeatured }: Props) {
  const [active, setActive] = useState(initialActive)
  const [featured, setFeatured] = useState(initialFeatured)

  return (
    <div className="flex items-center gap-3">
      <ToggleSwitch
        checked={active}
        label="Active"
        onToggle={async () => {
          await toggleExperienceField(id, 'active', !active)
          setActive((v) => !v)
        }}
      />
      <ToggleSwitch
        checked={featured}
        label="Featured"
        onToggle={async () => {
          await toggleExperienceField(id, 'featured', !featured)
          setFeatured((v) => !v)
        }}
      />
    </div>
  )
}
