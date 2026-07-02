import { Badge } from '@/components/ui/Badge'

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge — coloured badge for common admin status values
// ─────────────────────────────────────────────────────────────────────────────

type StatusBadgeProps = {
  status: string | boolean
  trueLabel?: string
  falseLabel?: string
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_MAP: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'info' | 'default' | 'luxe' | 'gold' }
> = {
  // payment statuses
  pending: { label: 'En attente', variant: 'warning' },
  deposit_paid: { label: 'Acompte payé', variant: 'info' },
  fully_paid: { label: 'Payé intégralement', variant: 'success' },
  cancelled: { label: 'Annulé', variant: 'default' },
  refunded: { label: 'Remboursé', variant: 'luxe' },
  // publish statuses
  published: { label: 'Published', variant: 'success' },
  draft: { label: 'Draft', variant: 'warning' },
  // active statuses
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'default' },
  // featured
  featured: { label: 'Featured', variant: 'gold' },
  // verified
  verified: { label: 'Verified', variant: 'info' },
  // review sources
  direct: { label: 'Direct', variant: 'default' },
  airbnb: { label: 'Airbnb', variant: 'warning' },
  vrbo: { label: 'VRBO', variant: 'info' },
  google: { label: 'Google', variant: 'info' },
  tripadvisor: { label: 'Tripadvisor', variant: 'success' },
}

export function StatusBadge({ status, trueLabel = 'Active', falseLabel = 'Inactive', size = 'sm' }: StatusBadgeProps) {
  if (typeof status === 'boolean') {
    return (
      <Badge variant={status ? 'success' : 'default'} size={size}>
        {status ? trueLabel : falseLabel}
      </Badge>
    )
  }

  const mapping = STATUS_MAP[status.toLowerCase()]
  if (mapping) {
    return (
      <Badge variant={mapping.variant} size={size}>
        {mapping.label}
      </Badge>
    )
  }

  return (
    <Badge size={size}>
      {status}
    </Badge>
  )
}
