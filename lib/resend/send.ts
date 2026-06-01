/**
 * Resend send helpers — Villa Paradise Tahiti (Phase E1).
 *
 * Thin, strongly-typed wrappers around `resend.emails.send` that:
 *   - render a React Email template,
 *   - short-circuit cleanly in mock mode (no `RESEND_API_KEY` set),
 *   - never throw — always return an `EmailResult` discriminator.
 *
 * Phase E2 will import these from `@/lib/resend` and call them inside
 * the payment-confirmation webhook handler. Do not add side effects
 * here beyond logging and the SDK call — this file is meant to be
 * trivially mockable in tests.
 */

import * as React from 'react'

import { FROM_EMAIL, OWNER_EMAIL, SITE_URL, isResendConfigured, resend } from './client'
import { BookingConfirmationGuest } from './templates/BookingConfirmationGuest'
import { BookingNotificationOwner } from './templates/BookingNotificationOwner'
import { ContactAutoReply } from './templates/ContactAutoReply'
import { ContactInquiryNotification } from './templates/ContactInquiryNotification'
import type {
  BookingConfirmationData,
  ContactInquiryData,
  EmailResult,
} from './types'

/* ---------------------------------------------------------------------------
 * Internal — uniform send wrapper
 * ------------------------------------------------------------------------- */

interface SendArgs {
  to: string | string[]
  subject: string
  react: React.ReactElement
  replyTo?: string
  /** Tag used to label the log line — also passed to Resend `tags` for
   *  filterable inbox dashboards. */
  tag: string
}

/**
 * Single point through which all outbound mail flows. Handles:
 *   - mock-mode short-circuit (no SDK configured),
 *   - structured logging (one line per attempt, success or fail),
 *   - error normalisation (never throw, always `EmailResult`).
 */
async function sendEmail({
  to,
  subject,
  react,
  replyTo,
  tag,
}: SendArgs): Promise<EmailResult> {
  if (!isResendConfigured() || resend === null) {
    // eslint-disable-next-line no-console
    console.info('[resend:mock]', {
      tag,
      to,
      subject,
      note: 'RESEND_API_KEY not set — email not sent',
    })
    return { ok: false, reason: 'not_configured' }
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react,
      replyTo,
      tags: [{ name: 'category', value: tag }],
    })

    if (result.error) {
      // eslint-disable-next-line no-console
      console.error('[resend:error]', { tag, to, subject, error: result.error })
      return {
        ok: false,
        reason: 'send_failed',
        message: result.error.message,
      }
    }

    const id = result.data?.id ?? ''
    // eslint-disable-next-line no-console
    console.info('[resend:sent]', { tag, to, subject, id })
    return { ok: true, id }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[resend:exception]', { tag, to, subject, err })
    return {
      ok: false,
      reason: 'send_failed',
      message: err instanceof Error ? err.message : String(err),
    }
  }
}

/* ---------------------------------------------------------------------------
 * Public send functions
 * ------------------------------------------------------------------------- */

/**
 * Guest-facing confirmation, dispatched after a successful payment.
 *
 * @example
 *   await sendBookingConfirmationGuest({
 *     reservationId: 'VPT-LRC9X4P-K3D5W',
 *     customer: { firstName, lastName, email },
 *     booking: { checkIn, checkOut, guests, nights },
 *     breakdown: { villaSubtotal, experiencesTotal, cleaningFee,
 *                  total, depositAmount, balanceAmount },
 *     selectedExperiences: [{ title, quantity }],
 *   })
 */
export async function sendBookingConfirmationGuest(
  data: BookingConfirmationData,
): Promise<EmailResult> {
  return sendEmail({
    to: data.customer.email,
    subject: `Your Villa Paradise Tahiti reservation — ${data.reservationId}`,
    react: React.createElement(BookingConfirmationGuest, {
      data,
      siteUrl: SITE_URL,
    }),
    replyTo: OWNER_EMAIL,
    tag: 'booking-confirmation-guest',
  })
}

/**
 * Owner-facing notification, dispatched after a successful payment.
 * Always carries the payment method so Thierry can spot Stripe vs PayPal
 * at a glance in his inbox.
 */
export async function sendBookingNotificationOwner(
  data: BookingConfirmationData & { paymentMethod: 'stripe' | 'paypal' },
): Promise<EmailResult> {
  const { paymentMethod, ...rest } = data
  return sendEmail({
    to: OWNER_EMAIL,
    subject: `New booking ${rest.reservationId} — ${rest.customer.firstName} ${rest.customer.lastName}`,
    react: React.createElement(BookingNotificationOwner, {
      data: rest,
      paymentMethod,
      siteUrl: SITE_URL,
    }),
    replyTo: rest.customer.email,
    tag: 'booking-notification-owner',
  })
}

/**
 * Owner-facing notification, dispatched after a contact form submission.
 */
export async function sendContactInquiryNotification(
  data: ContactInquiryData,
): Promise<EmailResult> {
  return sendEmail({
    to: OWNER_EMAIL,
    subject: `New inquiry — ${data.firstName} ${data.lastName}`.trim(),
    react: React.createElement(ContactInquiryNotification, { data }),
    replyTo: data.email,
    tag: 'contact-inquiry-notification',
  })
}

/**
 * Custom one-off email from the admin CRM to a customer.
 *
 * Sends a plain-text body wrapped in a minimal HTML shell preserving line
 * breaks. Subject/body are admin-authored so we don't render a React
 * template here. Reply-to defaults to the owner inbox so guests can reply
 * directly to Thierry.
 */
export async function sendCustomCustomerEmail({
  to,
  subject,
  bodyText,
  replyTo = OWNER_EMAIL,
}: {
  to: string
  subject: string
  bodyText: string
  replyTo?: string
}): Promise<EmailResult> {
  const safeHtml = wrapBodyAsHtml(bodyText)

  if (!isResendConfigured() || resend === null) {
    // eslint-disable-next-line no-console
    console.info('[resend:mock]', {
      tag: 'admin-custom-email',
      to,
      subject,
      note: 'RESEND_API_KEY not set — email not sent',
    })
    return { ok: false, reason: 'not_configured' }
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: safeHtml,
      text: bodyText,
      replyTo,
      tags: [{ name: 'category', value: 'admin-custom-email' }],
    })

    if (result.error) {
      // eslint-disable-next-line no-console
      console.error('[resend:error]', { tag: 'admin-custom-email', to, subject, error: result.error })
      return { ok: false, reason: 'send_failed', message: result.error.message }
    }

    const id = result.data?.id ?? ''
    // eslint-disable-next-line no-console
    console.info('[resend:sent]', { tag: 'admin-custom-email', to, subject, id })
    return { ok: true, id }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[resend:exception]', { tag: 'admin-custom-email', to, subject, err })
    return {
      ok: false,
      reason: 'send_failed',
      message: err instanceof Error ? err.message : String(err),
    }
  }
}

function wrapBodyAsHtml(bodyText: string): string {
  const escaped = bodyText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const paragraphs = escaped
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px 0;color:#1a1a1a;line-height:1.6">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('')
  return `<!DOCTYPE html><html><body style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f8f4ee;padding:24px;margin:0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;padding:32px;max-width:100%">
          <tr><td>
            <p style="margin:0 0 24px 0;font-family:Georgia,serif;font-style:italic;color:#c49a3f;font-size:18px">Villa Paradise Tahiti</p>
            ${paragraphs}
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`
}

/**
 * Visitor-facing auto-reply, dispatched after a contact form submission.
 */
export async function sendContactAutoReply(
  data: Pick<ContactInquiryData, 'firstName' | 'email'>,
): Promise<EmailResult> {
  return sendEmail({
    to: data.email,
    subject: 'We have received your inquiry — Villa Paradise Tahiti',
    react: React.createElement(ContactAutoReply, {
      firstName: data.firstName,
      siteUrl: SITE_URL,
    }),
    replyTo: OWNER_EMAIL,
    tag: 'contact-autoreply',
  })
}
