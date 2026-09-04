'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/Button'
import type { NewsletterCampaign, NewsletterSubscriber } from '@/lib/supabase/types'
import { formatInstant } from '@/lib/format/date'

import { removeSubscriber, sendNewsletter, sendNewsletterTest } from './actions'

type Props = {
  subscribers: NewsletterSubscriber[]
  campaigns: NewsletterCampaign[]
  tableMissing: boolean
}

export function NewsletterClient({ subscribers, campaigns, tableMissing }: Props) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  // Sending to the whole list is not undoable, so the button asks twice.
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  const active = subscribers.filter((s) => s.status === 'subscribed')
  const gone = subscribers.filter((s) => s.status !== 'subscribed')

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
      const r = await sendNewsletter(subject, body)
      if (r.ok) {
        setNotice({
          tone: r.delivered === r.attempted ? 'ok' : 'error',
          text:
            r.delivered === r.attempted
              ? `Envoyée à ${r.delivered} abonné(s).`
              : `Envoyée à ${r.delivered} abonné(s) sur ${r.attempted}. Vérifie le journal Resend pour les échecs.`,
        })
        setSubject('')
        setBody('')
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
      {/* Compose */}
      <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-semibold text-midnight">
          Rédiger une newsletter
        </h2>
        <p className="mt-1 font-sans text-sm text-midnight-400">
          Mise en forme légère : <code>#&nbsp;Titre</code> pour un titre,{' '}
          <code>**gras**</code>, <code>[texte](https://lien)</code>, et une ligne
          commençant par <code>-</code> pour une puce. Une ligne vide sépare deux
          paragraphes.
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
              rows={14}
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
          <Button variant="outline" size="sm" onClick={runTest} disabled={isPending}>
            {isPending ? 'Envoi…' : 'M’envoyer un test'}
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
          <span className="font-sans text-xs text-midnight-400">
            Un envoi ne se rattrape pas. Fais toujours un test d’abord.
          </span>
        </div>
      </div>

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

      {/* History */}
      {campaigns.length > 0 ? (
        <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-base font-semibold text-midnight">
            Newsletters envoyées
          </h2>
          <ul className="mt-4 space-y-3">
            {campaigns.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-pearl-400 pb-3 last:border-0 last:pb-0"
              >
                <span className="font-sans text-sm font-medium text-midnight">
                  {c.subject}
                </span>
                <span className="font-sans text-xs text-midnight-400">
                  {c.sent_at ? formatInstant(c.sent_at) : 'brouillon'} ·{' '}
                  {c.delivered_count}/{c.recipients_count} remis
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
