/**
 * GET /api/admin/reservations/export
 *
 * Downloads all reservations as a CSV file.
 * Protected: requires a valid Supabase admin session.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { adminClient } from '@/lib/supabase/admin'
import type { Database, Reservation, Customer } from '@/lib/supabase/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function escapeCSV(value: string | number | null | undefined): string {
  if (value == null) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

export async function GET() {
  // Verify admin session
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // No-op for Route Handlers
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify admin_users membership
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch all reservations
  const { data: reservations, error } = await adminClient
    .from('reservations')
    .select('*, customers(first_name, last_name, email, phone, country, city)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  type ReservationWithCustomer = Reservation & {
    customers: Pick<Customer, 'first_name' | 'last_name' | 'email' | 'phone' | 'country' | 'city'> | null
  }

  const rows = (reservations ?? []) as ReservationWithCustomer[]

  // Build CSV
  const headers = [
    'Ref',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Country',
    'City',
    'Check-in',
    'Check-out',
    'Nights',
    'Guests',
    'Nightly Rate (USD)',
    'Season',
    'Villa Subtotal (USD)',
    'Cleaning Fee (USD)',
    'Experiences Total (USD)',
    'Subtotal (USD)',
    'Taxes (USD)',
    'Total (USD)',
    'Deposit Amount (USD)',
    'Balance Amount (USD)',
    'Payment Status',
    'Payment Method',
    'Deposit Paid At',
    'Balance Paid At',
    'Created At',
  ]

  const csvLines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        escapeCSV(r.reservation_ref),
        escapeCSV(r.customers?.first_name),
        escapeCSV(r.customers?.last_name),
        escapeCSV(r.customers?.email),
        escapeCSV(r.customers?.phone),
        escapeCSV(r.customers?.country),
        escapeCSV(r.customers?.city),
        escapeCSV(r.check_in),
        escapeCSV(r.check_out),
        escapeCSV(nightsBetween(r.check_in, r.check_out)),
        escapeCSV(r.num_guests),
        escapeCSV(r.nightly_rate_usd),
        escapeCSV(r.season),
        escapeCSV(r.villa_subtotal),
        escapeCSV(r.cleaning_fee),
        escapeCSV(r.experiences_total),
        escapeCSV(r.subtotal),
        escapeCSV(r.taxes),
        escapeCSV(r.total),
        escapeCSV(r.deposit_amount),
        escapeCSV(r.balance_amount),
        escapeCSV(r.payment_status),
        escapeCSV(r.payment_method),
        escapeCSV(r.deposit_paid_at),
        escapeCSV(r.balance_paid_at),
        escapeCSV(r.created_at),
      ].join(','),
    ),
  ]

  const csv = csvLines.join('\n')
  const filename = `reservations-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
