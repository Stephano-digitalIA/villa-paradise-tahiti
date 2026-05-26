import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle, Calendar, Users, Phone, Mail, CreditCard } from 'lucide-react'

import { adminClient } from '@/lib/supabase/admin'
import type { Reservation, Customer } from '@/lib/supabase/types'

type ReservationWithCustomer = Reservation & { customer: Customer | null }

export const metadata: Metadata = {
  title: 'Your reservation — Villa Paradise Tahiti',
  robots: { index: false, follow: false },
}

// Force dynamic — must hit DB on every request (token is the credential).
export const dynamic = 'force-dynamic'

interface StatusPageProps {
  searchParams: { token?: string }
}

function formatUSD(amount: number | null): string {
  if (!amount) return '—'
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function paymentStatusLabel(status: Reservation['payment_status']): {
  label: string
  color: string
} {
  switch (status) {
    case 'deposit_paid':
      return { label: 'Deposit paid — balance due before arrival', color: 'text-amber-600' }
    case 'fully_paid':
      return { label: 'Fully paid', color: 'text-emerald-600' }
    case 'pending':
      return { label: 'Payment pending', color: 'text-red-600' }
    case 'cancelled':
      return { label: 'Cancelled', color: 'text-midnight-400' }
    case 'refunded':
      return { label: 'Refunded', color: 'text-midnight-400' }
    default:
      return { label: status, color: 'text-midnight-400' }
  }
}

export default async function StatusPage({ searchParams }: StatusPageProps) {
  const { token } = searchParams

  if (!token || token.length < 32) {
    redirect('/booking')
  }

  const { data: reservation, error } = await (adminClient
    .from('reservations')
    .select('*, customer:customers(*)')
    .eq('access_token', token)
    .maybeSingle() as unknown as Promise<{
    data: ReservationWithCustomer | null
    error: unknown
  }>)

  if (error || !reservation) {
    redirect('/booking')
  }

  const paymentStatus = paymentStatusLabel(reservation.payment_status)
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
  const ownerEmail = process.env.EMAIL_OWNER ?? 'contact@villaparadisetahiti.com'

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-gold" aria-hidden="true" />
        <h1 className="font-heading text-3xl font-light text-midnight sm:text-4xl">
          Your reservation
        </h1>
        <p className="mt-2 text-sm text-midnight-400">
          Reference{' '}
          <span className="font-semibold text-midnight">
            {reservation.reservation_ref}
          </span>
        </p>
      </div>

      {/* Stay details */}
      <section className="mb-6 rounded-lg border border-pearl-400 bg-white p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">
          Stay details
        </h2>
        <div className="space-y-3">
          <Row icon={<Calendar className="h-4 w-4" />} label="Check-in">
            {formatDate(reservation.check_in)}
          </Row>
          <Row icon={<Calendar className="h-4 w-4" />} label="Check-out">
            {formatDate(reservation.check_out)}
          </Row>
          <Row icon={<Users className="h-4 w-4" />} label="Guests">
            {reservation.num_guests}{' '}
            {reservation.num_guests === 1 ? 'guest' : 'guests'}
          </Row>
        </div>
      </section>

      {/* Experiences */}
      {reservation.selected_experiences?.length > 0 && (
        <section className="mb-6 rounded-lg border border-pearl-400 bg-white p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">
            Curated experiences
          </h2>
          <ul className="space-y-2">
            {reservation.selected_experiences.map((xp, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span className="text-midnight">{xp.title}</span>
                <span className="text-midnight-400">× {xp.quantity}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Payment summary */}
      <section className="mb-6 rounded-lg border border-pearl-400 bg-white p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">
          Payment
        </h2>
        <div className="space-y-3">
          <Row icon={<CreditCard className="h-4 w-4" />} label="Status">
            <span className={paymentStatus.color}>{paymentStatus.label}</span>
          </Row>
          {reservation.deposit_amount && (
            <Row label="Deposit paid">{formatUSD(reservation.deposit_amount)}</Row>
          )}
          {reservation.balance_amount && reservation.payment_status !== 'fully_paid' && (
            <Row label="Balance due">{formatUSD(reservation.balance_amount)}</Row>
          )}
          {reservation.total && (
            <Row label="Total">
              <strong>{formatUSD(reservation.total)}</strong>
            </Row>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="mb-6 rounded-lg border border-pearl-400 bg-white p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">
          Need help?
        </h2>
        <div className="space-y-3">
          {whatsapp && (
            <Row icon={<Phone className="h-4 w-4" />} label="WhatsApp">
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                className="text-lagoon underline hover:text-gold"
              >
                {whatsapp}
              </a>
            </Row>
          )}
          <Row icon={<Mail className="h-4 w-4" />} label="Email">
            <a
              href={`mailto:${ownerEmail}`}
              className="text-lagoon underline hover:text-gold"
            >
              {ownerEmail}
            </a>
          </Row>
        </div>
      </section>

      {/* Cancellation policy */}
      <p className="text-center text-xs text-midnight-400">
        Need to cancel?{' '}
        <Link href="/legal/cancellation" className="underline hover:text-gold">
          View our cancellation policy
        </Link>
        .
      </p>
    </main>
  )
}

/* ---------- internal helper ---------------------------------------------- */

function Row({
  icon,
  label,
  children,
}: {
  icon?: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <div className="flex items-center gap-2 text-midnight-400">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-right text-midnight">{children}</span>
    </div>
  )
}
