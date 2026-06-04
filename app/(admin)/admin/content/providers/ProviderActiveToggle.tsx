'use client'

import { useState } from 'react'
import { ToggleSwitch } from '@/components/admin/ToggleSwitch'
import { toggleProviderActive } from './actions'

type Props = { id: string; active: boolean }

export function ProviderActiveToggle({ id, active: initialActive }: Props) {
  const [active, setActive] = useState(initialActive)

  return (
    <ToggleSwitch
      checked={active}
      label="Actif"
      onToggle={async () => {
        await toggleProviderActive(id, !active)
        setActive((v) => !v)
      }}
    />
  )
}
