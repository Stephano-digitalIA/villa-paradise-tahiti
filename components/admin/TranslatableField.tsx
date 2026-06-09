'use client'

import { useTransition } from 'react'

import { translateText } from '@/app/actions/translate'

const FIELD_CLASS =
  'w-full rounded-lg border border-pearl-400 bg-white px-3 py-2 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold'

export interface TranslatableFieldProps {
  /** Display label for the field. */
  label: string
  /** Form field name for the English (published) value. */
  enName: string
  /** Form field name for the French (source) value. */
  frName: string
  enValue: string
  frValue: string
  onEnChange: (value: string) => void
  onFrChange: (value: string) => void
  multiline?: boolean
  rows?: number
  className?: string
}

/**
 * A bilingual content field: a French "source" input the operator writes in,
 * a "Traduire →" button that fills the English "published" input via Claude,
 * and the editable English value that actually gets saved + shown on the site.
 *
 * Both inputs carry a `name`, so the parent form's `FormData` picks up the EN
 * value (as today) plus the FR source. Controlled — the parent owns state.
 */
export function TranslatableField({
  label,
  enName,
  frName,
  enValue,
  frValue,
  onEnChange,
  onFrChange,
  multiline = false,
  rows = 3,
  className,
}: TranslatableFieldProps) {
  const [pending, startTransition] = useTransition()

  function handleTranslate() {
    const fr = frValue.trim()
    if (fr === '') return
    startTransition(async () => {
      const en = await translateText(fr)
      onEnChange(en)
    })
  }

  return (
    <div className={`rounded-lg border border-pearl-400 bg-pearl/40 p-3 ${className ?? ''}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-sans text-sm font-medium text-midnight">{label}</span>
        <button
          type="button"
          onClick={handleTranslate}
          disabled={pending || frValue.trim() === ''}
          className="shrink-0 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1 font-sans text-xs font-medium text-gold transition hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? 'Traduction…' : 'Traduire FR → EN'}
        </button>
      </div>

      <label className="block">
        <span className="mb-1 block font-sans text-xs uppercase tracking-wide text-midnight-300">
          Français — source
        </span>
        {multiline ? (
          <textarea
            name={frName}
            value={frValue}
            onChange={(e) => onFrChange(e.target.value)}
            rows={rows}
            placeholder="Écris en français, puis « Traduire »"
            className={FIELD_CLASS}
          />
        ) : (
          <input
            type="text"
            name={frName}
            value={frValue}
            onChange={(e) => onFrChange(e.target.value)}
            placeholder="Écris en français, puis « Traduire »"
            className={FIELD_CLASS}
          />
        )}
      </label>

      <label className="mt-2 block">
        <span className="mb-1 block font-sans text-xs uppercase tracking-wide text-midnight-300">
          Anglais — publié sur le site
        </span>
        {multiline ? (
          <textarea
            name={enName}
            value={enValue}
            onChange={(e) => onEnChange(e.target.value)}
            rows={rows}
            placeholder="Vide = texte par défaut du site"
            className={FIELD_CLASS}
          />
        ) : (
          <input
            type="text"
            name={enName}
            value={enValue}
            onChange={(e) => onEnChange(e.target.value)}
            placeholder="Vide = texte par défaut du site"
            className={FIELD_CLASS}
          />
        )}
      </label>
    </div>
  )
}
