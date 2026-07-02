import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'
import type { PaymentStatus, Reservation } from '@/lib/supabase/types'

interface ClientStaysTabProps {
  reservations: Reservation[]
}

const STATUS_VARIANT: Record<
  PaymentStatus,
  'default' | 'warning' | 'info' | 'success' | 'luxe'
> = {
  pending: 'warning',
  deposit_paid: 'info',
  fully_paid: 'success',
  cancelled: 'default',
  refunded: 'luxe',
}

const STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'En attente',
  deposit_paid: 'Acompte payé',
  fully_paid: 'Payé intégralement',
  cancelled: 'Annulé',
  refunded: 'Remboursé',
}

export function ClientStaysTab({ reservations }: ClientStaysTabProps) {
  if (reservations.length === 0) {
    return (
      <EmptyState
        title="No stays yet"
        subtitle="When this client books — directly or via an external channel — their reservations will appear here."
      />
    )
  }

  const upcoming = reservations.filter((r) => r.check_in >= today())
  const past = reservations.filter((r) => r.check_in < today())

  return (
    <div className="flex flex-col gap-6">
      {upcoming.length > 0 ? (
        <Section title="Upcoming" count={upcoming.length}>
          <StaysTable rows={upcoming} />
        </Section>
      ) : null}

      {past.length > 0 ? (
        <Section title="Past" count={past.length}>
          <StaysTable rows={past} />
        </Section>
      ) : null}
    </div>
  )
}

function StaysTable({ rows }: { rows: Reservation[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-pearl-400 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-pearl-400 bg-pearl-300/40">
              {['Réf', 'Dates', 'Nuits', 'Voyageurs', 'Total', 'Statut', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={r.id}
                className={
                  'transition-colors hover:bg-pearl-300/20 ' +
                  (idx < rows.length - 1 ? 'border-b border-pearl-400' : '')
                }
              >
                <td className="px-4 py-3.5">
                  <span className="font-mono text-sm font-medium text-midnight">
                    {r.reservation_ref}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-sans text-sm text-midnight">
                  {formatDate(r.check_in)} → {formatDate(r.check_out)}
                </td>
                <td className="px-4 py-3.5 font-sans text-sm text-midnight">
                  {nightsBetween(r.check_in, r.check_out)}
                </td>
                <td className="px-4 py-3.5 font-sans text-sm text-midnight">
                  {r.num_guests}
                </td>
                <td className="px-4 py-3.5 font-display italic text-gold">
                  {formatUSD(r.total)}
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant={STATUS_VARIANT[r.payment_status]} size="sm">
                    {STATUS_LABEL[r.payment_status]}
                  </Badge>
                </td>
                <td className="px-4 py-3.5">
                  <Link
                    href={`/admin/reservations/${r.id}`}
                    className="font-sans text-sm font-medium text-gold hover:underline"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Section({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wider text-midnight-400">
        {title}
        <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-pearl-300 px-1.5 font-sans text-xs font-semibold text-midnight">
          {count}
        </span>
      </h3>
      {children}
    </section>
  )
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-pearl-400 bg-white px-8 py-16 text-center shadow-sm">
      <p className="font-heading text-lg text-midnight-400">{title}</p>
      <p className="mt-1 font-sans text-sm text-midnight-400">{subtitle}</p>
    </div>
  )
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn).getTime()
  const b = new Date(checkOut).getTime()
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

function formatUSD(amount: number | null): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
