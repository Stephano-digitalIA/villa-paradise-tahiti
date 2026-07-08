import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, CalendarCheck, Mail, UserCircle } from 'lucide-react'

import { Button, Container, Section } from '@/components/ui'
import { Price } from '@/components/currency'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import type { PaymentStatus, Reservation } from '@/lib/supabase/types'

export const metadata: Metadata = {
  title: 'My account — Villa Paradise Tahiti',
  description: 'Your Villa Paradise Tahiti client space.',
  robots: { index: false, follow: false },
}

// Always render per-request with fresh data so newly created bookings appear.
export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Awaiting payment',
  deposit_paid: 'Deposit paid',
  fully_paid: 'Fully paid',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-gold/10 text-gold',
  deposit_paid: 'bg-gold/10 text-gold',
  fully_paid: 'bg-emerald-500/10 text-emerald-700',
  cancelled: 'bg-midnight/5 text-midnight-400',
  refunded: 'bg-midnight/5 text-midnight-400',
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Reservations are linked to a `customers` row by email (the checkout upserts
 * the customer on `email`). We match the signed-in user's email to surface
 * their bookings. Uses the service-role client (RLS-bypassing) but is strictly
 * scoped to the authenticated user's own email.
 */
async function getUserReservations(email: string): Promise<Reservation[]> {
  const { data: customers } = await adminClient
    .from('customers')
    .select('id')
    .ilike('email', email)

  const customerIds = (customers ?? []).map((c) => c.id)
  if (customerIds.length === 0) return []

  const { data: reservations } = await adminClient
    .from('reservations')
    .select('*')
    .in('customer_id', customerIds)
    .order('check_in', { ascending: false })

  return (reservations ?? []) as Reservation[]
}

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect('/')
  }

  const user = data.user
  const meta = user.user_metadata ?? {}
  const fullName: string = meta.full_name || meta.name || ''
  const firstName = fullName.includes(' ')
    ? fullName.split(' ')[0]
    : fullName || (user.email?.split('@')[0] ?? 'there')

  const reservations = user.email ? await getUserReservations(user.email) : []

  return (
    <Section tone="pearl" spacing="default">
      <Container className="flex flex-col gap-10 pt-12 sm:pt-20">
        <header className="flex flex-col items-center gap-4 text-center">
          <p className="eyebrow flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Client space
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h1 className="font-display text-hero-sm font-light italic leading-[1.05] text-midnight sm:text-hero-md">
            Hello, <span className="not-italic font-heading text-gold">{firstName}</span>
          </h1>
          <p className="max-w-xl font-sans text-body-md text-midnight-400">
            Welcome to your Villa Paradise Tahiti client space. Your bookings, invoices and
            concierge requests will appear here.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Card
            id="bookings"
            icon={<CalendarCheck className="h-5 w-5 text-gold" aria-hidden="true" />}
            title="My bookings"
            body={
              reservations.length > 0
                ? 'Your reservations and their current status.'
                : 'Your reservations and their status will be listed here. Until then, head to the booking page to plan your stay.'
            }
          >
            {reservations.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {reservations.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-col gap-1.5 rounded-xl border border-pearl-400 bg-white/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-heading text-body-md font-medium text-midnight">
                        {formatDate(r.check_in)} – {formatDate(r.check_out)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[r.payment_status]}`}
                      >
                        {STATUS_LABELS[r.payment_status]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 font-sans text-body-sm text-midnight-400">
                      <span>
                        Ref {r.reservation_ref} · {r.num_guests}{' '}
                        {r.num_guests > 1 ? 'guests' : 'guest'}
                      </span>
                      {r.total != null ? (
                        <Price valueUSD={r.total} className="font-medium text-midnight" />
                      ) : (
                        <span className="font-medium text-midnight">—</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Button asChild variant="primary" size="md">
                <Link href="/booking">
                  Build your stay
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
          </Card>

          <Card
            icon={<UserCircle className="h-5 w-5 text-gold" aria-hidden="true" />}
            title="Profile"
            body="Your signed-in details, pulled from your provider account."
          >
            <dl className="flex flex-col gap-1.5 font-sans text-body-sm text-midnight-400">
              <div className="flex gap-2">
                <dt className="font-medium text-midnight">Name:</dt>
                <dd>{fullName || '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-midnight">Email:</dt>
                <dd className="truncate">{user.email ?? '—'}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-pearl-400 bg-pearl p-6 text-center sm:p-8">
          <Mail className="h-6 w-6 text-gold" aria-hidden="true" />
          <p className="font-heading text-h3-luxe font-medium text-midnight">
            Need anything?
          </p>
          <p className="max-w-md font-sans text-body-sm text-midnight-400">
            Our concierge is one email away — for changes to a stay, custom experiences or
            arrival logistics.
          </p>
          <Button asChild variant="outline" size="md">
            <a href="mailto:contact@villaparadisetahiti.com">
              contact@villaparadisetahiti.com
            </a>
          </Button>
        </div>
      </Container>
    </Section>
  )
}

interface CardProps {
  id?: string
  icon: React.ReactNode
  title: string
  body: string
  children?: React.ReactNode
}

function Card({ id, icon, title, body, children }: CardProps) {
  return (
    <section
      id={id}
      className="flex flex-col gap-4 rounded-2xl border border-pearl-400 bg-pearl p-6 shadow-soft sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
          {icon}
        </span>
        <h2 className="font-heading text-h3-luxe font-medium text-midnight">{title}</h2>
      </div>
      <p className="font-sans text-body-sm text-midnight-400">{body}</p>
      {children ? <div className="pt-1">{children}</div> : null}
    </section>
  )
}
