import type { Metadata } from 'next'
import { adminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/Badge'
import type { BlockedDate, PaymentStatus } from '@/lib/supabase/types'
import { BlockDateForm } from './_components/BlockDateForm'
import { DeleteBlockButton } from './_components/DeleteBlockButton'
import { IcalSyncButton } from '@/components/admin/IcalSyncButton'

import {
  MonthCalendarView,
  type CalendarBlock,
  type CalendarReservation,
} from './_components/MonthCalendarView'

export const metadata: Metadata = {
  title: 'Calendar — Villa Paradise Tahiti Admin',
}

export const dynamic = 'force-dynamic'

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
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

export default async function CalendarPage() {
  const today = new Date().toISOString().split('T')[0]
  // Calendar view needs visibility on the previous month too (when navigating
  // back to "Today" from a future month, or when a guest just checked out).
  const oneMonthAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const [{ data: reservations }, { data: blockedDates }] = await Promise.all([
    adminClient
      .from('reservations')
      .select(
        'id, reservation_ref, check_in, check_out, num_guests, payment_status, customers(first_name, last_name)',
      )
      .gte('check_out', oneMonthAgo)
      .order('check_in', { ascending: true }),
    adminClient
      .from('blocked_dates')
      .select('*')
      .gte('blocked_to', oneMonthAgo)
      .order('blocked_from', { ascending: true }),
  ])

  // Find last iCal sync timestamp (blocked_dates with source 'airbnb')
  const lastIcalSync = (blockedDates ?? [])
    .filter((b) => b.source === 'airbnb')
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )[0]?.updated_at

  const minutesAgo = lastIcalSync
    ? Math.round((Date.now() - new Date(lastIcalSync).getTime()) / 60000)
    : null

  type ReservationRow = {
    id: string
    reservation_ref: string
    check_in: string
    check_out: string
    num_guests: number
    payment_status: PaymentStatus
    customers: { first_name: string; last_name: string } | null
  }

  const reservationRows = (reservations ?? []) as ReservationRow[]
  const allBlocks = (blockedDates ?? []) as BlockedDate[]

  // Adapt to the calendar view shape (denormalised guest name, slimmer payload).
  const calendarReservations: CalendarReservation[] = reservationRows.map((r) => ({
    id: r.id,
    reservation_ref: r.reservation_ref,
    check_in: r.check_in,
    check_out: r.check_out,
    guest_name: r.customers
      ? `${r.customers.first_name} ${r.customers.last_name}`.trim()
      : null,
    num_guests: r.num_guests,
    payment_status: r.payment_status,
  }))

  const calendarBlocks: CalendarBlock[] = allBlocks.map((b) => ({
    id: b.id,
    blocked_from: b.blocked_from,
    blocked_to: b.blocked_to,
    source: b.source,
    reason: b.reason,
  }))

  return (
    <div className="p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-midnight">
            Calendar
          </h1>
          <p className="mt-1 font-sans text-sm text-midnight-400">
            Month view of reservations and blocked periods across every channel
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-pearl-400 bg-white px-4 py-2 shadow-sm">
            <span
              className={`h-2 w-2 rounded-full ${minutesAgo !== null ? 'bg-leaf' : 'bg-midnight-300'}`}
            />
            <span className="font-sans text-xs text-midnight-400">
              {minutesAgo !== null
                ? `Dernière sync iCal : ${minutesAgo < 1 ? 'à l’instant' : `il y a ${minutesAgo} min`}`
                : 'Aucune sync iCal pour le moment'}
            </span>
          </div>
          <IcalSyncButton variant="outline" />
        </div>
      </div>

      {/* ─── Month calendar view ──────────────────────────── */}
      <div className="mt-6">
        <MonthCalendarView
          reservations={calendarReservations}
          blocks={calendarBlocks}
        />
      </div>

      {/* Upcoming Reservations */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-midnight">
          Upcoming Reservations
        </h2>
        <p className="mt-1 font-sans text-xs text-midnight-400">
          Showing stays with check-out on or after today &mdash; next 3 months
        </p>

        {reservationRows.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-pearl-400 bg-white px-8 py-12 text-center shadow-sm">
            <p className="font-heading text-base text-midnight-400">
              No upcoming reservations
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-pearl-400 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-pearl-400 bg-pearl-300/40">
                    {[
                      'Réf',
                      'Client',
                      'Arrivée',
                      'Départ',
                      'Nuits',
                      'Voyageurs',
                      'Statut',
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
                  {reservationRows.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={
                        idx < reservationRows.length - 1
                          ? 'border-b border-pearl-400 hover:bg-pearl-300/20 transition-colors'
                          : 'hover:bg-pearl-300/20 transition-colors'
                      }
                    >
                      <td className="px-4 py-3.5 font-mono text-sm font-medium text-midnight">
                        {r.reservation_ref}
                      </td>
                      <td className="px-4 py-3.5 font-sans text-sm text-midnight">
                        {r.customers
                          ? `${r.customers.first_name} ${r.customers.last_name}`
                          : '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-sans text-sm text-midnight">
                        {formatDate(r.check_in)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-sans text-sm text-midnight">
                        {formatDate(r.check_out)}
                      </td>
                      <td className="px-4 py-3.5 font-sans text-sm text-midnight">
                        {nightsBetween(r.check_in, r.check_out)}
                      </td>
                      <td className="px-4 py-3.5 font-sans text-sm text-midnight">
                        {r.num_guests}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={STATUS_VARIANT[r.payment_status]}
                          size="sm"
                        >
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

      {/* Blocked Periods */}
      <div className="mt-10">
        <h2 className="font-heading text-lg font-semibold text-midnight">
          Blocked Periods
        </h2>

        {(blockedDates ?? []).length === 0 ? (
          <div className="mt-4 rounded-2xl border border-pearl-400 bg-white px-8 py-12 text-center shadow-sm">
            <p className="font-heading text-base text-midnight-400">
              No blocked periods
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-pearl-400 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-pearl-400 bg-pearl-300/40">
                    {['Du', 'Au', 'Motif', 'Source', ''].map((h) => (
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
                  {(blockedDates ?? []).map((b, idx) => (
                    <tr
                      key={b.id}
                      className={
                        idx < (blockedDates ?? []).length - 1
                          ? 'border-b border-pearl-400 hover:bg-pearl-300/20 transition-colors'
                          : 'hover:bg-pearl-300/20 transition-colors'
                      }
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-sans text-sm text-midnight">
                        {formatDate(b.blocked_from)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-sans text-sm text-midnight">
                        {formatDate(b.blocked_to)}
                      </td>
                      <td className="px-4 py-3.5 font-sans text-sm text-midnight">
                        {b.reason ?? '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            b.source === 'airbnb'
                              ? 'warning'
                              : b.source === 'maintenance'
                              ? 'info'
                              : 'default'
                          }
                          size="sm"
                        >
                          {b.source}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        {(b.source === 'owner' || b.source === 'maintenance') && (
                          <DeleteBlockButton blockId={b.id} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Block dates form */}
      <div className="mt-10">
        <h2 className="font-heading text-lg font-semibold text-midnight">
          Block Dates Manually
        </h2>
        <p className="mt-1 font-sans text-sm text-midnight-400">
          Block a period for owner use, maintenance, or other reasons.
        </p>
        <div className="mt-4">
          <BlockDateForm />
        </div>
      </div>
    </div>
  )
}
