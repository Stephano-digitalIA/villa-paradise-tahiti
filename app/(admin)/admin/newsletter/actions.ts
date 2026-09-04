'use server'

import { revalidatePath } from 'next/cache'

import { liveAdminClient } from '@/lib/supabase/admin'
import { FROM_EMAIL, OWNER_EMAIL, isResendConfigured, resend } from '@/lib/resend'
import {
  buildNewsletterEmailHtml,
  renderNewsletterText,
  unsubscribeUrl,
} from '@/lib/newsletter'

export interface SendResult {
  ok: boolean
  error?: string
  attempted?: number
  delivered?: number
}

export interface DraftResult {
  ok: boolean
  error?: string
  /** The row this draft now lives in, so the composer can keep updating it. */
  id?: string
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
      // The same builder the admin preview uses, so what was approved is what
      // leaves. Two renderers would drift apart on the first change to either.
      html: buildNewsletterEmailHtml(subject, body, unsubUrl),
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
 * Save the composer as a draft, or update the draft already open.
 *
 * A draft is a campaign row with `sent_at` still null. Same table as the sent
 * ones on purpose: the operator writes, saves, comes back, sends, and the row
 * keeps its identity throughout rather than being copied from one place to
 * another.
 */
export async function saveNewsletterDraft(
  id: string | null,
  subject: string,
  body: string,
): Promise<DraftResult> {
  if (!subject.trim() && !body.trim()) {
    return { ok: false, error: 'Rien à enregistrer : le brouillon est vide.' }
  }

  if (id) {
    // Guard on `sent_at`: a sent newsletter is a record of what went out and
    // must never be rewritten by a later edit.
    const { data, error } = await liveAdminClient
      .from('newsletter_campaigns')
      .update({ subject: subject.trim(), body: body.trim() })
      .eq('id', id)
      .is('sent_at', null)
      .select('id')
      .maybeSingle()
    if (error) return { ok: false, error: error.message }
    if (!data) {
      return {
        ok: false,
        error: 'Ce brouillon a déjà été envoyé : il ne peut plus être modifié.',
      }
    }
    revalidatePath('/admin/newsletter')
    return { ok: true, id }
  }

  const { data, error } = await liveAdminClient
    .from('newsletter_campaigns')
    // Explicit zeros: a draft has gone to nobody, and saying so beats relying
    // on the column defaults to fill in what the type demands.
    .insert({
      subject: subject.trim(),
      body: body.trim(),
      recipients_count: 0,
      delivered_count: 0,
    })
    .select('id')
    .maybeSingle()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/newsletter')
  return { ok: true, id: data?.id }
}

/** Discard a draft. Refuses to touch anything already sent. */
export async function deleteNewsletterDraft(id: string): Promise<DraftResult> {
  const { error } = await liveAdminClient
    .from('newsletter_campaigns')
    .delete()
    .eq('id', id)
    .is('sent_at', null)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/newsletter')
  return { ok: true }
}

/**
 * Send the draft to the owner only, to see it in a real inbox.
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
 *
 * When a draft is open, that row becomes the sent one. The text is therefore
 * kept exactly as it went out, which is what makes the archive trustworthy.
 */
export async function sendNewsletter(
  draftId: string | null,
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
  if (list.length === 0) return { ok: false, error: 'Aucun abonné pour le moment.' }

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

  const record = {
    subject: subject.trim(),
    body: body.trim(),
    recipients_count: list.length,
    delivered_count: delivered,
    sent_at: new Date().toISOString(),
    sent_by: OWNER_EMAIL,
  }

  if (draftId) {
    await liveAdminClient
      .from('newsletter_campaigns')
      .update(record)
      .eq('id', draftId)
      .is('sent_at', null)
  } else {
    await liveAdminClient.from('newsletter_campaigns').insert(record)
  }

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
