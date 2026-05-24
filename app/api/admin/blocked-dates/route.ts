/**
 * POST   /api/admin/blocked-dates  — Insert a new blocked period
 * DELETE /api/admin/blocked-dates?id=<uuid> — Delete a blocked period
 *
 * Both endpoints require a valid Supabase admin session.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { adminClient } from '@/lib/supabase/admin'
import type { Database, BlockedDateSource } from '@/lib/supabase/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_SOURCES: BlockedDateSource[] = ['owner', 'maintenance']

async function getAdminUser() {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  return adminUser ? user : null
}

export async function POST(request: Request) {
  const user = await getAdminUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    blocked_from: string
    blocked_to: string
    reason?: string
    source: string
  }

  try {
    body = await request.json() as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { blocked_from, blocked_to, reason, source } = body

  if (!blocked_from || !blocked_to || !source) {
    return NextResponse.json(
      { error: 'blocked_from, blocked_to, and source are required' },
      { status: 400 },
    )
  }

  if (!ALLOWED_SOURCES.includes(source as BlockedDateSource)) {
    return NextResponse.json(
      { error: `source must be one of: ${ALLOWED_SOURCES.join(', ')}` },
      { status: 400 },
    )
  }

  if (blocked_to < blocked_from) {
    return NextResponse.json(
      { error: 'blocked_to must be on or after blocked_from' },
      { status: 400 },
    )
  }

  const { data, error } = await adminClient
    .from('blocked_dates')
    .insert({
      blocked_from,
      blocked_to,
      reason: reason ?? null,
      source: source as BlockedDateSource,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, data }, { status: 201 })
}

export async function DELETE(request: Request) {
  const user = await getAdminUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'id query parameter is required' },
      { status: 400 },
    )
  }

  // Only allow deleting owner/maintenance blocks — not airbnb/vrbo/direct_booking
  const { data: existing } = await adminClient
    .from('blocked_dates')
    .select('source')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json({ error: 'Blocked date not found' }, { status: 404 })
  }

  if (!ALLOWED_SOURCES.includes(existing.source as BlockedDateSource)) {
    return NextResponse.json(
      { error: 'Cannot delete synced blocked dates (airbnb/vrbo). Only owner/maintenance blocks can be deleted.' },
      { status: 403 },
    )
  }

  const { error } = await adminClient
    .from('blocked_dates')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
