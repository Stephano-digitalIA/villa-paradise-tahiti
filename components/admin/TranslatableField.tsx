'use client'

import { useTransition } from 'react'

import { translateText } from '@/app/actions/translate'

const FIELD_BASE =
  'w-full rounded-lg px-3 py-2 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:outline-none focus:ring-1'

// French source — pale slate/blue tint.
const FR_FIELD = `${FIELD_BASE} border border-midnight-200 bg-midnight-50 focus:border-midnight-400 focus:ring-midnight-300`
// English published — pale gold tint (this is what goes live on the site).
const EN_FIELD = `${FIELD_BASE} border border-gold-300 bg-gold-50 focus:border-gold focus:ring-gold`

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

function LangChip({ tone, code, text }: { tone: 'fr' | 'en'; code: string; text: string }) {
  const chip =
    tone === 'fr'
      ? 'bg-midnight-100 text-midnight-600'
      : 'bg-gold-100 text-gold-800'
  const label = tone === 'fr' ? 'text-midnight-500' : 'text-gold-700'
  return (
    <span className="mb-1 flex items-center gap-2">
      <span
        className={`inline-flex h-4 items-center rounded px-1.5 font-sans text-[10px] font-bold tracking-wide ${chip}`}
      >
        {code}
      </span>
      <span className={`font-sans text-xs font-semibold uppercase tracking-wide ${label}`}>
        {text}
      </span>
    </span>
  )
}

/**
 * A bilingual content field: a French "source" input the operator writes in,
 * a "Traduire →" button that fills the English "published" input via Claude,
 * and the editable English value that actually gets saved + shown on the site.
 *
 * The two languages are colour-coded for contrast — slate for the French
 * source, gold for the published English. Both inputs carry a `name`, so the
 * parent form's `FormData` picks up the EN value (as today) plus the FR source.
 * Controlled — the parent owns state.
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
    <div className={`rounded-xl border border-pearl-400 bg-pearl/50 p-3.5 ${className ?? ''}`}>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="font-heading text-sm font-semibold text-midnight">{label}</span>
        <button
          type="button"
          onClick={handleTranslate}
          disabled={pending || frValue.trim() === ''}
          className="shrink-0 rounded-md border border-gold/50 bg-gold/15 px-2.5 py-1 font-sans text-xs font-semibold text-gold-700 transition hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? 'Traduction…' : 'Traduire FR → EN'}
        </button>
      </div>

      {/* French source */}
      <label className="block rounded-lg border-l-[3px] border-midnight-300 bg-midnight-50/50 py-2 pl-3 pr-2">
        <LangChip tone="fr" code="FR" text="Français — source" />
        {multiline ? (
          <textarea
            name={frName}
            value={frValue}
            onChange={(e) => onFrChange(e.target.value)}
            rows={rows}
            placeholder="Écris en français, puis « Traduire »"
            className={FR_FIELD}
          />
        ) : (
          <input
            type="text"
            name={frName}
            value={frValue}
            onChange={(e) => onFrChange(e.target.value)}
            placeholder="Écris en français, puis « Traduire »"
            className={FR_FIELD}
          />
        )}
      </label>

      {/* English published */}
      <label className="mt-2.5 block rounded-lg border-l-[3px] border-gold bg-gold-50/50 py-2 pl-3 pr-2">
        <LangChip tone="en" code="EN" text="Anglais — publié sur le site" />
        {multiline ? (
          <textarea
            name={enName}
            value={enValue}
            onChange={(e) => onEnChange(e.target.value)}
            rows={rows}
            placeholder="Vide = texte par défaut du site"
            className={EN_FIELD}
          />
        ) : (
          <input
            type="text"
            name={enName}
            value={enValue}
            onChange={(e) => onEnChange(e.target.value)}
            placeholder="Vide = texte par défaut du site"
            className={EN_FIELD}
          />
        )}
      </label>
    </div>
  )
}
