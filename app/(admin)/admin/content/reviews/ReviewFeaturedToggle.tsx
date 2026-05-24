'use client'

import { useState } from 'react'
import { ToggleSwitch } from '@/components/admin/ToggleSwitch'
import { toggleReviewFeatured } from './actions'

type Props = { id: string; featured: boolean }

export function ReviewFeaturedToggle({ id, featured: initialFeatured }: Props) {
  const [featured, setFeatured] = useState(initialFeatured)

  return (
    <ToggleSwitch
      checked={featured}
      label="Featured"
      onToggle={async () => {
        await toggleReviewFeatured(id, !featured)
        setFeatured((v) => !v)
      }}
    />
  )
}
