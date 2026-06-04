/**
 * One-shot iCal sync — duplicates the persistence logic from
 * lib/ical/persist.ts in plain JS so we can validate a feed against
 * the live Supabase blocked_dates table without needing the dev server
 * running or the CRON_SECRET set up.
 *
 * Usage:
 *   node --env-file=.env.local scripts/sync-ical.mjs <source> "<url>"
 *
 * Example:
 *   node --env-file=.env.local scripts/sync-ical.mjs airbnb \
 *     "https://www.airbnb.fr/calendar/ical/123.ics?t=xxx"
 *
 * Source values must match the CHECK constraint on blocked_dates.source:
 *   airbnb | booking | vrbo
 *
 * After running, open /admin/calendar to see the new rows as colored bars.
 */

import nodeIcal from 'node-ical'
import { createClient } from '@supabase/supabase-js'

/* ─── CLI args ──────────────────────────────────────────────── */

const source = (process.argv[2] || '').trim().toLowerCase()
const url = (process.argv[3] || '').trim()

const VALID_SOURCES = new Set(['airbnb', 'booking', 'vrbo'])

if (!VALID_SOURCES.has(source) || !url) {
  console.error('Usage: node --env-file=.env.local scripts/sync-ical.mjs <airbnb|booking|vrbo> "<url>"')
  process.exit(1)
}

/* ─── Env ───────────────────────────────────────────────────── */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env file')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/* ─── iCal helpers (mirror lib/ical/parse.ts behaviour) ─────── */

function toIsoDate(d) {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function previousDay(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() - 1)
  return toIsoDate(date)
}

function isAvailableMarker(summary) {
  if (!summary) return false
  const lower = String(summary).toLowerCase()
  return (
    lower === 'available' ||
    lower.includes('not blocked') ||
    lower.startsWith('available ')
  )
}

function parseRanges(text) {
  const calendar = nodeIcal.parseICS(text)
  const ranges = []

  for (const key of Object.keys(calendar)) {
    const c = calendar[key]
    if (!c || c.type !== 'VEVENT') continue
    if (c.status === 'CANCELLED') continue
    if (isAvailableMarker(c.summary)) continue
    if (!c.start || !c.end) continue

    const startDate = c.start instanceof Date ? c.start : new Date(c.start)
    const endDate = c.end instanceof Date ? c.end : new Date(c.end)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) continue

    const startIso = toIsoDate(startDate)
    // DTEND is exclusive in iCal — convert to inclusive end.
    const endIsoExclusive = toIsoDate(endDate)
    const endIso = endIsoExclusive > startIso ? previousDay(endIsoExclusive) : startIso

    ranges.push({
      start: startIso,
      end: endIso,
      summary: typeof c.summary === 'string' ? c.summary : null,
      uid: typeof c.uid === 'string' && c.uid.length > 0 ? c.uid : null,
    })
  }
  return ranges
}

/* ─── Main ──────────────────────────────────────────────────── */

console.log(`\n── 1. Fetch ${source} feed ──────────────────────────`)
const response = await fetch(url, {
  headers: { 'User-Agent': 'VillaParadiseTahiti-iCalSync/1.0' },
})
if (!response.ok) {
  console.error(`HTTP ${response.status} ${response.statusText}`)
  process.exit(1)
}
const text = await response.text()
console.log(`Body: ${text.length} chars`)

console.log(`\n── 2. Parse ──────────────────────────────────────────`)
const ranges = parseRanges(text)
console.log(`Parsed ${ranges.length} VEVENTs`)

const withUid = ranges.filter((r) => r.uid)
const skippedNoUid = ranges.length - withUid.length
if (skippedNoUid > 0) {
  console.log(`Skipped (no UID, can't upsert safely): ${skippedNoUid}`)
}

console.log(`\n── 3. Clear existing ${source} rows (with source_ref) ──`)
// We use a delete-then-insert pattern instead of UPSERT because the
// (source, source_ref) unique index is partial (WHERE source_ref IS NOT NULL)
// and PostgreSQL cannot use partial indexes via PostgREST's ON CONFLICT.
// Manual entries with source_ref IS NULL (owner / maintenance / direct_booking
// from payment webhooks) are preserved.
const { error: delErr, count: cleared } = await supabase
  .from('blocked_dates')
  .delete({ count: 'exact' })
  .eq('source', source)
  .not('source_ref', 'is', null)
if (delErr) {
  console.error(`Clear failed: ${delErr.message}`)
  process.exit(1)
}
console.log(`Cleared: ${cleared ?? 0}`)

console.log(`\n── 4. Insert fresh rows ──────────────────────────────`)
const rows = withUid.map((r) => ({
  source,
  source_ref: r.uid,
  blocked_from: r.start,
  blocked_to: r.end,
  reason: r.summary,
}))

let inserted = 0
if (rows.length > 0) {
  const { error, count } = await supabase
    .from('blocked_dates')
    .insert(rows, { count: 'exact' })
  if (error) {
    console.error(`Insert failed: ${error.message}`)
    process.exit(1)
  }
  inserted = count ?? rows.length
}
console.log(`Inserted: ${inserted}`)

console.log(`\n── 5. Verify (count in DB for this source) ──────────`)
const { count: total } = await supabase
  .from('blocked_dates')
  .select('id', { count: 'exact', head: true })
  .eq('source', source)
console.log(`Total ${source} rows in blocked_dates now: ${total ?? 'unknown'}`)

console.log(`\n✓ Done. Open /admin/calendar to see the bars.`)
