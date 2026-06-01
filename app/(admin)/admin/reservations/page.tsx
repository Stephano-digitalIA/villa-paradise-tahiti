import type { Metadata } from 'next'
import Link from 'next/link'
import { adminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/Badge'
import type { Reservation, PaymentStatus, Customer } from '@/lib/supabase/types'
import { ReservationsFilters } from './_components/ReservationsFilters'

export const metadata: Metadata = {
  title: 'Reservations — Villa Paradise Tahiti Admin',
}

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

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
  pending: 'Pending',
  deposit_paid: 'Deposit Paid',
  fully_paid: 'Fully Paid',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
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

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

type ReservationWithCustomer = Reservation & {
  customers: Pick<Customer, 'first_name' | 'last_name' | 'email' | 'phone'> | null
}

type PageProps = {
  searchParams: {
    status?: string
    q?: string
    page?: string
  }
}

export default async function ReservationsPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  let query = adminClient
    .from('reservations')
    .select('*, customers(first_name, last_name, email, phone)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (searchParams.status) {
    query = query.eq('payment_status', searchParams.status as PaymentStatus)
  }
  if (searchParams.q) {
    query = query.ilike('reservation_ref', `%${searchParams.q}%`)
  }

  const { data: reservations, count } = await query.range(offset, offset + PAGE_SIZE - 1)

  const rows = (reservations ?? []) as ReservationWithCustomer[]
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  // Build pagination URLs
  function buildUrl(p: number) {
    const params = new URLSearchParams()
    if (searchParams.status) params.set('status', searchParams.status)
    if (searchParams.q) params.set('q', searchParams.q)
    params.set('page', String(p))
    return `/admin/reservations?${params.toString()}`
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-midnight">
            Reservations
          </h1>
          <p className="mt-1 font-sans text-sm text-midnight-400">
            {count ?? 0} total reservation{(count ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <a
          href="/api/admin/reservations/export"
          className="inline-flex items-center gap-2 rounded-xl border border-pearl-400 bg-white px-4 py-2 font-sans text-sm font-medium text-midnight shadow-sm transition-colors hover:border-midnight"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="mt-6">
        <ReservationsFilters
          currentStatus={searchParams.status}
          currentQ={searchParams.q}
        />
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-pearl-400 bg-white px-8 py-16 text-center shadow-sm">
          <p className="font-heading text-lg text-midnight-400">
            No reservations found
          </p>
          <p className="mt-1 font-sans text-sm text-midnight-400">
            Try adjusting your filters or search term.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-pearl-400 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-pearl-400 bg-pearl-300/40">
                  {[
                    'Réf',
                    'Client',
                    'Arrivée',
                    'Départ',
                    'Nuits',
                    'Voyageurs',
                    'Total',
                    'Acompte',
                    'Statut',
                    'Créée le',
                    '',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400"
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
                      idx < rows.length - 1
                        ? 'border-b border-pearl-400 hover:bg-pearl-300/20 transition-colors'
                        : 'hover:bg-pearl-300/20 transition-colors'
                    }
                  >
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm font-medium text-midnight">
                        {r.reservation_ref}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-sans text-sm text-midnight">
                        {r.customers
                          ? `${r.customers.first_name} ${r.customers.last_name}`
                          : '—'}
                      </p>
                      <p className="font-sans text-xs text-midnight-400">
                        {r.customers?.email ?? ''}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-sans text-sm text-midnight">
                      {formatDate(r.check_in)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-sans text-sm text-midnight">
                      {formatDate(r.check_out)}
                    </td>
                    <td className="px-4 py-4 font-sans text-sm text-midnight">
                      {nightsBetween(r.check_in, r.check_out)}
                    </td>
                    <td className="px-4 py-4 font-sans text-sm text-midnight">
                      {r.num_guests}
                    </td>
                    <td className="px-4 py-4 font-display italic text-gold">
                      {formatUSD(r.total)}
                    </td>
                    <td className="px-4 py-4 font-sans text-sm text-midnight">
                      {formatUSD(r.deposit_amount)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={STATUS_VARIANT[r.payment_status]}
                        size="sm"
                      >
                        {STATUS_LABEL[r.payment_status]}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-sans text-xs text-midnight-400">
                      {formatDateTime(r.created_at)}
                    </td>
                    <td className="px-4 py-4">
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="font-sans text-sm text-midnight-400">
            Page {page} of {totalPages} &mdash; {count ?? 0} reservations
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl(page - 1)}
                className="rounded-xl border border-pearl-400 bg-white px-4 py-2 font-sans text-sm font-medium text-midnight shadow-sm transition-colors hover:border-midnight"
              >
                ← Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl(page + 1)}
                className="rounded-xl border border-pearl-400 bg-white px-4 py-2 font-sans text-sm font-medium text-midnight shadow-sm transition-colors hover:border-midnight"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
