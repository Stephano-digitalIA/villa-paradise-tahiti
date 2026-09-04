'use server'

import { revalidatePath } from 'next/cache'

import { liveAdminClient } from '@/lib/supabase/admin'
import { FROM_EMAIL, OWNER_EMAIL, isResendConfigured, resend } from '@/lib/resend'
import {
  renderNewsletterHtml,
  renderNewsletterText,
  unsubscribeUrl,
} from '@/lib/newsletter'

export interface SendResult {
  ok: boolean
  error?: string
  attempted?: number
  delivered?: number
}

/**
 * Wrap the operator's body in the villa's email shell.
 *
 * Every recipient gets their own unsubscribe link, which is why the newsletter
 * is sent one message per person rather than as a single email with everyone
 * in copy. Sending it in copy would also expose the whole list to every
 * subscriber.
 */
function buildHtml(subject: string, body: string, unsubUrl: string): string {
  return `<!doctype html><html><body style="margin:0;background:#FAFAF8;padding:24px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid #E3E5E1;border-radius:14px;padding:32px;font-family:Helvetica,Arial,sans-serif;color:#1A2A3A;font-size:15px">
<tr><td>
<p style="margin:0 0 4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#A88B3D">Villa Paradise Tahiti</p>
<h1 style="margin:0 0 22px;font-size:24px;font-weight:600;color:#1A2A3A">${subject
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')}</h1>
${renderNewsletterHtml(body)}
<hr style="border:0;border-top:1px solid #E3E5E1;margin:28px 0 14px">
<p style="margin:0;font-size:12px;color:#8A949E">
You are receiving this because you subscribed to The Slow Letter.
<a href="${unsubUrl}" style="color:#8A949E">Unsubscribe in one click</a>.
</p>
</td></tr></table>
</td></tr></table>
</body></html>`
}

/** One send. Returns false on any failure so the caller can count. */
async function sendOne(
  to: string,
  subject: string,
  body: string,
  token: string,
): Promise<boolean> {
  if (!isResendConfigured() || resend === null) return false
  const unsubUrl = unsubscribeUrl(token)
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: buildHtml(subject, body, unsubUrl),
      text: renderNewsletterText(body, unsubUrl),
      // Lets Gmail and Outlook show their own unsubscribe control, which keeps
      // people from reporting the newsletter as spam just to make it stop.
      headers: {
        'List-Unsubscribe': `<${unsubUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
    return !error
  } catch {
    return false
  }
}

/**
 * Send the draft to the owner only, to see what it looks like in a real inbox.
 * Writes no campaign row: a test is not a send.
 */
export async function sendNewsletterTest(
  subject: string,
  body: string,
): Promise<SendResult> {
  if (!subject.trim() || !body.trim()) {
    return { ok: false, error: 'Ajoute un objet et un texte avant d’envoyer un test.' }
  }
  if (!isResendConfigured()) {
    return { ok: false, error: 'Resend n’est pas configuré : aucun email ne peut partir.' }
  }
  const ok = await sendOne(OWNER_EMAIL, `[Test] ${subject}`, body, 'test-token')
  return ok
    ? { ok: true, attempted: 1, delivered: 1 }
    : { ok: false, error: 'L’envoi du test a échoué. Vérifie le journal Resend.' }
}

/**
 * Send to every subscribed address.
 *
 * Sequential in small batches rather than all at once: Resend rate-limits, and
 * a burst that trips the limit would fail silently for part of the list. The
 * campaign row records what was attempted and what got through, so a partial
 * send is visible instead of being mistaken for a full one.
 */
export async function sendNewsletter(
  subject: string,
  body: string,
): Promise<SendResult> {
  if (!subject.trim() || !body.trim()) {
    return { ok: false, error: 'Ajoute un objet et un texte avant d’envoyer.' }
  }
  if (!isResendConfigured()) {
    return { ok: false, error: 'Resend n’est pas configuré : aucun email ne peut partir.' }
  }

  const { data, error } = await liveAdminClient
    .from('newsletter_subscribers')
    .select('email, unsubscribe_token')
    .eq('status', 'subscribed')

  if (error) return { ok: false, error: error.message }

  const list = (data ?? []) as Array<{ email: string; unsubscribe_token: string }>
  if (list.length === 0) {
    return { ok: false, error: 'Aucun abonné pour le moment.' }
  }

  let delivered = 0
  const BATCH = 10
  for (let i = 0; i < list.length; i += BATCH) {
    const results = await Promise.all(
      list
        .slice(i, i + BATCH)
        .map((s) => sendOne(s.email, subject, body, s.unsubscribe_token)),
    )
    delivered += results.filter(Boolean).length
  }

  await liveAdminClient.from('newsletter_campaigns').insert({
    subject: subject.trim(),
    body: body.trim(),
    recipients_count: list.length,
    delivered_count: delivered,
    sent_at: new Date().toISOString(),
    sent_by: OWNER_EMAIL,
  })

  revalidatePath('/admin/newsletter')
  return { ok: true, attempted: list.length, delivered }
}

/** Remove an address by hand, for a request made outside the one-click link. */
export async function removeSubscriber(id: string): Promise<{ error?: string }> {
  const { error } = await liveAdminClient
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/newsletter')
  return {}
}
