'use client'

import { useMemo, useState, useTransition } from 'react'

import { Button } from '@/components/ui/Button'
import { TranslatableField } from '@/components/admin/TranslatableField'
import type { SiteContentEntry } from '@/lib/content'
import type { ContentGroup } from '@/lib/content/registry'
import { translateBatch } from '@/app/actions/translate'

import { saveSiteContent } from './actions'

interface SiteContentFormProps {
  groups: ContentGroup[]
  values: Record<string, SiteContentEntry>
  /** Published English defaults per key — pre-fills empty fields so the
   *  operator sees the existing site copy instead of blank inputs. */
  defaults?: Record<string, string>
}

type FieldState = { en: string; fr: string }

export function SiteContentForm({ groups, values, defaults = {} }: SiteContentFormProps) {
  const allKeys = useMemo(
    () => groups.flatMap((g) => g.fields.map((f) => f.key)),
    [groups],
  )

  const [state, setState] = useState<Record<string, FieldState>>(() => {
    const init: Record<string, FieldState> = {}
    for (const key of allKeys) {
      // Prefer the saved override; otherwise show the current site default so
      // the field is never blank for keys that have a default.
      const en = values[key]?.value ?? ''
      init[key] = {
        en: en !== '' ? en : (defaults[key] ?? ''),
        fr: values[key]?.value_fr ?? '',
      }
    }
    return init
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, startSaving] = useTransition()
  const [translatingAll, startTranslateAll] = useTransition()

  function setField(key: string, patch: Partial<FieldState>) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  function handleTranslateAll() {
    // Translate every key whose FR source is non-empty, in one batch.
    const keys = allKeys.filter((k) => (state[k]?.fr ?? '').trim() !== '')
    if (keys.length === 0) return
    startTranslateAll(async () => {
      const out = await translateBatch(keys.map((k) => state[k].fr))
      setState((prev) => {
        const next = { ...prev }
        keys.forEach((k, i) => {
          next[k] = { ...next[k], en: out[i] }
        })
        return next
      })
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const entries: Record<string, { value: string; value_fr: string }> = {}
    for (const key of allKeys) {
      const en = state[key]?.en ?? ''
      const fr = state[key]?.fr ?? ''
      const def = defaults[key]
      // The two columns are decided independently. An English field still on
      // its in-code default persists as empty whatever the French holds, so
      // the page keeps reading that default and a later edit to it in code
      // still reaches the site.
      //
      // This used to also require an empty French field, which meant that once
      // a French source existed, pressing Save with nothing changed pinned all
      // the English to whatever it said that day. Any later correction in code
      // was then silently overridden by the table.
      //
      // The save action deletes the row when both halves come out empty, which
      // is what makes "clear the field to revert" work.
      const isDefaultEn = def !== undefined && en === def
      entries[key] = { value: isDefaultEn ? '' : en, value_fr: fr }
    }
    startSaving(async () => {
      const result = await saveSiteContent(entries)
      if (result.error) setError(result.error)
      else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl border border-coral/20 bg-coral/10 px-5 py-4 font-sans text-sm text-coral">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-leaf/20 bg-leaf/10 px-5 py-4 font-sans text-sm text-leaf">
          Textes enregistrés.
        </div>
      )}

      <div className="flex items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/5 px-5 py-3">
        <p className="font-sans text-xs text-midnight-400">
          Le champ anglais est pré-rempli avec le texte actuel du site. Édite-le, ou écris le
          français et traduis. Le site publie l’anglais.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleTranslateAll}
          disabled={translatingAll}
        >
          {translatingAll ? 'Traduction…' : 'Tout traduire FR → EN'}
        </Button>
      </div>

      {groups.map((group) => (
        <div
          key={group.title}
          className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm"
        >
          <h2 className="font-heading text-base font-semibold text-midnight">
            {group.title}
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {group.fields.map((field) => (
              <TranslatableField
                key={field.key}
                label={field.label}
                enName={field.key}
                frName={`${field.key}__fr`}
                enValue={state[field.key]?.en ?? ''}
                frValue={state[field.key]?.fr ?? ''}
                onEnChange={(v) => setField(field.key, { en: v })}
                onFrChange={(v) => setField(field.key, { fr: v })}
                multiline={field.multiline}
                rows={field.rows}
                className={field.multiline ? 'lg:col-span-2' : undefined}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-pearl-400 bg-pearl/80 py-4 backdrop-blur">
        <span className="font-sans text-xs text-midnight-400">
          Un champ anglais laissé sur le texte par défaut n’est pas enregistré.
        </span>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}
