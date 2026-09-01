/**
 * One-off: archive the French source for the /getting-here copy.
 *
 * Same contract as `seed-rates-fr.ts` and `seed-villa-fr.ts`: writes only
 * `value_fr`. `value` (the English the public site publishes) is left alone,
 * so every key keeps falling back to its in-code default in
 * `lib/content/getting-here.ts` and the live page does not change.
 *
 * Run: npx tsx --env-file=.env.local scripts/seed-getting-here-fr.ts
 */
import { createClient } from '@supabase/supabase-js'

import { GETTING_HERE_CONTENT_GROUPS } from '../lib/content/getting-here'

const FRENCH: ReadonlyArray<readonly [string, string]> = [
  // En-tête
  ['gh.hero.eyebrow', 'Comment venir'],
  ['gh.hero.title1', 'Préparez votre voyage'],
  ['gh.hero.title2', 'jusqu’au paradis.'],
  [
    'gh.hero.subtitle',
    "Tahiti est plus proche que vous ne le pensez : environ huit heures de vol direct depuis la côte ouest des États-Unis. Ci-dessous, les liaisons les plus empruntées par nos voyageurs, un moyen rapide de chercher un vol et l'essentiel à savoir pour une arrivée sereine.",
  ],
  // Recherche de vols
  ['gh.search.eyebrow', 'Recherche en direct'],
  ['gh.search.title', 'Tarifs et horaires'],
  [
    'gh.search.intro',
    "Choisissez votre ville de départ et vos dates : Skyscanner s'ouvre dans une fenêtre dédiée, déjà pré-remplie. Nous percevons parfois une petite commission si vous réservez via ce lien, sans surcoût pour vous.",
  ],
  // Tableau des liaisons
  ['gh.routes.eyebrow', 'Liaisons directes et avec escale'],
  ['gh.routes.title', 'Voler vers Tahiti (PPT)'],
  [
    'gh.routes.intro',
    "L'aéroport international de Tahiti, Faa'a (code IATA PPT), est à 25 minutes de route de la villa. Communiquez-nous votre vol et nous organisons le transfert.",
  ],
  ['gh.routes.th_from', 'Départ'],
  ['gh.routes.th_route', 'Trajet'],
  ['gh.routes.th_carriers', 'Compagnies'],
  ['gh.routes.th_duration', 'Durée'],
  [
    'gh.routes.footnote',
    'Les lignes saisonnières (Delta, Air Tahiti Nui Tokyo) varient selon les mois. La recherche Skyscanner ci-dessus reflète les disponibilités du moment.',
  ],
  // Liaisons
  ['gh.route.r1.from', 'Los Angeles'],
  ['gh.route.r1.iata', 'LAX → PPT'],
  ['gh.route.r1.carriers', 'Air Tahiti Nui, French Bee, Delta (saisonnier)'],
  ['gh.route.r1.duration', '≈ 8h 20 direct'],
  ['gh.route.r1.note', 'Départs quotidiens toute l’année.'],
  ['gh.route.r2.from', 'San Francisco'],
  ['gh.route.r2.iata', 'SFO → PPT'],
  ['gh.route.r2.carriers', 'United Airlines, French Bee'],
  ['gh.route.r2.duration', '≈ 8h direct'],
  [
    'gh.route.r2.note',
    'United opère cette liaison sans escale depuis fin 2022, seule compagnie américaine historique à desservir Tahiti en direct.',
  ],
  ['gh.route.r3.from', 'Seattle'],
  ['gh.route.r3.iata', 'SEA → PPT'],
  ['gh.route.r3.carriers', 'Delta (saisonnier)'],
  ['gh.route.r3.duration', '≈ 9h direct'],
  [
    'gh.route.r3.note',
    'Ligne saisonnière. Vérifiez les fréquences actuelles sur Skyscanner.',
  ],
  ['gh.route.r4.from', 'New York / Boston'],
  ['gh.route.r4.iata', 'JFK / BOS → PPT'],
  ['gh.route.r4.carriers', 'United ou Delta via LAX / SFO'],
  ['gh.route.r4.duration', '≈ 14h au total'],
  ['gh.route.r4.note', ''],
  ['gh.route.r5.from', 'Paris'],
  ['gh.route.r5.iata', 'CDG → PPT'],
  [
    'gh.route.r5.carriers',
    'Air Tahiti Nui, French Bee, Air France (partage de code via LAX ou SFO)',
  ],
  ['gh.route.r5.duration', '≈ 22h au total'],
  ['gh.route.r5.note', ''],
  ['gh.route.r6.from', 'Auckland'],
  ['gh.route.r6.iata', 'AKL → PPT'],
  ['gh.route.r6.carriers', 'Air Tahiti Nui'],
  ['gh.route.r6.duration', '≈ 5h direct'],
  ['gh.route.r6.note', ''],
  ['gh.route.r7.from', 'Tokyo'],
  ['gh.route.r7.iata', 'HND / NRT → PPT'],
  ['gh.route.r7.carriers', 'Air Tahiti Nui (saisonnier)'],
  ['gh.route.r7.duration', '≈ 11h direct'],
  ['gh.route.r7.note', ''],
  // Transfert aéroport
  ['gh.transfer.title', 'Transfert aéroport'],
  [
    'gh.transfer.body',
    "De Faa'a (PPT) à la villa, comptez environ 25 minutes en voiture. Communiquez-nous votre numéro de vol à la réservation et un transfert privé vous attendra à l'arrivée : offert pour les séjours de sept nuits et plus, sinon à partir de 80 dollars l'aller simple.",
  ],
  // À savoir avant de partir
  ['gh.essentials.eyebrow', 'Avant de partir'],
  ['gh.essentials.title', 'L’essentiel à savoir'],
  ['gh.essentials.e1.label', 'Visa'],
  [
    'gh.essentials.e1.value',
    'Aucun visa pour les ressortissants des États-Unis, de l’Union européenne, du Royaume-Uni, du Canada, d’Australie et de Nouvelle-Zélande, jusqu’à 90 jours.',
  ],
  ['gh.essentials.e2.label', 'Monnaie'],
  [
    'gh.essentials.e2.value',
    'Le franc Pacifique (XPF). Dollars et euros largement acceptés, les cartes bancaires fonctionnent partout.',
  ],
  ['gh.essentials.e3.label', 'Fuseau horaire'],
  ['gh.essentials.e3.value', 'UTC−10 (comme Hawaï, sans changement d’heure).'],
  ['gh.essentials.e4.label', 'Langues'],
  [
    'gh.essentials.e4.value',
    'Le français et le tahitien. L’anglais est parlé à la villa et dans la plupart des hôtels.',
  ],
  // Appel à l'action final
  ['gh.cta.eyebrow', 'Quand vous voulez'],
  ['gh.cta.title', 'Bloquez vos dates.'],
  [
    'gh.cta.subtitle',
    'Une fois vos vols réservés, sécurisez la villa sur ces nuits avec un acompte de 30 %. L’annulation reste souple jusqu’à 60 jours avant l’arrivée.',
  ],
  ['gh.cta.primary', 'Voir les disponibilités'],
  ['gh.cta.secondary', 'Poser une question voyage'],
]

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing Supabase env vars.')
  const db = createClient(url, serviceKey)

  const known = new Set(
    GETTING_HERE_CONTENT_GROUPS.flatMap((g) => g.fields.map((f) => f.key)),
  )
  const unknown = FRENCH.filter(([k]) => !known.has(k)).map(([k]) => k)
  if (unknown.length > 0) throw new Error('Unknown keys: ' + unknown.join(', '))
  const missing = [...known].filter((k) => !FRENCH.some(([fk]) => fk === k))
  if (missing.length > 0) throw new Error('No French for: ' + missing.join(', '))
  console.log('Cles verifiees :', FRENCH.length, 'sur', known.size, 'du registre.')

  // Rows whose French is deliberately empty (routes with no note) would be
  // written as blank; skip them so no useless row is created.
  const writable = FRENCH.filter(([, v]) => v.trim() !== '')
  const keys = writable.map(([k]) => k)
  console.log('Champs volontairement vides ignores :', FRENCH.length - writable.length)

  const { data: before, error: readErr } = await db
    .from('site_content')
    .select('key, value, value_fr')
    .in('key', keys)
  if (readErr) throw readErr
  console.log('AVANT : lignes gh.* deja presentes =', before?.length ?? 0)
  for (const r of before ?? []) {
    console.log('   ', r.key, '| value=' + JSON.stringify((r.value as string).slice(0, 40)))
  }

  const now = new Date().toISOString()
  const rows = writable.map(([key, value_fr]) => ({ key, value_fr, updated_at: now }))
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
  console.log('  lignes ecrites            :', rowsBack.length, '/', writable.length)
  console.log('  francais manquant         :', emptyFr.length)
  console.log('  anglais fige dans la base :', publishedEn.length, '(doit rester 0)')
  for (const r of publishedEn) console.log('    ATTENTION', r.key)

  const sample = rowsBack.find((r) => r.key === 'gh.hero.eyebrow')
  console.log('')
  console.log('  Exemple, gh.hero.eyebrow :')
  console.log('    value    =', JSON.stringify(sample?.value))
  console.log('    value_fr =', JSON.stringify(sample?.value_fr))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
