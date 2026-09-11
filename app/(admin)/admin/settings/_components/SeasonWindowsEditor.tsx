'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import {
  DEFAULT_SEASON_WINDOWS,
  describeSeasonWindows,
  type SeasonWindow,
} from '@/lib/booking/seasons'
import type { Season } from '@/lib/booking/types'

/**
 * Rate seasons as yearly date windows.
 *
 * Feeds the pricing engine and the public rates page at once, so what the
 * guest reads on /rates is exactly what the calculator charges. Any date no
 * window covers is low season; peak beats high beats low where windows
 * overlap.
 *
 * Writes the list as JSON into a hidden field named `season_windows`, which
 * the parent form parses on submit.
 */

const SEASON_LABEL: Record<Season, string> = {
  low: 'Basse saison',
  high: 'Haute saison',
  peak: 'Très haute saison',
}

const SEASON_ORDER: Season[] = ['peak', 'high', 'low']

/** `MM-DD` to the `<input type="date">` value of an arbitrary leap year. */
function toDateValue(mmdd: string): string {
  return mmdd ? `2024-${mmdd}` : ''
}

function toMmdd(dateValue: string): string {
  return dateValue.slice(5, 10)
}

export function SeasonWindowsEditor({ initial }: { initial: SeasonWindow[] }) {
  const [windows, setWindows] = useState<SeasonWindow[]>(
    initial.length > 0 ? initial : DEFAULT_SEASON_WINDOWS,
  )

  function update(index: number, patch: Partial<SeasonWindow>) {
    setWindows((list) => list.map((w, i) => (i === index ? { ...w, ...patch } : w)))
  }

  function remove(index: number) {
    setWindows((list) => list.filter((_, i) => i !== index))
  }

  function add() {
    setWindows((list) => [...list, { season: 'high', from: '', to: '' }])
  }

  const complete = windows.filter((w) => w.from && w.to)

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="season_windows" value={JSON.stringify(complete)} />

      <p className="font-sans text-xs text-midnight-400">
        Périodes de l'année, reprises chaque année. Les dates non couvertes sont en
        basse saison. En cas de chevauchement, très haute saison prime sur haute, qui
        prime sur basse. Pâques change de date : ajuster cette ligne une fois par an.
      </p>

      <ul className="flex flex-col gap-2">
        {windows.map((w, i) => (
          <li
            key={i}
            className="grid grid-cols-1 items-end gap-2 rounded-xl border border-pearl-400 bg-pearl/60 p-3 sm:grid-cols-[1fr_1fr_1fr_1.2fr_auto]"
          >
            <label className="flex flex-col gap-1">
              <span className="font-sans text-[11px] uppercase tracking-wider text-midnight-400">
                Saison
              </span>
              <select
                value={w.season}
                onChange={(e) => update(i, { season: e.target.value as Season })}
                className="rounded-lg border border-pearl-400 bg-pearl px-2 py-1.5 font-sans text-sm text-midnight focus:border-gold focus:outline-none"
              >
                {SEASON_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {SEASON_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-sans text-[11px] uppercase tracking-wider text-midnight-400">
                Du
              </span>
              <input
                type="date"
                value={toDateValue(w.from)}
                onChange={(e) => update(i, { from: toMmdd(e.target.value) })}
                className="rounded-lg border border-pearl-400 bg-pearl px-2 py-1.5 font-sans text-sm text-midnight focus:border-gold focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-sans text-[11px] uppercase tracking-wider text-midnight-400">
                Au (inclus)
              </span>
              <input
                type="date"
                value={toDateValue(w.to)}
                onChange={(e) => update(i, { to: toMmdd(e.target.value) })}
                className="rounded-lg border border-pearl-400 bg-pearl px-2 py-1.5 font-sans text-sm text-midnight focus:border-gold focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-sans text-[11px] uppercase tracking-wider text-midnight-400">
                Libellé sur le site (facultatif)
              </span>
              <input
                type="text"
                value={w.label ?? ''}
                placeholder="ex. Easter"
                onChange={(e) => update(i, { label: e.target.value || undefined })}
                className="rounded-lg border border-pearl-400 bg-pearl px-2 py-1.5 font-sans text-sm text-midnight placeholder-midnight-300 focus:border-gold focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Supprimer cette période"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-pearl-400 text-midnight-400 transition-colors hover:border-coral hover:text-coral"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={add}
        className="inline-flex w-fit items-center gap-2 rounded-lg border border-pearl-400 px-3 py-1.5 font-sans text-sm text-midnight transition-colors hover:border-gold hover:text-gold"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Ajouter une période
      </button>

      {/* What the rates page will print, so the operator sees the effect
          before saving. The year in the date inputs is a display artefact. */}
      <div className="rounded-xl bg-sand/60 p-3 font-sans text-xs text-midnight-400">
        <p className="mb-1 font-semibold text-midnight">Aperçu sur la page Rates</p>
        {SEASON_ORDER.slice()
          .reverse()
          .map((s) => (
            <p key={s}>
              <span className="font-medium text-midnight">{SEASON_LABEL[s]} :</span>{' '}
              {describeSeasonWindows(complete, s) || (s === 'low' ? 'toutes les autres dates' : 'aucune période')}
            </p>
          ))}
      </div>
    </div>
  )
}
