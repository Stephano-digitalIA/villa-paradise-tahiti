/**
 * One-off: archive the French source for the /contact copy.
 *
 * Same contract as the other seed scripts: writes only `value_fr`. `value`
 * (the English the public site publishes) is left alone, so every key keeps
 * falling back to its in-code default in `lib/content/contact.ts` and the live
 * page does not change.
 *
 * Run: npx tsx --env-file=.env.local scripts/seed-contact-fr.ts
 */
import { createClient } from '@supabase/supabase-js'

import { CONTACT_CONTENT_GROUPS } from '../lib/content/contact'

const FRENCH: ReadonlyArray<readonly [string, string]> = [
  // En-tête
  ['contact.hero.eyebrow', 'Nous contacter'],
  ['contact.hero.title', 'Nous sommes là pour préparer votre séjour'],
  [
    'contact.hero.subtitle',
    'Une question, une demande particulière, ou prêt à réserver ? Notre conciergerie est sur place et répond sous quatre heures.',
  ],
  // Introduction du formulaire
  ['contact.form.eyebrow', 'Formulaire de demande'],
  ['contact.form.title', 'Parlez-nous de votre voyage'],
  [
    'contact.form.intro',
    'Indiquez vos dates, le nombre de voyageurs et tout ce qui rendrait le séjour parfait. Plus nous en savons, mieux nous pouvons l’adapter.',
  ],
  // Champs du formulaire
  ['contact.field.name', 'Nom complet'],
  ['contact.field.email', 'Email'],
  ['contact.field.phone', 'Téléphone'],
  ['contact.field.phone_helper', 'Pour vous joindre plus vite si besoin.'],
  ['contact.field.optional', 'Facultatif'],
  ['contact.field.dates_legend', 'Dates de voyage'],
  ['contact.field.arrival', 'Arrivée'],
  ['contact.field.arrival_aria', 'Choisir une date d’arrivée'],
  ['contact.field.departure', 'Départ'],
  ['contact.field.departure_aria', 'Choisir une date de départ'],
  ['contact.field.guests', 'Nombre de voyageurs'],
  ['contact.field.message', 'Comment pouvons-nous vous aider ?'],
  [
    'contact.field.message_helper',
    'Décrivez votre projet de voyage, vos questions ou vos demandes particulières (20 caractères minimum).',
  ],
  ['contact.field.submit', 'Envoyer ma demande'],
  ['contact.field.submitting', 'Envoi en cours…'],
  [
    'contact.field.error',
    'Une erreur est survenue. Réessayez ou écrivez-nous directement par email.',
  ],
  ['contact.field.privacy_text', 'En envoyant ce formulaire, vous acceptez notre'],
  ['contact.field.privacy_link', 'politique de confidentialité'],
  // Message de confirmation
  ['contact.success.title', 'Merci.'],
  [
    'contact.success.body',
    'Nous revenons vers vous sous 4 heures (heure de Tahiti, UTC−10). En attendant, découvrez nos',
  ],
  ['contact.success.link', 'prestations sur mesure'],
  ['contact.success.again', 'Envoyer une autre demande'],
  // Coordonnées
  ['contact.info.title', 'Nous joindre directement'],
  [
    'contact.info.intro',
    'Notre conciergerie est basée à Tahiti et répond en français, en anglais et en tahitien.',
  ],
  ['contact.info.label_email', 'Email'],
  ['contact.info.label_phone', 'Téléphone et WhatsApp'],
  ['contact.info.label_response', 'Délai de réponse'],
  ['contact.info.response_value', 'Nous répondons sous 4 heures'],
  ['contact.info.response_sub', 'Heure de Tahiti (UTC−10), 7 jours sur 7'],
  ['contact.info.label_location', 'Localisation'],
  ['contact.info.location_value', 'Punaauia, Tahiti, Polynésie française'],
  // Chiffres clés
  ['contact.stat.s1.value', '4 heures'],
  ['contact.stat.s1.label', 'Délai de réponse moyen'],
  [
    'contact.stat.s1.body',
    'De vraies personnes, vraiment réactives. Notre conciergerie répond sous quatre heures pendant la journée à Tahiti.',
  ],
  ['contact.stat.s2.value', '98 %'],
  ['contact.stat.s2.label', 'Voyageurs satisfaits'],
  [
    'contact.stat.s2.body',
    'Sur la base de plus de 47 avis vérifiés après séjour, en direct comme sur Airbnb et Vrbo.',
  ],
  ['contact.stat.s3.value', '100 %'],
  ['contact.stat.s3.label', 'Paiements sécurisés'],
  [
    'contact.stat.s3.body',
    'Protégés par PayPal. Vos données de carte ne sont jamais conservées sur nos serveurs.',
  ],
]

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing Supabase env vars.')
  const db = createClient(url, serviceKey)

  const known = new Set(CONTACT_CONTENT_GROUPS.flatMap((g) => g.fields.map((f) => f.key)))
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
  console.log('AVANT : lignes contact.* deja presentes =', before?.length ?? 0)

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

  const sample = rowsBack.find((r) => r.key === 'contact.hero.eyebrow')
  console.log('')
  console.log('  Exemple, contact.hero.eyebrow :')
  console.log('    value    =', JSON.stringify(sample?.value))
  console.log('    value_fr =', JSON.stringify(sample?.value_fr))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
