import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/Badge'
import type { PaymentStatus, SelectedExperienceSnapshot, Reservation, Customer } from '@/lib/supabase/types'
import { ReservationActions } from './_components/ReservationActions'
import { NotesForm } from './_components/NotesForm'

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

function formatUSD(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
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

type PageProps = { params: { id: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Reservation ${params.id} — Villa Paradise Tahiti Admin`,
  }
}

// Explicit row type for the reservation detail query
type ReservationDetailRow = Reservation & {
  customers: Customer | null
  payment_status: PaymentStatus
}

export default async function ReservationDetailPage({ params }: PageProps) {
  // Fetch reservation first — bail early if not found
  const { data: rawReservation, error: reservationError } = await adminClient
    .from('reservations')
    .select('*, customers(*)')
    .eq('id', params.id)
    .single()

  if (reservationError || !rawReservation) {
    notFound()
  }

  const r = rawReservation as unknown as ReservationDetailRow
  const customer = r.customers ?? null

  // Fetch supplementary data in parallel
  const [paymentEventsResult, emailLogsResult] = await Promise.all([
    adminClient
      .from('payment_events')
      .select('event_type, processed_at')
      .eq('reservation_id', params.id)
      .order('processed_at', { ascending: false }),
    adminClient
      .from('email_logs')
      .select('email_type, status, sent_at, recipient_email')
      .eq('reservation_id', params.id)
      .order('sent_at', { ascending: false }),
  ])

  const paymentEvents = paymentEventsResult.data ?? []
  const emailLogs = emailLogsResult.data ?? []
  const nights = nightsBetween(r.check_in, r.check_out)
  const experiences = (r.selected_experiences ?? []) as SelectedExperienceSnapshot[]

  return (
    <div className="p-8">
      {/* Back link */}
      <Link
        href="/admin/reservations"
        className="inline-flex items-center gap-1.5 font-sans text-sm text-midnight-400 hover:text-midnight"
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to reservations
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-semibold text-midnight">
              {r.reservation_ref}
            </h1>
            <Badge variant={STATUS_VARIANT[r.payment_status]}>
              {STATUS_LABEL[r.payment_status]}
            </Badge>
          </div>
          <p className="mt-1 font-sans text-sm text-midnight-400">
            Created {formatDateTime(r.created_at)}
            {r.payment_method && ` · ${r.payment_method}`}
          </p>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT — Client info + notes */}
        <div className="space-y-6">
          {/* Client info */}
          <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-base font-semibold text-midnight">
              Guest Information
            </h2>
            {customer ? (
              <dl className="mt-4 space-y-3">
                <div className="flex gap-4">
                  <dt className="w-28 flex-shrink-0 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                    Name
                  </dt>
                  <dd className="font-sans text-sm text-midnight">
                    {customer.first_name} {customer.last_name}
                  </dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-28 flex-shrink-0 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                    Email
                  </dt>
                  <dd className="font-sans text-sm text-midnight">
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-lagoon hover:underline"
                    >
                      {customer.email}
                    </a>
                  </dd>
                </div>
                {customer.phone && (
                  <div className="flex gap-4">
                    <dt className="w-28 flex-shrink-0 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                      Phone
                    </dt>
                    <dd className="font-sans text-sm text-midnight">
                      {customer.phone}
                    </dd>
                  </div>
                )}
                {customer.country && (
                  <div className="flex gap-4">
                    <dt className="w-28 flex-shrink-0 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                      Country
                    </dt>
                    <dd className="font-sans text-sm text-midnight">
                      {customer.city ? `${customer.city}, ` : ''}
                      {customer.country}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="mt-4 font-sans text-sm text-midnight-400">
                No customer data linked.
              </p>
            )}
          </div>

          {/* Internal notes */}
          <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-base font-semibold text-midnight">
              Internal Notes
            </h2>
            <NotesForm
              reservationId={r.id}
              initialNotes={r.internal_notes ?? ''}
            />
          </div>

          {/* Special requests */}
          {r.special_requests && (
            <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-base font-semibold text-midnight">
                Special Requests
              </h2>
              <p className="mt-3 font-sans text-sm text-midnight">
                {r.special_requests}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT — Booking details */}
        <div className="space-y-6">
          {/* Booking details */}
          <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-base font-semibold text-midnight">
              Booking Details
            </h2>
            <dl className="mt-4 space-y-3">
              <div className="flex gap-4">
                <dt className="w-28 flex-shrink-0 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                  Check-in
                </dt>
                <dd className="font-sans text-sm text-midnight">
                  {formatDate(r.check_in)}
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-28 flex-shrink-0 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                  Check-out
                </dt>
                <dd className="font-sans text-sm text-midnight">
                  {formatDate(r.check_out)}
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-28 flex-shrink-0 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                  Nights
                </dt>
                <dd className="font-sans text-sm text-midnight">{nights}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-28 flex-shrink-0 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                  Guests
                </dt>
                <dd className="font-sans text-sm text-midnight">
                  {r.num_guests}
                </dd>
              </div>
              {r.arrival_flight && (
                <div className="flex gap-4">
                  <dt className="w-28 flex-shrink-0 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                    Arrival
                  </dt>
                  <dd className="font-sans text-sm text-midnight">
                    {r.arrival_flight}
                  </dd>
                </div>
              )}
              {r.departure_flight && (
                <div className="flex gap-4">
                  <dt className="w-28 flex-shrink-0 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                    Departure
                  </dt>
                  <dd className="font-sans text-sm text-midnight">
                    {r.departure_flight}
                  </dd>
                </div>
              )}
            </dl>

            {/* Price breakdown */}
            <div className="mt-6 border-t border-pearl-400 pt-4">
              <h3 className="font-heading text-sm font-semibold text-midnight">
                Price Breakdown
              </h3>
              <dl className="mt-3 space-y-2">
                {r.villa_subtotal != null && (
                  <div className="flex justify-between">
                    <dt className="font-sans text-sm text-midnight-400">
                      Villa ({nights} nights × {formatUSD(r.nightly_rate_usd)})
                    </dt>
                    <dd className="font-sans text-sm text-midnight">
                      {formatUSD(r.villa_subtotal)}
                    </dd>
                  </div>
                )}
                {r.cleaning_fee != null && (
                  <div className="flex justify-between">
                    <dt className="font-sans text-sm text-midnight-400">
                      Cleaning fee
                    </dt>
                    <dd className="font-sans text-sm text-midnight">
                      {formatUSD(r.cleaning_fee)}
                    </dd>
                  </div>
                )}
                {r.experiences_total != null && r.experiences_total > 0 && (
                  <div className="flex justify-between">
                    <dt className="font-sans text-sm text-midnight-400">
                      Experiences
                    </dt>
                    <dd className="font-sans text-sm text-midnight">
                      {formatUSD(r.experiences_total)}
                    </dd>
                  </div>
                )}
                {r.taxes != null && r.taxes > 0 && (
                  <div className="flex justify-between">
                    <dt className="font-sans text-sm text-midnight-400">
                      Taxes
                    </dt>
                    <dd className="font-sans text-sm text-midnight">
                      {formatUSD(r.taxes)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-pearl-400 pt-2">
                  <dt className="font-sans text-sm font-semibold text-midnight">
                    Total
                  </dt>
                  <dd className="font-display italic text-gold">
                    {formatUSD(r.total)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-sans text-sm text-midnight-400">
                    Deposit (paid)
                  </dt>
                  <dd className="font-sans text-sm text-midnight">
                    {formatUSD(r.deposit_amount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-sans text-sm text-midnight-400">
                    Balance due
                  </dt>
                  <dd className="font-sans text-sm font-semibold text-midnight">
                    {formatUSD(r.balance_amount)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Experiences */}
          {experiences.length > 0 && (
            <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-base font-semibold text-midnight">
                Selected Experiences
              </h2>
              <ul className="mt-4 space-y-2">
                {experiences.map((exp) => (
                  <li key={exp.slug} className="flex justify-between">
                    <span className="font-sans text-sm text-midnight">
                      {exp.title}{' '}
                      <span className="text-midnight-400">
                        × {exp.quantity}
                      </span>
                    </span>
                    <span className="font-sans text-sm text-midnight">
                      {formatUSD(exp.price_usd * exp.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Payment Events */}
      <div className="mt-6 rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-semibold text-midnight">
          Payment Events
        </h2>
        {paymentEvents.length === 0 ? (
          <p className="mt-4 font-sans text-sm text-midnight-400">
            No payment events recorded.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {paymentEvents.map((evt, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-gold" />
                <div>
                  <p className="font-sans text-sm font-medium text-midnight">
                    {evt.event_type}
                  </p>
                  <p className="font-sans text-xs text-midnight-400">
                    {formatDateTime(evt.processed_at)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Email Logs */}
      <div className="mt-6 rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-semibold text-midnight">
          Email Logs
        </h2>
        {emailLogs.length === 0 ? (
          <p className="mt-4 font-sans text-sm text-midnight-400">
            No emails sent for this reservation.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-pearl-400">
                  <th className="pb-2 pr-6 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                    Type
                  </th>
                  <th className="pb-2 pr-6 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                    Recipient
                  </th>
                  <th className="pb-2 pr-6 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                    Status
                  </th>
                  <th className="pb-2 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody>
                {emailLogs.map((log, idx) => (
                  <tr
                    key={idx}
                    className={
                      idx < emailLogs.length - 1
                        ? 'border-b border-pearl-400'
                        : ''
                    }
                  >
                    <td className="py-2 pr-6 font-sans text-sm text-midnight">
                      {log.email_type}
                    </td>
                    <td className="py-2 pr-6 font-sans text-sm text-midnight-400">
                      {log.recipient_email}
                    </td>
                    <td className="py-2 pr-6">
                      <Badge
                        variant={
                          log.status === 'sent'
                            ? 'success'
                            : log.status === 'failed'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {log.status}
                      </Badge>
                    </td>
                    <td className="py-2 font-sans text-xs text-midnight-400">
                      {formatDateTime(log.sent_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Actions */}
      <div className="mt-6">
        <ReservationActions
          reservationId={r.id}
          paymentStatus={r.payment_status}
          customerEmail={customer?.email}
        />
      </div>
    </div>
  )
}
