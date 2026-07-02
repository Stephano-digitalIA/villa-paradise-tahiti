import type { Metadata } from 'next'
import Link from 'next/link'
import { adminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/Badge'
import type { Reservation, Customer } from '@/lib/supabase/types'

export const metadata: Metadata = {
  title: 'Dashboard — Villa Paradise Tahiti Admin',
}

export const dynamic = 'force-dynamic'

type PaymentStatus = Reservation['payment_status']

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

function formatUSD(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

type KpiCardProps = {
  label: string
  value: string
  sublabel?: string
  accent?: boolean
  badge?: React.ReactNode
}

function KpiCard({ label, value, sublabel, accent, badge }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
      <p className="font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
        {label}
      </p>
      <div className="mt-2 flex items-end gap-2">
        <p
          className={
            accent
              ? 'font-display text-3xl italic text-gold'
              : 'font-heading text-3xl font-semibold text-midnight'
          }
        >
          {value}
        </p>
        {badge}
      </div>
      {sublabel && (
        <p className="mt-1 font-sans text-xs text-midnight-400">{sublabel}</p>
      )}
    </div>
  )
}

type RecentReservation = Reservation & { customers: Pick<Customer, 'first_name' | 'last_name' | 'email'> | null }

export default async function AdminDashboardPage() {
  const [
    { count: totalReservations },
    { count: pendingReservations },
    { data: paidReservations },
    { count: totalInquiries },
    { data: recentReservations },
  ] = await Promise.all([
    adminClient.from('reservations').select('*', { count: 'exact', head: true }),
    adminClient
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'pending'),
    adminClient
      .from('reservations')
      .select('total, deposit_amount')
      .in('payment_status', ['deposit_paid', 'fully_paid']),
    adminClient
      .from('contact_inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('replied', false),
    adminClient
      .from('reservations')
      .select('*, customers(first_name, last_name, email)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Compute revenue KPIs
  const totalRevenue = (paidReservations ?? []).reduce(
    (sum, r) => sum + (r.total ?? 0),
    0,
  )
  const totalDeposits = (paidReservations ?? []).reduce(
    (sum, r) => sum + (r.deposit_amount ?? 0),
    0,
  )

  const recent = (recentReservations ?? []) as RecentReservation[]

  return (
    <div className="p-8">
      {/* Page title */}
      <h1 className="font-heading text-2xl font-semibold text-midnight">
        Dashboard
      </h1>
      <p className="mt-1 font-sans text-sm text-midnight-400">
        Overview of your villa bookings and activity
      </p>

      {/* KPI Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Reservations"
          value={String(totalReservations ?? 0)}
          sublabel="All time"
        />
        <KpiCard
          label="Total Revenue"
          value={formatUSD(totalRevenue)}
          sublabel="Deposit & fully paid"
          accent
        />
        <KpiCard
          label="Deposits Collected"
          value={formatUSD(totalDeposits)}
          sublabel="Pending balance"
          accent
        />
        <KpiCard
          label="Unanswered Inquiries"
          value={String(totalInquiries ?? 0)}
          sublabel="Contact requests"
          badge={
            (totalInquiries ?? 0) > 0 ? (
              <Badge variant="warning" size="sm">
                {totalInquiries} new
              </Badge>
            ) : undefined
          }
        />
      </div>

      {/* Pending reservations quick-stat */}
      {(pendingReservations ?? 0) > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/5 px-5 py-3">
          <Badge variant="warning">{pendingReservations} pending</Badge>
          <span className="font-sans text-sm text-midnight">
            reservations awaiting payment confirmation
          </span>
          <Link
            href="/admin/reservations?status=pending"
            className="ml-auto font-sans text-sm font-medium text-gold hover:underline"
          >
            Review →
          </Link>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-midnight">
            Recent Bookings
          </h2>
          <Link
            href="/admin/reservations"
            className="font-sans text-sm font-medium text-gold hover:underline"
          >
            View all reservations →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-2xl border border-pearl-400 bg-white px-8 py-16 text-center shadow-sm">
            <p className="font-heading text-lg text-midnight-400">
              No reservations yet
            </p>
            <p className="mt-1 font-sans text-sm text-midnight-400">
              Bookings will appear here once guests reserve the villa.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-pearl-400 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-pearl-400 bg-pearl-300/40">
                    <th className="px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                      Réf
                    </th>
                    <th className="px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                      Client
                    </th>
                    <th className="px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                      Dates
                    </th>
                    <th className="px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                      Total
                    </th>
                    <th className="px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={
                        idx < recent.length - 1
                          ? 'border-b border-pearl-400'
                          : ''
                      }
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/reservations/${r.id}`}
                          className="font-mono text-sm font-medium text-midnight hover:text-gold"
                        >
                          {r.reservation_ref}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-sans text-sm text-midnight">
                          {r.customers
                            ? `${r.customers.first_name} ${r.customers.last_name}`
                            : '—'}
                        </p>
                        <p className="font-sans text-xs text-midnight-400">
                          {r.customers?.email ?? ''}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-sans text-sm text-midnight">
                        {formatDate(r.check_in)} → {formatDate(r.check_out)}
                      </td>
                      <td className="px-5 py-4 font-display italic text-gold">
                        {formatUSD(r.total)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={STATUS_VARIANT[r.payment_status]} size="sm">
                          {STATUS_LABEL[r.payment_status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
