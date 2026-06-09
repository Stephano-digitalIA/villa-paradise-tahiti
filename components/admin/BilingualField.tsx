'use client'

import { useState } from 'react'

import { TranslatableField } from './TranslatableField'

export interface BilingualFieldProps {
  label: string
  /** Form field name for the English (published) value. */
  enName: string
  /** Form field name for the French (source) value. */
  frName: string
  defaultEn: string
  defaultFr: string
  multiline?: boolean
  rows?: number
  className?: string
  /** Optional: notified when the English value changes (e.g. to auto-slug). */
  onEnChange?: (value: string) => void
}

/**
 * Self-contained bilingual field for plain `FormData` forms (e.g. VillaForm).
 *
 * Unlike <TranslatableField> (which is controlled by the parent), this manages
 * its own FR/EN state seeded from `defaultEn`/`defaultFr`, so it drops into an
 * uncontrolled `<form onSubmit>` that reads values via `new FormData(form)` —
 * both inner inputs carry a `name`, so the EN value submits under `enName` and
 * the FR source under `frName`.
 */
export function BilingualField({
  label,
  enName,
  frName,
  defaultEn,
  defaultFr,
  multiline,
  rows,
  className,
  onEnChange,
}: BilingualFieldProps) {
  const [en, setEn] = useState(defaultEn)
  const [fr, setFr] = useState(defaultFr)

  function handleEnChange(value: string) {
    setEn(value)
    onEnChange?.(value)
  }

  return (
    <TranslatableField
      label={label}
      enName={enName}
      frName={frName}
      enValue={en}
      frValue={fr}
      onEnChange={handleEnChange}
      onFrChange={setFr}
      multiline={multiline}
      rows={rows}
      className={className}
    />
  )
}
