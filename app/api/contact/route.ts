/**
 * POST /api/contact — Phase E1.
 *
 * Receives the validated contact-form payload from
 * `components/sections/contact/ContactForm.tsx`, re-validates with the
 * exact same Zod schema (single source of truth lives in the section
 * module), and dispatches two emails via Resend:
 *
 *   1. Inquiry notification → owner inbox (Thierry).
 *   2. Auto-reply           → visitor.
 *
 * Both sends run in parallel and we use `Promise.allSettled` so that one
 * failing channel (e.g. the auto-reply bouncing) never prevents the
 * other from going through. The endpoint always returns `200 ok: true`
 * once the payload validates — the visitor's confirmation page does not
 * need to know whether the auto-reply landed.
 *
 * Mock mode:
 *   When `RESEND_API_KEY` is missing, the send helpers short-circuit and
 *   log the attempt — the endpoint still answers `200 ok: true` so that
 *   local dev / preview builds behave realistically.
 */

import { NextResponse } from 'next/server'

import { contactFormSchema } from '@/components/sections/contact/contact-schema'
import {
  sendContactAutoReply,
  sendContactInquiryNotification,
  type ContactInquiryData,
} from '@/lib/resend'
import { adminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

/**
 * Split a `fullName` into `(firstName, lastName)` for the email payload.
 * Conservative: first whitespace-separated token is the first name, the
 * rest is the last name. Empty last name is tolerated.
 */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim().replace(/\s+/g, ' ')
  if (!trimmed) return { firstName: '', lastName: '' }
  const firstSpace = trimmed.indexOf(' ')
  if (firstSpace === -1) return { firstName: trimmed, lastName: '' }
  return {
    firstName: trimmed.slice(0, firstSpace),
    lastName: trimmed.slice(firstSpace + 1),
  }
}

/**
 * Parse an optional numeric guest count out of the form's string field.
 * Returns `undefined` for empty / non-numeric values.
 */
function parseGuests(raw: string | undefined): number | undefined {
  if (!raw) return undefined
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) return undefined
  return Math.trunc(value)
}

/**
 * Normalise an optional string — collapses empty strings to `undefined`
 * so the email templates can render the "(optional)" rows conditionally.
 */
function optionalString(raw: string | undefined): string | undefined {
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body.' },
      { status: 400 },
    )
  }

  const parsed = contactFormSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, issues: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const data = parsed.data
  const { firstName, lastName } = splitName(data.fullName)

  // Persist FIRST — before the (potentially slow) email sends. On Netlify the
  // function can time out around 10s; if the emails run first and stall (e.g.
  // Resend retrying while the sending domain isn't verified yet), the insert
  // never runs and the inquiry is lost. Persisting first makes it durable.
  //
  // `|| null` (not `?? null`): the schema defaults empty optional fields to `''`,
  // and inserting an empty string into the `date` columns (check_in/check_out)
  // errors — coerce blanks to null so the insert always succeeds.
  try {
    const { error: insertError } = await adminClient.from('contact_inquiries').insert({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      check_in: data.checkIn || null,
      check_out: data.checkOut || null,
      guests: data.guests ? Number(data.guests) : null,
      message: data.message,
      replied: false,
    })
    if (insertError) {
      // eslint-disable-next-line no-console
      console.error('[api/contact] persist failed:', insertError.message)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api/contact] persist threw:', err)
  }

  const inquiry: ContactInquiryData = {
    firstName,
    lastName,
    email: data.email,
    phone: optionalString(data.phone),
    travelDateFrom: optionalString(data.checkIn),
    travelDateTo: optionalString(data.checkOut),
    guests: parseGuests(data.guests),
    message: data.message,
  }

  // Then fire both emails in parallel. Best effort — never let one failure
  // surface as an error to the visitor.
  const [ownerResult, autoReplyResult] = await Promise.allSettled([
    sendContactInquiryNotification(inquiry),
    sendContactAutoReply({ firstName, email: data.email }),
  ])

  // eslint-disable-next-line no-console
  console.info('[api/contact] processed', {
    email: data.email,
    owner: ownerResult.status,
    autoReply: autoReplyResult.status,
  })

  return NextResponse.json({
    ok: true,
    owner: ownerResult.status === 'fulfilled' ? ownerResult.value : { ok: false, reason: 'rejected' },
    autoReply:
      autoReplyResult.status === 'fulfilled'
        ? autoReplyResult.value
        : { ok: false, reason: 'rejected' },
  })
}
