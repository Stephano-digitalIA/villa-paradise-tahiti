'use client'

import { Badge } from '@/components/ui'
import type { Season } from '@/lib/booking'

interface SeasonBadgeProps {
  season: Season | null
}

const LABELS: Record<Season, { label: string; variant: 'success' | 'luxe' | 'warning' }> = {
  low: { label: 'Low season', variant: 'success' },
  high: { label: 'High season', variant: 'luxe' },
  peak: { label: 'Peak holidays', variant: 'warning' },
}

/**
 * SeasonBadge — small indicator showing which seasonal tier the
 * user's check-in date falls into. Renders nothing when no date
 * has been picked yet.
 */
export function SeasonBadge({ season }: SeasonBadgeProps) {
  if (!season) return null
  const meta = LABELS[season]
  return (
    <Badge variant={meta.variant} size="sm">
      {meta.label}
    </Badge>
  )
}
