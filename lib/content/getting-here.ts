/**
 * Editable copy for the /getting-here page.
 *
 * Same mechanism as the homepage, rates and villa registries: the page keeps
 * its English text as the `t(key, fallback)` fallback, the operator overrides
 * any key from /admin/content/getting-here, and all of them share the
 * `site_content` table.
 *
 * The flight table gets one group per route rather than one long list: a route
 * is the unit an operator actually edits when a carrier drops a season, and a
 * card per route keeps its five fields together.
 *
 * The type import below is erased at compile time, so this file and
 * `registry.ts` referencing each other creates no runtime cycle.
 */
import type { ContentGroup } from './registry'

/** Route rows, in display order. The key prefix is what ties a group to a row. */
export const GETTING_HERE_ROUTES = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'] as const

const routeGroup = (id: string, city: string): ContentGroup => ({
  title: `Comment venir : vol ${id.slice(1)}, ${city}`,
  fields: [
    { key: `gh.route.${id}.from`, label: 'Ville de départ' },
    { key: `gh.route.${id}.iata`, label: 'Codes aéroports' },
    { key: `gh.route.${id}.carriers`, label: 'Compagnies', multiline: true },
    { key: `gh.route.${id}.duration`, label: 'Durée' },
    { key: `gh.route.${id}.note`, label: 'Note (vide = aucune)', multiline: true },
  ],
})

export const GETTING_HERE_CONTENT_GROUPS: ContentGroup[] = [
  {
    title: 'Comment venir : en-tête',
    fields: [
      { key: 'gh.hero.eyebrow', label: 'Sur-titre' },
      { key: 'gh.hero.title1', label: 'Titre, ligne 1 (italique)' },
      { key: 'gh.hero.title2', label: 'Titre, ligne 2 (doré)' },
      { key: 'gh.hero.subtitle', label: 'Sous-titre', multiline: true, rows: 4 },
    ],
  },
  {
    title: 'Comment venir : recherche de vols',
    fields: [
      { key: 'gh.search.eyebrow', label: 'Sur-titre' },
      { key: 'gh.search.title', label: 'Titre de section' },
      { key: 'gh.search.intro', label: 'Intro', multiline: true, rows: 4 },
    ],
  },
  {
    title: 'Comment venir : tableau des liaisons',
    fields: [
      { key: 'gh.routes.eyebrow', label: 'Sur-titre' },
      { key: 'gh.routes.title', label: 'Titre de section' },
      { key: 'gh.routes.intro', label: 'Intro', multiline: true, rows: 3 },
      { key: 'gh.routes.th_from', label: 'Colonne 1, en-tête' },
      { key: 'gh.routes.th_route', label: 'Colonne 2, en-tête' },
      { key: 'gh.routes.th_carriers', label: 'Colonne 3, en-tête' },
      { key: 'gh.routes.th_duration', label: 'Colonne 4, en-tête' },
      { key: 'gh.routes.footnote', label: 'Note sous le tableau', multiline: true },
    ],
  },
  routeGroup('r1', 'Los Angeles'),
  routeGroup('r2', 'San Francisco'),
  routeGroup('r3', 'Seattle'),
  routeGroup('r4', 'New York et Boston'),
  routeGroup('r5', 'Paris'),
  routeGroup('r6', 'Auckland'),
  routeGroup('r7', 'Tokyo'),
  {
    title: 'Comment venir : transfert aéroport',
    fields: [
      { key: 'gh.transfer.title', label: 'Titre' },
      { key: 'gh.transfer.body', label: 'Texte', multiline: true, rows: 4 },
    ],
  },
  {
    title: 'Comment venir : à savoir avant de partir',
    fields: [
      { key: 'gh.essentials.eyebrow', label: 'Sur-titre' },
      { key: 'gh.essentials.title', label: 'Titre de section' },
      { key: 'gh.essentials.e1.label', label: 'Carte 1, intitulé' },
      { key: 'gh.essentials.e1.value', label: 'Carte 1, texte', multiline: true },
      { key: 'gh.essentials.e2.label', label: 'Carte 2, intitulé' },
      { key: 'gh.essentials.e2.value', label: 'Carte 2, texte', multiline: true },
      { key: 'gh.essentials.e3.label', label: 'Carte 3, intitulé' },
      { key: 'gh.essentials.e3.value', label: 'Carte 3, texte', multiline: true },
      { key: 'gh.essentials.e4.label', label: 'Carte 4, intitulé' },
      { key: 'gh.essentials.e4.value', label: 'Carte 4, texte', multiline: true },
    ],
  },
  {
    title: 'Comment venir : appel à l’action final',
    fields: [
      { key: 'gh.cta.eyebrow', label: 'Sur-titre' },
      { key: 'gh.cta.title', label: 'Titre' },
      { key: 'gh.cta.subtitle', label: 'Sous-titre', multiline: true, rows: 3 },
      { key: 'gh.cta.primary', label: 'Bouton principal' },
      { key: 'gh.cta.secondary', label: 'Bouton secondaire' },
    ],
  },
]

/**
 * Published English text per key. MUST mirror the `t(key, 'fallback')`
 * fallbacks in `app/(marketing)/getting-here/page.tsx`, which is what the
 * public page shows when no override exists.
 */
export const GETTING_HERE_CONTENT_DEFAULTS: Readonly<Record<string, string>> = {
  // En-tête
  'gh.hero.eyebrow': 'Getting Here',
  'gh.hero.title1': 'Plan your journey',
  'gh.hero.title2': 'to paradise.',
  'gh.hero.subtitle':
    'Tahiti is closer than you think: nonstop from the US West Coast in about eight hours. Below, the routes our guests use most, a quick way to search live flights, and the essentials for a smooth arrival.',
  // Recherche de vols
  'gh.search.eyebrow': 'Live search',
  'gh.search.title': 'Check fares & schedules',
  'gh.search.intro':
    'Pick your departure city and dates, and Skyscanner opens in a focused popup, pre-filled with your search. We may earn a small commission if you book through that link, at no extra cost to you.',
  // Tableau des liaisons
  'gh.routes.eyebrow': 'Direct & one-stop routes',
  'gh.routes.title': 'Flying to Tahiti (PPT)',
  'gh.routes.intro':
    "Tahiti's international airport, Faa'a (IATA code PPT), is a 25-minute drive from the villa. We'll arrange the transfer if you let us know your flight.",
  'gh.routes.th_from': 'From',
  'gh.routes.th_route': 'Route',
  'gh.routes.th_carriers': 'Carriers',
  'gh.routes.th_duration': 'Duration',
  'gh.routes.footnote':
    'Seasonal services (Delta, Air Tahiti Nui Tokyo) vary by month. The Skyscanner search above reflects current availability.',
  // Liaisons
  'gh.route.r1.from': 'Los Angeles',
  'gh.route.r1.iata': 'LAX → PPT',
  'gh.route.r1.carriers': 'Air Tahiti Nui, French Bee, Delta (seasonal)',
  'gh.route.r1.duration': '≈ 8h 20m direct',
  'gh.route.r1.note': 'Daily departures year-round.',
  'gh.route.r2.from': 'San Francisco',
  'gh.route.r2.iata': 'SFO → PPT',
  'gh.route.r2.carriers': 'United Airlines, French Bee',
  'gh.route.r2.duration': '≈ 8h direct',
  'gh.route.r2.note':
    'United has flown this route nonstop since late 2022, the only US legacy carrier serving Tahiti direct.',
  'gh.route.r3.from': 'Seattle',
  'gh.route.r3.iata': 'SEA → PPT',
  'gh.route.r3.carriers': 'Delta (seasonal)',
  'gh.route.r3.duration': '≈ 9h direct',
  'gh.route.r3.note': 'Seasonal service. Check Skyscanner for current frequencies.',
  'gh.route.r4.from': 'New York / Boston',
  'gh.route.r4.iata': 'JFK / BOS → PPT',
  'gh.route.r4.carriers': 'United or Delta via LAX / SFO',
  'gh.route.r4.duration': '≈ 14h total',
  'gh.route.r4.note': '',
  'gh.route.r5.from': 'Paris',
  'gh.route.r5.iata': 'CDG → PPT',
  'gh.route.r5.carriers':
    'Air Tahiti Nui, French Bee, Air France (codeshare via LAX or SFO)',
  'gh.route.r5.duration': '≈ 22h total',
  'gh.route.r5.note': '',
  'gh.route.r6.from': 'Auckland',
  'gh.route.r6.iata': 'AKL → PPT',
  'gh.route.r6.carriers': 'Air Tahiti Nui',
  'gh.route.r6.duration': '≈ 5h direct',
  'gh.route.r6.note': '',
  'gh.route.r7.from': 'Tokyo',
  'gh.route.r7.iata': 'HND / NRT → PPT',
  'gh.route.r7.carriers': 'Air Tahiti Nui (seasonal)',
  'gh.route.r7.duration': '≈ 11h direct',
  'gh.route.r7.note': '',
  // Transfert aéroport
  'gh.transfer.title': 'Airport transfer',
  'gh.transfer.body':
    "Faa'a (PPT) to the villa is about 25 minutes by car. Share your flight number with us at booking and we'll have a private transfer ready at arrival, included for stays of seven nights or more, otherwise from $80 one-way.",
  // À savoir avant de partir
  'gh.essentials.eyebrow': 'Before you fly',
  'gh.essentials.title': 'Travel essentials',
  'gh.essentials.e1.label': 'Visa',
  'gh.essentials.e1.value':
    'Visa-free for US, EU, UK, Canada, Australia, NZ, up to 90 days.',
  'gh.essentials.e2.label': 'Currency',
  'gh.essentials.e2.value':
    'CFP Franc (XPF). USD and EUR widely accepted; cards work everywhere.',
  'gh.essentials.e3.label': 'Time zone',
  'gh.essentials.e3.value': 'UTC−10 (same as Hawaii, no daylight saving).',
  'gh.essentials.e4.label': 'Language',
  'gh.essentials.e4.value':
    'French and Tahitian. English is spoken at the villa and most hotels.',
  // Appel à l'action final
  'gh.cta.eyebrow': 'Ready when you are',
  'gh.cta.title': 'Lock in your dates.',
  'gh.cta.subtitle':
    'Once your flights are sorted, secure the villa for those nights with a 30% deposit. Cancellation is flexible up to 60 days out.',
  'gh.cta.primary': 'Check availability',
  'gh.cta.secondary': 'Ask a travel question',
}
