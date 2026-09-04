'use client'

import { useMemo, useState, useTransition } from 'react'

import { Button } from '@/components/ui/Button'
import type { NewsletterCampaign, NewsletterSubscriber } from '@/lib/supabase/types'
import { formatInstant } from '@/lib/format/date'
import { buildNewsletterEmailHtml } from '@/lib/newsletter/render'

import {
  deleteNewsletterDraft,
  removeSubscriber,
  saveNewsletterDraft,
  sendNewsletter,
  sendNewsletterTest,
} from './actions'

type Props = {
  subscribers: NewsletterSubscriber[]
  drafts: NewsletterCampaign[]
  sent: NewsletterCampaign[]
  /** Shown in the preview footer. Not a real token, previewing mints nothing. */
  previewUnsubscribeUrl: string
  tableMissing: boolean
}

export function NewsletterClient({
  subscribers,
  drafts,
  sent,
  previewUnsubscribeUrl,
  tableMissing,
}: Props) {
  const [draftId, setDraftId] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  // A sent newsletter opened for reading. Read-only: the archive is a record.
  const [reading, setReading] = useState<NewsletterCampaign | null>(null)

  const active = subscribers.filter((s) => s.status === 'subscribed')
  const gone = subscribers.filter((s) => s.status !== 'subscribed')

  // The preview is the real email, built by the same function the send uses.
  const previewHtml = useMemo(
    () =>
      buildNewsletterEmailHtml(
        reading ? reading.subject : subject || 'Objet de la newsletter',
        reading ? reading.body : body || '_Le texte apparaîtra ici._',
        previewUnsubscribeUrl,
      ),
    [reading, subject, body, previewUnsubscribeUrl],
  )

  function loadDraft(c: NewsletterCampaign) {
    setReading(null)
    setDraftId(c.id)
    setSubject(c.subject)
    setBody(c.body)
    setNotice(null)
    setConfirming(false)
  }

  function reuseSent(c: NewsletterCampaign) {
    // Deliberately not bound to the sent row: editing must never rewrite a
    // record of what actually went out. This starts a fresh draft.
    setReading(null)
    setDraftId(null)
    setSubject(c.subject)
    setBody(c.body)
    setNotice({ tone: 'ok', text: 'Copiée dans un nouveau brouillon. L’envoi d’origine est intact.' })
    setConfirming(false)
  }

  function newDraft() {
    setReading(null)
    setDraftId(null)
    setSubject('')
    setBody('')
    setNotice(null)
    setConfirming(false)
  }

  function save() {
    setNotice(null)
    startTransition(async () => {
      const r = await saveNewsletterDraft(draftId, subject, body)
      if (r.ok) {
        if (r.id) setDraftId(r.id)
        setNotice({ tone: 'ok', text: 'Brouillon enregistré.' })
      } else {
        setNotice({ tone: 'error', text: r.error ?? 'Échec de l’enregistrement.' })
      }
    })
  }

  function discard(id: string) {
    startTransition(async () => {
      await deleteNewsletterDraft(id)
      if (draftId === id) newDraft()
    })
  }

  function runTest() {
    setNotice(null)
    startTransition(async () => {
      const r = await sendNewsletterTest(subject, body)
      setNotice(
        r.ok
          ? { tone: 'ok', text: 'Test envoyé à ton adresse. Regarde ta boîte.' }
          : { tone: 'error', text: r.error ?? 'Échec du test.' },
      )
    })
  }

  function runSend() {
    setNotice(null)
    setConfirming(false)
    startTransition(async () => {
      const r = await sendNewsletter(draftId, subject, body)
      if (r.ok) {
        setNotice({
          tone: r.delivered === r.attempted ? 'ok' : 'error',
          text:
            r.delivered === r.attempted
              ? `Envoyée à ${r.delivered} abonné(s). Elle est archivée ci-dessous.`
              : `Envoyée à ${r.delivered} abonné(s) sur ${r.attempted}. Vérifie le journal Resend pour les échecs.`,
        })
        newDraft()
      } else {
        setNotice({ tone: 'error', text: r.error ?? 'Échec de l’envoi.' })
      }
    })
  }

  if (tableMissing) {
    return (
      <div className="rounded-2xl border border-coral/30 bg-coral/5 p-6">
        <h2 className="font-heading text-base font-semibold text-coral">
          Migration à appliquer
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm text-midnight-400">
          Les tables de la newsletter n’existent pas encore dans la base. Ouvre
          l’éditeur SQL de Supabase et exécute le contenu de
          <code className="mx-1 rounded bg-pearl px-1.5 py-0.5 text-xs">
            supabase/migrations/016_newsletter.sql
          </code>
          puis recharge cette page. Tant que ce n’est pas fait, le formulaire du blog
          ne peut enregistrer aucune adresse.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Compose + preview, side by side on a wide screen */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-heading text-base font-semibold text-midnight">
              {reading
                ? 'Newsletter envoyée'
                : draftId
                  ? 'Brouillon en cours'
                  : 'Nouvelle newsletter'}
            </h2>
            {draftId || reading || subject || body ? (
              <button
                type="button"
                onClick={newDraft}
                className="font-sans text-xs text-midnight-400 underline underline-offset-2"
              >
                Repartir de zéro
              </button>
            ) : null}
          </div>

          {reading ? (
            <div className="mt-4 rounded-xl border border-pearl-400 bg-pearl/60 p-4">
              <p className="font-sans text-sm font-medium text-midnight">{reading.subject}</p>
              <p className="mt-1 font-sans text-xs text-midnight-400">
                Envoyée le {reading.sent_at ? formatInstant(reading.sent_at) : 'date inconnue'} ·{' '}
                {reading.delivered_count}/{reading.recipients_count} remis
              </p>
              <p className="mt-3 font-sans text-xs text-midnight-400">
                Une newsletter envoyée ne se modifie plus : c’est la trace de ce qui est
                réellement parti. Tu peux la reprendre comme point de départ.
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => reuseSent(reading)}>
                  Reprendre comme nouveau brouillon
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setReading(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-1 font-sans text-sm text-midnight-400">
                Mise en forme légère : <code>#&nbsp;Titre</code>, <code>**gras**</code>,{' '}
                <code>[texte](https://lien)</code>, et <code>-</code> en début de ligne pour
                une puce. Une ligne vide sépare deux paragraphes.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="nl-subject"
                    className="mb-1.5 block font-sans text-sm font-medium text-midnight"
                  >
                    Objet
                  </label>
                  <input
                    id="nl-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Les nouvelles de la villa, septembre"
                    className="h-12 w-full rounded-lg border border-lagoon/20 bg-pearl px-4 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>
                <div>
                  <label
                    htmlFor="nl-body"
                    className="mb-1.5 block font-sans text-sm font-medium text-midnight"
                  >
                    Texte
                  </label>
                  <textarea
                    id="nl-body"
                    rows={16}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={'# Ia ora na\n\nCe mois-ci à la villa...\n\n- Une adresse à ne pas manquer\n- Une date de dernière minute'}
                    className="w-full rounded-lg border border-lagoon/20 bg-pearl px-4 py-3 font-sans text-sm leading-relaxed text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>
              </div>

              {notice ? (
                <p
                  role="status"
                  className={`mt-4 rounded-xl px-4 py-2.5 font-sans text-sm ${
                    notice.tone === 'ok'
                      ? 'border border-leaf/30 bg-leaf/5 text-leaf'
                      : 'border border-coral/30 bg-coral/5 text-coral'
                  }`}
                >
                  {notice.text}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={save} disabled={isPending}>
                  {isPending ? 'Enregistrement…' : 'Enregistrer le brouillon'}
                </Button>
                <Button variant="outline" size="sm" onClick={runTest} disabled={isPending}>
                  M’envoyer un test
                </Button>

                {confirming ? (
                  <>
                    <Button variant="primary" size="sm" onClick={runSend} disabled={isPending}>
                      {isPending ? 'Envoi…' : `Confirmer l’envoi à ${active.length} abonné(s)`}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className="font-sans text-sm text-midnight-400 underline underline-offset-2"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setConfirming(true)}
                    disabled={isPending || active.length === 0}
                  >
                    Envoyer à tous ({active.length})
                  </Button>
                )}
              </div>
              <p className="mt-2 font-sans text-xs text-midnight-400">
                Un envoi ne se rattrape pas. Regarde l’aperçu, fais un test, puis envoie.
              </p>
            </>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-base font-semibold text-midnight">Aperçu</h2>
          <p className="mt-1 font-sans text-sm text-midnight-400">
            Le message tel qu’il arrivera. Rendu par la même fonction que l’envoi, donc ce
            que tu vois ici est exactement ce qui part.
          </p>
          <iframe
            title="Aperçu de la newsletter"
            srcDoc={previewHtml}
            sandbox=""
            className="mt-4 h-[560px] w-full rounded-xl border border-pearl-400 bg-pearl"
          />
        </div>
      </div>

      {/* Drafts */}
      {drafts.length > 0 ? (
        <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-base font-semibold text-midnight">
            Brouillons ({drafts.length})
          </h2>
          <ul className="mt-4 space-y-3">
            {drafts.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-baseline justify-between gap-3 border-b border-pearl-400 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-midnight">
                    {c.subject || 'Sans objet'}
                  </p>
                  <p className="font-sans text-xs text-midnight-400">
                    Modifié le {formatInstant(c.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => loadDraft(c)}
                    disabled={isPending}
                    className="font-sans text-xs text-lagoon underline underline-offset-2 disabled:opacity-50"
                  >
                    Ouvrir
                  </button>
                  <button
                    type="button"
                    onClick={() => discard(c.id)}
                    disabled={isPending}
                    className="font-sans text-xs text-coral underline underline-offset-2 disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Archive */}
      {sent.length > 0 ? (
        <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-base font-semibold text-midnight">
            Newsletters envoyées ({sent.length})
          </h2>
          <p className="mt-1 font-sans text-xs text-midnight-400">
            Conservées telles qu’elles sont parties. Ouvre-en une pour la relire dans
            l’aperçu.
          </p>
          <ul className="mt-4 space-y-3">
            {sent.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-baseline justify-between gap-3 border-b border-pearl-400 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-midnight">{c.subject}</p>
                  <p className="font-sans text-xs text-midnight-400">
                    {c.sent_at ? formatInstant(c.sent_at) : 'date inconnue'} ·{' '}
                    <span
                      className={
                        c.delivered_count < c.recipients_count ? 'text-coral' : undefined
                      }
                    >
                      {c.delivered_count}/{c.recipients_count} remis
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReading(c)}
                  className="font-sans text-xs text-lagoon underline underline-offset-2"
                >
                  Relire
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Subscribers */}
      <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-semibold text-midnight">
          Abonnés ({active.length})
        </h2>
        {gone.length > 0 ? (
          <p className="mt-1 font-sans text-xs text-midnight-400">
            {gone.length} désinscrit(s), conservés pour ne plus jamais les solliciter.
          </p>
        ) : null}

        {subscribers.length === 0 ? (
          <p className="mt-4 font-sans text-sm text-midnight-400">
            Personne pour l’instant. Le formulaire est en bas de la page Blog.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-pearl-400">
                  <th className="pb-2 font-sans text-xs font-semibold uppercase tracking-widest text-midnight-400">
                    Adresse
                  </th>
                  <th className="pb-2 font-sans text-xs font-semibold uppercase tracking-widest text-midnight-400">
                    Inscrit le
                  </th>
                  <th className="pb-2 font-sans text-xs font-semibold uppercase tracking-widest text-midnight-400">
                    Statut
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-pearl-400 last:border-0">
                    <td className="py-2.5 font-sans text-sm text-midnight">{s.email}</td>
                    <td className="py-2.5 font-sans text-sm text-midnight-400">
                      {formatInstant(s.created_at)}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`font-sans text-xs ${
                          s.status === 'subscribed' ? 'text-leaf' : 'text-midnight-400'
                        }`}
                      >
                        {s.status === 'subscribed' ? 'Abonné' : 'Désinscrit'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      {s.status === 'subscribed' ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              await removeSubscriber(s.id)
                            })
                          }
                          className="font-sans text-xs text-coral underline underline-offset-2 disabled:opacity-50"
                        >
                          Désinscrire
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
