import { NextResponse, type NextRequest } from 'next/server'

import { adminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/clients/[id]/export
 *
 * Returns a complete JSON snapshot of all data we hold about a customer,
 * to satisfy GDPR right-of-access. Includes:
 *  - profile
 *  - reservations + payment events
 *  - email logs
 *  - private notes (admin-authored, but still part of "data we hold")
 *  - assigned tags
 *
 * Protected by the admin middleware (anything under /admin and the related
 * APIs requires an authenticated admin cookie session).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const customerId = params.id

  const [
    customerRes,
    reservationsRes,
    notesRes,
    emailsRes,
    tagsRes,
  ] = await Promise.all([
    adminClient.from('customers').select('*').eq('id', customerId).maybeSingle(),
    adminClient
      .from('reservations')
      .select('*, payment_events(*)')
      .eq('customer_id', customerId)
      .order('check_in', { ascending: false }),
    adminClient
      .from('customer_notes')
      .select('id, body, created_at, updated_at, deleted_at, author_id')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false }),
    adminClient
      .from('email_logs')
      .select('*')
      .eq('customer_id', customerId)
      .order('sent_at', { ascending: false }),
    adminClient
      .from('customer_tag_assignments')
      .select('assigned_at, customer_tags(label, color)')
      .eq('customer_id', customerId),
  ])

  if (customerRes.error || !customerRes.data) {
    return NextResponse.json(
      { error: customerRes.error?.message ?? 'Customer not found' },
      { status: 404 },
    )
  }

  const payload = {
    export_format_version: 1,
    generated_at: new Date().toISOString(),
    customer: customerRes.data,
    reservations: reservationsRes.data ?? [],
    notes: notesRes.data ?? [],
    email_logs: emailsRes.data ?? [],
    tags: ((tagsRes.data ?? []) as Array<{
      assigned_at: string
      customer_tags: { label: string; color: string } | null
    }>).map((row) => ({
      assigned_at: row.assigned_at,
      tag: row.customer_tags,
    })),
  }

  const fileName = `customer-${customerId}-${new Date().toISOString().slice(0, 10)}.json`

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  })
}
