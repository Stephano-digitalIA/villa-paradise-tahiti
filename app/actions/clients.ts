'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'

import { sendCustomCustomerEmail } from '@/lib/resend'
import { adminClient } from '@/lib/supabase/admin'
import type { CustomerTagColor } from '@/lib/supabase/types'

type Result<T = unknown> = { ok: true; data?: T } | { ok: false; error: string }

/* ───────────────────────────────────────────────────────────────
 * Notes — CRUD timeline
 * ─────────────────────────────────────────────────────────────── */

export async function createNote(
  customerId: string,
  body: string,
): Promise<Result> {
  const trimmed = body.trim()
  if (!trimmed) return { ok: false, error: 'Note cannot be empty' }
  if (trimmed.length > 4000) return { ok: false, error: 'Note is too long (4000 max)' }

  const { error } = await adminClient
    .from('customer_notes')
    .insert({ customer_id: customerId, body: trimmed })

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/admin/clients/${customerId}`)
  return { ok: true }
}

export async function updateNote(
  noteId: string,
  customerId: string,
  body: string,
): Promise<Result> {
  const trimmed = body.trim()
  if (!trimmed) return { ok: false, error: 'Note cannot be empty' }
  if (trimmed.length > 4000) return { ok: false, error: 'Note is too long (4000 max)' }

  const { error } = await adminClient
    .from('customer_notes')
    .update({ body: trimmed, updated_at: new Date().toISOString() })
    .eq('id', noteId)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/admin/clients/${customerId}`)
  return { ok: true }
}

export async function deleteNote(
  noteId: string,
  customerId: string,
): Promise<Result> {
  // Soft delete
  const { error } = await adminClient
    .from('customer_notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', noteId)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/admin/clients/${customerId}`)
  return { ok: true }
}

/* ───────────────────────────────────────────────────────────────
 * Tags — catalog + assignments
 * ─────────────────────────────────────────────────────────────── */

export async function createTag(
  label: string,
  color: CustomerTagColor = 'gold',
): Promise<Result<{ id: string }>> {
  const trimmed = label.trim()
  if (!trimmed) return { ok: false, error: 'Tag label cannot be empty' }
  if (trimmed.length > 40) return { ok: false, error: 'Tag label is too long (40 max)' }

  const { data, error } = await adminClient
    .from('customer_tags')
    .insert({ label: trimmed, color })
    .select('id')
    .single()

  if (error) {
    // Unique constraint violation = tag already exists
    if (error.code === '23505') {
      const existing = await adminClient
        .from('customer_tags')
        .select('id')
        .eq('label', trimmed)
        .maybeSingle()
      if (existing.data) {
        return { ok: true, data: { id: existing.data.id } }
      }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin/clients')
  return { ok: true, data: { id: data.id } }
}

export async function assignTag(
  customerId: string,
  tagId: string,
): Promise<Result> {
  const { error } = await adminClient
    .from('customer_tag_assignments')
    .upsert(
      { customer_id: customerId, tag_id: tagId },
      { onConflict: 'customer_id,tag_id', ignoreDuplicates: true },
    )

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/clients')
  revalidatePath(`/admin/clients/${customerId}`)
  return { ok: true }
}

export async function removeTag(
  customerId: string,
  tagId: string,
): Promise<Result> {
  const { error } = await adminClient
    .from('customer_tag_assignments')
    .delete()
    .eq('customer_id', customerId)
    .eq('tag_id', tagId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/clients')
  revalidatePath(`/admin/clients/${customerId}`)
  return { ok: true }
}

/* ───────────────────────────────────────────────────────────────
 * Customer — create + search + link to reservation
 * ─────────────────────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface CreateCustomerInput {
  email: string
  firstName: string
  lastName: string
  phone?: string
  country?: string
  city?: string
  zipCode?: string
  acceptMarketing?: boolean
  acquisitionSource?:
    | 'direct'
    | 'airbnb'
    | 'booking'
    | 'vrbo'
    | 'referral'
    | 'manual'
    | 'imported'
}

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<Result<{ id: string; isNew: boolean }>> {
  const email = input.email.trim().toLowerCase()
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()

  if (!email) return { ok: false, error: 'Email is required' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Email is invalid' }
  if (!firstName) return { ok: false, error: 'First name is required' }
  if (!lastName) return { ok: false, error: 'Last name is required' }

  // Check existing (case-insensitive)
  const { data: existing } = await adminClient
    .from('customers')
    .select('id')
    .ilike('email', email)
    .maybeSingle()

  if (existing) {
    return { ok: true, data: { id: existing.id, isNew: false } }
  }

  const { data, error } = await adminClient
    .from('customers')
    .insert({
      email,
      first_name: firstName,
      last_name: lastName,
      phone: input.phone?.trim() || null,
      country: input.country?.trim() || null,
      city: input.city?.trim() || null,
      zip_code: input.zipCode?.trim() || null,
      accept_marketing: !!input.acceptMarketing,
      marketing_consent_at: input.acceptMarketing ? new Date().toISOString() : null,
      acquisition_source: input.acquisitionSource ?? 'manual',
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/clients')
  return { ok: true, data: { id: data.id, isNew: true } }
}

export interface CustomerSearchResult {
  id: string
  first_name: string
  last_name: string
  email: string
  anonymized_at: string | null
}

export async function searchCustomers(
  query: string,
  limit = 10,
): Promise<Result<CustomerSearchResult[]>> {
  const needle = query.trim()
  if (!needle) return { ok: true, data: [] }

  const { data, error } = await adminClient
    .from('customers')
    .select('id, first_name, last_name, email, anonymized_at')
    .is('anonymized_at', null)
    .or(
      `first_name.ilike.%${needle}%,last_name.ilike.%${needle}%,email.ilike.%${needle}%`,
    )
    .order('last_name', { ascending: true })
    .limit(limit)

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: (data ?? []) as CustomerSearchResult[] }
}

export async function linkReservationToCustomer(
  reservationId: string,
  customerId: string,
): Promise<Result> {
  // Verify customer exists and isn't anonymized
  const { data: customer, error: cErr } = await adminClient
    .from('customers')
    .select('id, anonymized_at')
    .eq('id', customerId)
    .maybeSingle()
  if (cErr) return { ok: false, error: cErr.message }
  if (!customer) return { ok: false, error: 'Customer not found' }
  if (customer.anonymized_at) {
    return { ok: false, error: 'Cannot link to an anonymized customer' }
  }

  const { error } = await adminClient
    .from('reservations')
    .update({ customer_id: customerId })
    .eq('id', reservationId)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/admin/reservations/${reservationId}`)
  revalidatePath(`/admin/clients/${customerId}`)
  revalidatePath('/admin/clients')
  return { ok: true }
}

/* ───────────────────────────────────────────────────────────────
 * Custom email — Resend + log
 * ─────────────────────────────────────────────────────────────── */

export async function sendCustomerEmail(
  customerId: string,
  subject: string,
  body: string,
): Promise<Result> {
  const trimmedSubject = subject.trim()
  const trimmedBody = body.trim()
  if (!trimmedSubject) return { ok: false, error: 'Subject is required' }
  if (!trimmedBody) return { ok: false, error: 'Body is required' }
  if (trimmedSubject.length > 200) return { ok: false, error: 'Subject too long (200 max)' }
  if (trimmedBody.length > 10_000) return { ok: false, error: 'Body too long (10 000 max)' }

  // Fetch customer to get email + check not anonymized
  const { data: customer, error: cErr } = await adminClient
    .from('customers')
    .select('id, email, anonymized_at')
    .eq('id', customerId)
    .maybeSingle()
  if (cErr) return { ok: false, error: cErr.message }
  if (!customer) return { ok: false, error: 'Customer not found' }
  if (customer.anonymized_at) return { ok: false, error: 'Cannot email anonymized customer' }

  const result = await sendCustomCustomerEmail({
    to: customer.email,
    subject: trimmedSubject,
    bodyText: trimmedBody,
  })

  // Log the attempt regardless of result so the admin sees failures
  await adminClient.from('email_logs').insert({
    customer_id: customer.id,
    email_type: 'admin_custom',
    recipient_email: customer.email,
    status: result.ok ? 'sent' : 'failed',
    resend_message_id: result.ok ? result.id : null,
    error_message: result.ok
      ? null
      : result.reason === 'not_configured'
        ? 'Resend not configured (RESEND_API_KEY missing)'
        : result.message ?? 'Send failed',
  })

  revalidatePath(`/admin/clients/${customerId}`)

  if (!result.ok) {
    return {
      ok: false,
      error:
        result.reason === 'not_configured'
          ? 'Email service is not configured. Add RESEND_API_KEY to enable sending.'
          : result.message ?? 'Failed to send email',
    }
  }
  return { ok: true }
}

/* ───────────────────────────────────────────────────────────────
 * Anonymization — GDPR right-to-be-forgotten
 * ─────────────────────────────────────────────────────────────── */

const ANONYMIZE_TOKEN = 'ANONYMIZE'

export async function anonymizeCustomer(
  customerId: string,
  confirmation: string,
): Promise<Result> {
  if (confirmation !== ANONYMIZE_TOKEN) {
    return { ok: false, error: `Type "${ANONYMIZE_TOKEN}" exactly to confirm` }
  }

  const { data: existing, error: fetchErr } = await adminClient
    .from('customers')
    .select('id, anonymized_at')
    .eq('id', customerId)
    .maybeSingle()
  if (fetchErr) return { ok: false, error: fetchErr.message }
  if (!existing) return { ok: false, error: 'Customer not found' }
  if (existing.anonymized_at) {
    return { ok: false, error: 'Customer already anonymized' }
  }

  const fakeEmail = `anonymized-${randomUUID()}@deleted.local`
  const now = new Date().toISOString()

  // 1. Wipe PII on customer record
  const { error: updErr } = await adminClient
    .from('customers')
    .update({
      first_name: '[Anonymized]',
      last_name: '',
      email: fakeEmail,
      phone: null,
      country: null,
      city: null,
      zip_code: null,
      dietary_notes: null,
      preferred_language: null,
      accept_marketing: false,
      marketing_consent_at: null,
      anonymized_at: now,
    })
    .eq('id', customerId)
  if (updErr) return { ok: false, error: updErr.message }

  // 2. Hard-delete private notes (PII risk)
  await adminClient.from('customer_notes').delete().eq('customer_id', customerId)

  // 3. Remove tag assignments (implicit PII via segment membership)
  await adminClient
    .from('customer_tag_assignments')
    .delete()
    .eq('customer_id', customerId)

  // Reservations are intentionally preserved (financial / accounting record).

  revalidatePath('/admin/clients')
  revalidatePath(`/admin/clients/${customerId}`)
  return { ok: true }
}
