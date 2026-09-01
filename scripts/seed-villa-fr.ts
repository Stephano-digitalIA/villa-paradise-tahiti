/**
 * One-off: archive the French source for the /villa "Le cadre" copy.
 *
 * Same contract as `seed-rates-fr.ts`: writes only `value_fr`. `value` (the
 * English the public site publishes) is left alone, so every key keeps falling
 * back to its in-code default in `lib/content/villa.ts` and the live page does
 * not change.
 *
 * Run: npx tsx --env-file=.env.local scripts/seed-villa-fr.ts
 */
import { createClient } from '@supabase/supabase-js'

import { VILLA_CONTENT_GROUPS } from '../lib/content/villa'

const FRENCH: ReadonlyArray<readonly [string, string]> = [
  ['villa.location.eyebrow', 'Le cadre'],
  [
    'villa.location.title',
    'Sur cette portion tranquille de littoral, les voyageurs viennent pour...',
  ],
  [
    'villa.location.intro',
    "Punaauia, le quartier le plus prestigieux de Tahiti : un littoral de carte postale, des plages de sable blanc et un lagon turquoise, à vingt-cinq minutes de l'aéroport et à mille lieues de l'agitation de la capitale.",
  ],
  ['villa.location.maps_cta', 'Afficher sur Google Maps'],
  ['villa.location.d1.value', '25 min en voiture'],
  ['villa.location.d1.label', 'Aéroport international de Faaa (PPT)'],
  ['villa.location.d2.value', '30 min en voiture'],
  ['villa.location.d2.label', 'Centre-ville de Papeete'],
  ['villa.location.d3.value', 'À quelques pas de la villa'],
  ['villa.location.d3.label', 'Accès au lagon'],
  ['villa.location.d4.value', '5 min en voiture'],
  ['villa.location.d4.label', 'Restaurants, boutiques et centre commercial'],
]

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing Supabase env vars.')
  const db = createClient(url, serviceKey)

  const known = new Set(VILLA_CONTENT_GROUPS.flatMap((g) => g.fields.map((f) => f.key)))
  const unknown = FRENCH.filter(([k]) => !known.has(k)).map(([k]) => k)
  if (unknown.length > 0) throw new Error('Unknown keys: ' + unknown.join(', '))
  const missing = [...known].filter((k) => !FRENCH.some(([fk]) => fk === k))
  if (missing.length > 0) throw new Error('No French for: ' + missing.join(', '))
  console.log('Cles verifiees :', FRENCH.length, 'sur', known.size, 'du registre.')

  const keys = FRENCH.map(([k]) => k)

  const { data: before, error: readErr } = await db
    .from('site_content')
    .select('key, value, value_fr')
    .in('key', keys)
  if (readErr) throw readErr
  console.log('AVANT : lignes villa.location.* deja presentes =', before?.length ?? 0)
  for (const r of before ?? []) {
    console.log('   ', r.key, '| value=' + JSON.stringify((r.value as string).slice(0, 40)))
  }

  const now = new Date().toISOString()
  const rows = FRENCH.map(([key, value_fr]) => ({ key, value_fr, updated_at: now }))
  const { error } = await db.from('site_content').upsert(rows, { onConflict: 'key' })
  if (error) throw error

  const { data: after, error: afterErr } = await db
    .from('site_content')
    .select('key, value, value_fr')
    .in('key', keys)
  if (afterErr) throw afterErr

  const rowsBack = after ?? []
  const emptyFr = rowsBack.filter((r) => ((r.value_fr as string) ?? '').trim() === '')
  const publishedEn = rowsBack.filter((r) => ((r.value as string) ?? '').trim() !== '')

  console.log('')
  console.log('APRES :')
  console.log('  lignes ecrites            :', rowsBack.length, '/', FRENCH.length)
  console.log('  francais manquant         :', emptyFr.length)
  console.log('  anglais fige dans la base :', publishedEn.length, '(doit rester 0)')
  for (const r of publishedEn) console.log('    ATTENTION', r.key)

  const sample = rowsBack.find((r) => r.key === 'villa.location.eyebrow')
  console.log('')
  console.log('  Exemple, villa.location.eyebrow :')
  console.log('    value    =', JSON.stringify(sample?.value))
  console.log('    value_fr =', JSON.stringify(sample?.value_fr))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
