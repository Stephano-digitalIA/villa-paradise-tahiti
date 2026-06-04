/**
 * One-shot iCal URL tester.
 * Usage:   node scripts/test-ical.mjs "<airbnb-or-booking-or-vrbo-ical-url>"
 *
 * Fetches the feed, parses it with the same node-ical library the runtime
 * uses, and prints a summary so we can validate the URL works before
 * persisting it to env vars / Netlify / Supabase blocked_dates.
 */

import nodeIcal from 'node-ical'

const url = process.argv[2]
if (!url) {
  console.error('Usage: node scripts/test-ical.mjs "<url>"')
  process.exit(1)
}

console.log('Fetching:', url.replace(/(\?t=)[^&]+/, '$1<REDACTED>'))
const response = await fetch(url, {
  headers: { 'User-Agent': 'VillaParadiseTahiti-iCalTest/1.0' },
})

if (!response.ok) {
  console.error(`HTTP ${response.status} ${response.statusText}`)
  process.exit(1)
}

const text = await response.text()
console.log(`Body: ${text.length} chars`)
if (!text.startsWith('BEGIN:VCALENDAR')) {
  console.error('Body does not look like iCal (missing BEGIN:VCALENDAR)')
  console.error('First 200 chars:', text.slice(0, 200))
  process.exit(1)
}

const parsed = nodeIcal.parseICS(text)
const vevents = Object.values(parsed).filter((e) => e?.type === 'VEVENT')
console.log(`VEVENT count: ${vevents.length}`)

const now = Date.now()
const upcoming = vevents
  .filter((e) => e.end && new Date(e.end).getTime() >= now)
  .sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )

console.log(`\nNext ${Math.min(upcoming.length, 5)} upcoming blocked range(s):`)
upcoming.slice(0, 5).forEach((e, i) => {
  const start = new Date(e.start).toISOString().slice(0, 10)
  const end = new Date(e.end).toISOString().slice(0, 10)
  const uid = e.uid ?? '<no UID>'
  const summary = (e.summary ?? '<no summary>').toString().slice(0, 50)
  console.log(`  ${i + 1}. ${start} → ${end} | ${summary} | UID=${uid}`)
})

console.log('\n✓ Feed looks valid. Safe to add to env vars.')
