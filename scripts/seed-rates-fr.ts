/**
 * One-off: archive the French source for the /rates copy.
 *
 * Writes only `value_fr`. `value` (the English the public site publishes) is
 * left alone, so every key keeps falling back to its in-code default in
 * `lib/content/rates.ts` and the live page does not change. That also means a
 * future edit to an English default still takes effect, which would not be the
 * case had the current English been frozen into the table.
 *
 * Run: npx tsx --env-file=.env.local scripts/seed-rates-fr.ts
 */
import { createClient } from '@supabase/supabase-js'

import { RATES_CONTENT_GROUPS } from '../lib/content/rates'

const FRENCH: ReadonlyArray<readonly [string, string]> = [
  ["rates.hero.eyebrow", "Tarifs et disponibilités"],
  ["rates.hero.title1", "Des tarifs transparents,"],
  ["rates.hero.title2", "la magie toute l'année."],
  ["rates.hero.subtitle", "Une villa, trois saisons, aucune surprise. Les tarifs ci-dessous sont nos tarifs directs publiés : toujours inférieurs à ceux d'Airbnb, de VRBO ou de n'importe quelle plateforme. Aucun frais de service, aucune commission ajoutée."],
  ["rates.grid.eyebrow", "Tarifs par nuit"],
  ["rates.grid.title", "Nos tarifs saison par saison"],
  ["rates.grid.intro", "Les tarifs s'entendent pour la villa entière (jusqu'à 8 personnes). Séjour minimum de 5 nuits en basse et haute saison, 7 nuits pendant les périodes de fêtes."],
  ["rates.grid.unit", "par nuit"],
  ["rates.grid.low.name", "Basse saison"],
  ["rates.grid.low.window", "Mai à juin · Octobre à novembre"],
  ["rates.grid.low.blurb", "Des alizés légers, moins de voyageurs et les tarifs les plus doux de l'année. Notre période préférée."],
  ["rates.grid.high.name", "Haute saison"],
  ["rates.grid.high.window", "Juillet à septembre · Décembre à début janvier"],
  ["rates.grid.high.blurb", "La saison des baleines, des journées sèches et ensoleillées, l'heure dorée au bord de la piscine."],
  ["rates.grid.peak.name", "Périodes de fêtes"],
  ["rates.grid.peak.window", "Semaine de Noël · Nouvel An · Pâques"],
  ["rates.grid.peak.blurb", "La Villa Paradise Tahiti est le plus bel endroit pour passer les fêtes de Noël et du Nouvel An."],
  ["rates.grid.badge_popular", "La plus demandée"],
  ["rates.grid.badge_peak", "Places limitées"],
  ["rates.grid.footnote", "Les séjours de 14 nuits et plus bénéficient de 10 % de remise longue durée. Précisez-le lors de votre demande."],
  ["rates.inclusions.eyebrow", "Ce qui est compris"],
  ["rates.inclusions.title", "Le tarif comprend votre bien-être et :"],
  ["rates.inclusions.included_title", "Compris dans chaque séjour"],
  ["rates.inclusions.i1.title", "Panier de bienvenue tropical"],
  ["rates.inclusions.i1.body", "Papaye fraîche, mangue, fruit de la passion, croissants et café vanillé vous attendent sur le plan de travail à votre arrivée."],
  ["rates.inclusions.i2.title", "Ménage quotidien (sur demande), offert une fois par semaine pour les longs séjours"],
  ["rates.inclusions.i2.body", "Draps, serviettes et cuisine rafraîchis selon votre rythme."],
  ["rates.inclusions.i3.title", "Voiture compacte à votre disposition"],
  ["rates.inclusions.i3.body", "Une petite voiture adaptée à l'île, cinq places, sobre en carburant et garée à la villa, disponible pendant toute la durée de votre séjour."],
  ["rates.inclusions.i4.title", "Transfert aéroport offert"],
  ["rates.inclusions.i4.body", "Transfert offert par notre partenaire taxi pour les 25 minutes de trajet depuis l'aéroport international de Faaʻa (PPT) ou depuis la gare maritime."],
  ["rates.inclusions.i5.title", "Wi-Fi très haut débit"],
  ["rates.inclusions.i5.body", "Fibre optique dans toute la propriété, assez rapide pour des visioconférences depuis la terrasse ou pour télétravailler."],
  ["rates.inclusions.i6.title", "Matériel de snorkeling"],
  ["rates.inclusions.i6.body", "Palmes, masques et crème solaire respectueuse du récif sont à disposition."],
  ["rates.inclusions.extras_title", "Options à la carte"],
  ["rates.inclusions.e1.title", "Excursions avec nos partenaires"],
  ["rates.inclusions.e1.body", "Snorkeling dans le lagon, tour de l'île en 4×4, sortie en catamaran, sortie privée en bateau VIP, croisière au coucher du soleil, observation des baleines (en saison)."],
  ["rates.inclusions.e2.title", "Chef privé et traiteur"],
  ["rates.inclusions.e2.body", "Des menus polynésiens et français préparés sur la terrasse par un chef de notre réseau de conciergerie."],
  ["rates.inclusions.e3.title", "Prestations spa à la villa"],
  ["rates.inclusions.e3.body", "Massage taurumi à l'huile de monoï chaude, manucure, soin du visage. Réservation le jour même selon disponibilité."],
  ["rates.inclusions.e4.title", "Massage thaï à domicile"],
  ["rates.inclusions.e4.body", "Massage taurumi à la villa, à l'huile de monoï chaude, par notre thérapeute partenaire diplômé. Sur demande."],
  ["rates.policy.deposit_eyebrow", "Acompte et conditions"],
  ["rates.policy.deposit_title", "Comment se passe le paiement"],
  ["rates.policy.label_deposit", "Acompte à la réservation"],
  ["rates.policy.label_balance", "Solde à régler"],
  ["rates.policy.value_balance", "30 jours avant l'arrivée"],
  ["rates.policy.label_minstay", "Séjour minimum"],
  ["rates.policy.value_minstay", "nuits (7 pendant les fêtes)"],
  ["rates.policy.label_payment", "Moyens de paiement"],
  ["rates.policy.value_payment", "PayPal · Cartes bancaires"],
  ["rates.policy.cancel_eyebrow", "Annulation"],
  ["rates.policy.cancel_title", "Souple et transparente"],
  ["rates.policy.cancel_1_label", "À plus de 60 jours de l'arrivée :"],
  ["rates.policy.cancel_1_body", "remboursement à 100 %."],
  ["rates.policy.cancel_2_label", "Entre 30 et 60 jours avant l'arrivée :"],
  ["rates.policy.cancel_2_body", "remboursement à 50 %."],
  ["rates.policy.cancel_3_label", "À moins de 30 jours de l'arrivée :"],
  ["rates.policy.cancel_3_body", "aucun remboursement. Une assurance voyage est vivement recommandée."],
  ["rates.cta.eyebrow", "Préparez votre séjour"],
  ["rates.cta.title1", "Voyez votre total"],
  ["rates.cta.title2", "pour les dates de votre choix"],
  ["rates.cta.subtitle", "Choisissez votre date d'arrivée, le nombre de voyageurs et les expériences qui vous tentent. Nous affichons le total exact, en dollars, sans frais cachés."],
  ["rates.cta.primary", "Calculer mon séjour"],
  ["rates.cta.secondary", "Demander les disponibilités"],
  ["rates.cta.trust", "Meilleur tarif garanti · Remboursement à 100 % en cas d'annulation à plus de 60 jours · Paiement sécurisé par PayPal"],
]

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing Supabase env vars.')
  const db = createClient(url, serviceKey)

  // Guard: never write a key the registry does not declare, and never write a
  // partial set by accident.
  const known = new Set(RATES_CONTENT_GROUPS.flatMap((g) => g.fields.map((f) => f.key)))
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
  console.log('AVANT : lignes rates.* deja presentes =', before?.length ?? 0)
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
  console.log('  lignes ecrites            :', rowsBack.length, '/ 68')
  console.log('  francais manquant         :', emptyFr.length)
  console.log('  anglais fige dans la base :', publishedEn.length, '(doit rester 0)')
  for (const r of publishedEn) console.log('    ATTENTION', r.key)

  const sample = rowsBack.find((r) => r.key === 'rates.hero.eyebrow')
  console.log('')
  console.log('  Exemple, rates.hero.eyebrow :')
  console.log('    value    =', JSON.stringify(sample?.value))
  console.log('    value_fr =', JSON.stringify(sample?.value_fr))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
