'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/Button'
import type { ContentGroup } from '@/lib/content/registry'

import { saveSiteContent } from './actions'

interface SiteContentFormProps {
  groups: ContentGroup[]
  values: Record<string, string>
}

export function SiteContentForm({ groups, values }: SiteContentFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const entries: Record<string, string> = {}
    for (const group of groups) {
      for (const field of group.fields) {
        entries[field.key] = (fd.get(field.key) as string | null) ?? ''
      }
    }
    startTransition(async () => {
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
              <label
                key={field.key}
                className={field.multiline ? 'lg:col-span-2' : undefined}
              >
                <span className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  {field.label}
                </span>
                {field.multiline ? (
                  <textarea
                    name={field.key}
                    defaultValue={values[field.key] ?? ''}
                    rows={3}
                    placeholder="Vide = texte par défaut du site"
                    className="w-full rounded-lg border border-pearl-400 bg-white px-3 py-2 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                ) : (
                  <input
                    type="text"
                    name={field.key}
                    defaultValue={values[field.key] ?? ''}
                    placeholder="Vide = texte par défaut du site"
                    className="w-full rounded-lg border border-pearl-400 bg-white px-3 py-2 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-pearl-400 bg-pearl/80 py-4 backdrop-blur">
        <span className="font-sans text-xs text-midnight-400">
          Un champ vide rétablit le texte par défaut.
        </span>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}
