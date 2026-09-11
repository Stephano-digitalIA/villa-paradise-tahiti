/**
 * Rate seasons as date windows, set from Admin > Réglages.
 *
 * A window is a yearly recurring range, `MM-DD` to `MM-DD` inclusive, tagged
 * with the season it belongs to. A window may wrap the year end (`12-20` to
 * `01-05`). Any date no window covers is low season, so the operator only
 * has to describe the exceptions.
 *
 * Priority when windows overlap: peak beats high beats low. That lets a
 * broad "July to September is high" sit under a narrower "Easter week is
 * peak" without the operator having to carve holes.
 *
 * Easter moves every year; the operator adjusts that window once a year.
 *
 * Pure module: used by the pricing engine (client and server), the rates
 * page and the admin editor.
 */
import type { Season } from './types'

export interface SeasonWindow {
  season: Season
  /** `MM-DD`, inclusive. */
  from: string
  /** `MM-DD`, inclusive. May be earlier than `from` when the window wraps. */
  to: string
  /** Optional wording for the rates page, e.g. "Easter". */
  label?: string
}

/** The owner's calendar (September 2026). Used when the database has none. */
export const DEFAULT_SEASON_WINDOWS: SeasonWindow[] = [
  { season: 'peak', from: '07-01', to: '08-31' },
  { season: 'peak', from: '12-16', to: '01-04' },
  { season: 'high', from: '04-01', to: '06-30' },
  { season: 'high', from: '09-01', to: '09-30' },
  { season: 'low', from: '01-05', to: '03-31' },
  { season: 'low', from: '10-01', to: '12-15' },
]

const SEASONS: Season[] = ['low', 'high', 'peak']
const MMDD = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

/** Validate whatever the database holds. Anything malformed is dropped. */
export function parseSeasonWindows(raw: unknown): SeasonWindow[] {
  if (!Array.isArray(raw)) return []
  const out: SeasonWindow[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const w = item as Record<string, unknown>
    const season = w.season
    const from = typeof w.from === 'string' ? w.from.slice(-5) : ''
    const to = typeof w.to === 'string' ? w.to.slice(-5) : ''
    if (!SEASONS.includes(season as Season)) continue
    if (!MMDD.test(from) || !MMDD.test(to)) continue
    out.push({
      season: season as Season,
      from,
      to,
      ...(typeof w.label === 'string' && w.label.trim() ? { label: w.label.trim() } : {}),
    })
  }
  return out
}

/** `MM-DD` to a comparable number, e.g. "07-15" -> 715. */
function key(mmdd: string): number {
  const [m, d] = mmdd.split('-').map(Number)
  return m * 100 + d
}

function covers(window: SeasonWindow, mmdd: string): boolean {
  const k = key(mmdd)
  const a = key(window.from)
  const b = key(window.to)
  return a <= b ? k >= a && k <= b : k >= a || k <= b
}

/**
 * The season of an ISO date under the given windows. Low when nothing
 * matches, so the operator describes only the exceptions.
 */
export function seasonForDate(iso: string, windows: SeasonWindow[]): Season {
  const mmdd = iso.slice(5, 10)
  if (!MMDD.test(mmdd)) return 'low'
  for (const season of ['peak', 'high', 'low'] as const) {
    if (windows.some((w) => w.season === season && covers(w, mmdd))) return season
  }
  return 'low'
}

/* ---------------------------------------------------------------------------
 * Wording for the rates page
 * ------------------------------------------------------------------------- */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/**
 * Every month of the window, named, so a guest scanning the card sees "May"
 * rather than having to infer it from "April – June". Months only partly
 * covered carry their day range: "January 5 – 31 · February · March".
 */
function describeWindow(w: SeasonWindow): string {
  if (w.label) return w.label
  const [fm, fd] = w.from.split('-').map(Number)
  const [tm, td] = w.to.split('-').map(Number)
  const parts: string[] = []
  let m = fm
  for (let guard = 0; guard < 12; guard++) {
    const first = m === fm ? fd : 1
    const last = m === tm ? td : DAYS_IN_MONTH[m - 1]
    const whole = first === 1 && last >= DAYS_IN_MONTH[m - 1] - 1
    parts.push(whole ? MONTHS[m - 1] : `${MONTHS[m - 1]} ${first} – ${last}`)
    if (m === tm) break
    m = m === 12 ? 1 : m + 1
  }
  return parts.join(' · ')
}

/**
 * The windows of one season as a sentence for the rates card, e.g.
 * "May – June · October – November". Empty when the season has no window.
 */
export function describeSeasonWindows(windows: SeasonWindow[], season: Season): string {
  return windows
    .filter((w) => w.season === season)
    .map(describeWindow)
    .join(' · ')
}
